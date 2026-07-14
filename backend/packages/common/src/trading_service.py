"""Trading Service — Reusable business logic extracted from route handlers.

Keeps route files thin by centralising price fetching, account validation,
margin calculations, and position P&L computation.
"""
import json
import logging
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    Instrument, InstrumentConfig, Order, OrderSide, OrderStatus,
    Position, PositionStatus, TradingAccount,
)
from .redis_client import redis_client, PriceChannel

logger = logging.getLogger("trading_service")

# Max tick age (seconds) that may drive an SL/TP / stop-out / liquidation. A
# dead feed must never trigger a phantom close — past this, closers update
# display fields only and skip risk actions.
STALE_TICK_MAX_AGE_SEC = 60.0


async def claim_close(session: AsyncSession, position_id) -> bool:
    """Atomically claim a position for closing (the idempotent close guard).

    Flips status open→closed in ONE conditional UPDATE and returns True iff
    THIS caller won the race (rowcount 1). Every closer — the 100ms monitor,
    the 1s engine, stop-out, and manual close — must call this and bail on
    False, otherwise racing closers double-book P&L and duplicate history rows.

    The flip goes straight to 'closed' (not a transient 'closing') because the
    position_status enum has no 'closing' value and, run inside the caller's
    transaction, a direct flip auto-rolls-back if the rest of the close fails —
    so a crash mid-close leaves the position re-closable, never stuck.
    """
    res = await session.execute(
        text("UPDATE positions SET status = 'closed' WHERE id = :id AND status = 'open'"),
        {"id": str(position_id)},
    )
    return (res.rowcount or 0) == 1


def tick_is_fresh(tick: dict, max_age_sec: float = STALE_TICK_MAX_AGE_SEC) -> bool:
    """True if the tick carries a timestamp no older than max_age_sec. Missing
    or unparseable timestamps are treated as STALE (fail-safe: don't trigger)."""
    from datetime import datetime, timezone
    ts = tick.get("timestamp") if isinstance(tick, dict) else None
    if not ts:
        return False
    try:
        s = str(ts).replace("Z", "+00:00")
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        age = (datetime.now(timezone.utc) - dt).total_seconds()
        return age <= max_age_sec
    except (ValueError, TypeError):
        return False


class TradingServiceError(Exception):
    """Raised when a trading operation cannot proceed."""

    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


# ─── Price ────────────────────────────────────────────────────────────────

async def get_current_price(symbol: str) -> tuple[Decimal, Decimal]:
    """Fetch the latest bid/ask from Redis. Raises TradingServiceError if unavailable."""
    tick_data = await redis_client.get(PriceChannel.tick_key(symbol))
    if not tick_data:
        raise TradingServiceError(f"No price available for {symbol}")
    tick = json.loads(tick_data)
    return Decimal(str(tick["bid"])), Decimal(str(tick["ask"]))


# ─── Account ──────────────────────────────────────────────────────────────

async def validate_account(
    account_id: UUID,
    user_id: UUID,
    db: AsyncSession,
    *,
    load_group: bool = True,
) -> TradingAccount:
    """Load and validate a trading account belongs to the user and is active."""
    query = select(TradingAccount).where(
        TradingAccount.id == account_id,
        TradingAccount.user_id == user_id,
    )
    if load_group:
        query = query.options(selectinload(TradingAccount.account_group))

    result = await db.execute(query)
    account = result.scalar_one_or_none()
    if not account:
        raise TradingServiceError("Account not found", 404)
    if not account.is_active:
        raise TradingServiceError("Account is not active", 403)
    return account


# ─── Instrument ───────────────────────────────────────────────────────────

async def get_instrument(symbol: str, db: AsyncSession) -> Instrument:
    """Load an active instrument by symbol."""
    result = await db.execute(
        select(Instrument).where(
            Instrument.symbol == symbol.upper(),
            Instrument.is_active == True,
        )
    )
    instrument = result.scalar_one_or_none()
    if not instrument:
        raise TradingServiceError(f"Instrument {symbol} not found", 404)
    return instrument


async def get_instrument_config(instrument_id: UUID, db: AsyncSession) -> InstrumentConfig | None:
    """Load instrument-specific config (spread, commission, etc.)."""
    result = await db.execute(
        select(InstrumentConfig).where(InstrumentConfig.instrument_id == instrument_id)
    )
    return result.scalar_one_or_none()


# ─── Margin ───────────────────────────────────────────────────────────────

def calc_margin(
    lots: Decimal,
    price: Decimal,
    contract_size: Decimal,
    leverage: int,
) -> Decimal:
    """Calculate required margin for a position."""
    return (lots * contract_size * price) / Decimal(str(leverage))


def calc_free_margin(account: TradingAccount) -> Decimal:
    """Return the free margin available for new trades."""
    equity = account.balance + account.credit
    return equity - account.margin_used


# ─── P&L ──────────────────────────────────────────────────────────────────

def _derive_currencies(symbol: str | None) -> tuple[str | None, str | None]:
    """Derive base/quote currencies from a standard symbol like USDJPY, XAUUSD.

    Standard forex (6-char) and metals/crypto follow BASE(3)+QUOTE(3) convention.
    Returns (None, None) for indices or non-standard symbols.
    """
    if not symbol or len(symbol) < 6:
        return None, None
    return symbol[:3].upper(), symbol[3:6].upper()


def quote_to_account_pnl(
    quote_pnl: Decimal,
    base_currency: str | None,
    quote_currency: str | None,
    ref_price: Decimal,
    account_currency: str = "USD",
    symbol: str | None = None,
) -> Decimal:
    """Convert a P&L value expressed in the instrument's quote currency to
    the account currency (default USD).

    Forex P&L formula (price_diff * lots * contract_size) yields a value in
    the QUOTE currency, not USD. For USD-base pairs (USDJPY, USDCAD, USDCHF)
    that must be divided by the current rate to express in USD; otherwise
    e.g. a 17 JPY profit is shown as $17. Crypto / metals / indices already
    quote in USD so the helper short-circuits.

    If base/quote currencies are unknown (NULL in DB), attempt to derive them
    from the *symbol* name (e.g. USDJPY → USD / JPY).
    """
    if quote_pnl == 0:
        return quote_pnl
    base = (base_currency or "").upper()
    quote = (quote_currency or "").upper()
    if not base or not quote:
        fb_base, fb_quote = _derive_currencies(symbol)
        base = base or (fb_base or "")
        quote = quote or (fb_quote or "")
    acct = (account_currency or "USD").upper()
    if quote == acct or not quote:
        return quote_pnl
    if base == acct:
        if ref_price and ref_price != 0:
            return quote_pnl / ref_price
        return quote_pnl
    # Cross pair: no cross rate available here; fall back to raw quote pnl.
    return quote_pnl


def calc_position_pnl(
    side: OrderSide,
    open_price: Decimal,
    current_price: Decimal,
    lots: Decimal,
    contract_size: Decimal,
    instrument=None,
    account_currency: str = "USD",
) -> Decimal:
    """Calculate unrealised P&L for a single position. When ``instrument``
    is supplied the result is converted from quote currency to the account
    currency; otherwise the raw quote-currency value is returned."""
    if side == OrderSide.BUY:
        raw = (current_price - open_price) * lots * contract_size
    else:
        raw = (open_price - current_price) * lots * contract_size
    if instrument is None:
        return raw
    return quote_to_account_pnl(
        raw,
        getattr(instrument, "base_currency", None),
        getattr(instrument, "quote_currency", None),
        current_price,
        account_currency,
        symbol=getattr(instrument, "symbol", None),
    )


async def calc_account_equity(
    account: TradingAccount,
    db: AsyncSession,
) -> tuple[Decimal, Decimal]:
    """Return (equity, unrealised_pnl) for an account based on live prices."""
    result = await db.execute(
        select(Position)
        .options(selectinload(Position.instrument))
        .where(
            Position.account_id == account.id,
            Position.status == PositionStatus.OPEN,
        )
    )
    positions = result.scalars().all()

    unrealised = Decimal("0")
    for pos in positions:
        try:
            bid, ask = await get_current_price(pos.instrument.symbol)
            price = bid if pos.side == OrderSide.BUY else ask
            unrealised += calc_position_pnl(
                pos.side, pos.open_price, price,
                pos.lots, pos.instrument.contract_size,
                instrument=pos.instrument,
            )
        except TradingServiceError:
            continue

    equity = account.balance + account.credit + unrealised
    return equity, unrealised
