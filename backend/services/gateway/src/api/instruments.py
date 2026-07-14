"""Instruments API — List instruments, get current prices."""
import json as _json
import logging
import time as _time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.database import get_db, TimescaleSessionLocal
from packages.common.src.redis_client import redis_client
from packages.common.src.schemas import InstrumentResponse, TickData
from packages.common.src.instrumentation import get_rate_limiter
from ..services import instrument_service

router = APIRouter()
_limiter = get_rate_limiter()
_logger = logging.getLogger("gateway.instruments")

_TF_SECONDS = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400}
_OHLCV_TABLES = {
    "1m": "ohlcv_1m", "5m": "ohlcv_5m", "15m": "ohlcv_15m", "30m": "ohlcv_30m",
    "1h": "ohlcv_1h", "4h": "ohlcv_4h", "1d": "ohlcv_1d",
}
# How many bars a single request returns at most (TradingView countback).
_BARS_LIMIT = 5000


def _grid_snap(bars: list[dict], bar_sec: int) -> list[dict]:
    """Normalize to one bar per grid slot. Providers sometimes serve part of a
    range on an OFFSET grid (e.g. 1h bars at :30 alongside :00) which doubles
    every candle. Rule: a grid-aligned original always wins; an off-grid bar
    only snaps into an EMPTY slot. Must run in every path that merges bars."""
    slots: dict[int, dict] = {}
    for b in bars:                                   # pass 1 — aligned bars win
        t = int(b["time"])
        if t % bar_sec == 0:
            slots[t] = {**b, "time": t}
    for b in bars:                                   # pass 2 — off-grid fills gaps
        t = int(b["time"])
        if t % bar_sec != 0:
            slot = (t // bar_sec) * bar_sec
            if slot not in slots:
                slots[slot] = {**b, "time": slot}
    return [slots[k] for k in sorted(slots)]


def _strip_weekends(bars: list[dict]) -> list[dict]:
    """Drop Saturday/Sunday (UTC) bars for non-crypto instruments so FX/metals
    don't render a flat weekend gap."""
    out = []
    for b in bars:
        if datetime.fromtimestamp(int(b["time"]), tz=timezone.utc).weekday() < 5:
            out.append(b)
    return out


async def _fetch_ohlcv_durable(sym: str, tf: str, to_time: int, limit: int = _BARS_LIMIT) -> list[dict]:
    """Durable history from TimescaleDB — the real source of truth. Enforces
    ONLY the upper bound: it returns the latest `limit` bars at or before `to`,
    NOT bars filtered by `from` (on a closed market TradingView wants the last
    bars BEFORE `from`, e.g. Friday's gold on a Saturday)."""
    table = _OHLCV_TABLES.get(tf)
    if not table:
        return []
    to_ts = datetime.fromtimestamp(to_time, tz=timezone.utc) if to_time else None
    try:
        async with TimescaleSessionLocal() as s:
            rows = (await s.execute(
                text(
                    f"SELECT extract(epoch FROM time)::bigint AS t, open, high, low, close, volume "
                    f"FROM {table} WHERE symbol = :sym "
                    f"AND (:to_ts IS NULL OR time <= :to_ts) "
                    f"ORDER BY time DESC LIMIT :lim"
                ),
                {"sym": sym, "to_ts": to_ts, "lim": limit},
            )).all()
        bars = [
            {"time": int(r.t), "open": float(r.open), "high": float(r.high),
             "low": float(r.low), "close": float(r.close), "volume": float(r.volume or 0.0)}
            for r in rows
        ]
        bars.sort(key=lambda x: x["time"])
        return bars
    except Exception as e:
        _logger.debug("durable ohlcv read failed %s %s: %s", table, sym, e)
        return []


async def _persist_bars_durable(sym: str, tf: str, bars: list[dict]):
    """Persist on-demand provider bars so panning older permanently deepens
    history. Best-effort — relies on the UNIQUE(symbol,time) index the
    market-data service creates at startup."""
    table = _OHLCV_TABLES.get(tf)
    if not table or not bars:
        return
    try:
        async with TimescaleSessionLocal() as s:
            await s.execute(
                text(
                    f"INSERT INTO {table} (time, symbol, open, high, low, close, volume) "
                    "VALUES (:time, :symbol, :o, :h, :l, :c, :v) "
                    "ON CONFLICT (symbol, time) DO UPDATE SET "
                    "open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low, "
                    "close=EXCLUDED.close, volume=EXCLUDED.volume"
                ),
                [
                    {"time": datetime.fromtimestamp(int(b["time"]), tz=timezone.utc),
                     "symbol": sym, "o": b["open"], "h": b["high"], "l": b["low"],
                     "c": b["close"], "v": b.get("volume", 0.0)}
                    for b in bars
                ],
            )
            await s.commit()
    except Exception as e:
        _logger.debug("persist durable bars failed %s %s: %s", table, sym, e)

# TradingView resolution string → bar aggregator timeframe key
_TV_RESOLUTION_TO_TF: dict[str, str] = {
    "1": "1m", "5": "5m", "15": "15m", "30": "30m",
    "60": "1h", "240": "4h", "D": "1d", "1D": "1d",
}

# Resolution → Binance kline interval string
_TV_RESOLUTION_TO_BINANCE: dict[str, str] = {
    "1": "1m", "5": "5m", "15": "15m", "30": "30m",
    "60": "1h", "240": "4h", "D": "1d", "1D": "1d",
}

# Platform symbol → Binance REST pair (crypto only)
_BINANCE_PAIRS: dict[str, str] = {
    "BTCUSD": "BTCUSDT", "ETHUSD": "ETHUSDT", "LTCUSD": "LTCUSDT",
    "XRPUSD": "XRPUSDT", "SOLUSD": "SOLUSDT", "BNBUSD": "BNBUSDT",
    "DOGEUSD": "DOGEUSDT", "ADAUSD": "ADAUSDT",
}


async def _fetch_binance_klines(
    symbol: str, resolution: str, from_time: int, to_time: int,
) -> list[dict]:
    """Fetch historical klines from Binance public REST API (no key needed).

    Results are cached in Redis for 60s to avoid repeated API calls on chart
    pan/zoom, which makes subsequent loads instant.
    """
    import httpx

    pair = _BINANCE_PAIRS.get(symbol.upper())
    if not pair:
        return []

    tf = _TV_RESOLUTION_TO_BINANCE.get(resolution, "5m")

    # --- Check Redis cache first ---
    cache_key = f"binance_cache:{symbol}:{tf}"
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            all_bars: list[dict] = _json.loads(cached)
            # Filter by requested time range
            return [
                b for b in all_bars
                if (not from_time or b["time"] >= from_time)
                and (not to_time or b["time"] <= to_time)
            ]
    except Exception:
        pass

    # --- Fetch from Binance ---
    start_ms = from_time * 1000 if from_time else None
    end_ms = to_time * 1000 if to_time else None

    params: dict = {"symbol": pair, "interval": tf, "limit": 1000}
    if start_ms:
        params["startTime"] = start_ms
    if end_ms:
        params["endTime"] = end_ms

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://api.binance.com/api/v3/klines", params=params)
            if resp.status_code != 200:
                _logger.warning("Binance klines HTTP %s for %s", resp.status_code, symbol)
                return []
            data = resp.json()
    except Exception as exc:
        _logger.warning("Binance klines fetch failed for %s: %s", symbol, exc)
        return []

    bars = []
    for k in data:
        bars.append({
            "time": int(k[0]) // 1000,
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5]),
        })

    # --- Cache in Redis (60s TTL) ---
    if bars:
        try:
            await redis_client.set(cache_key, _json.dumps(bars), ex=60)
        except Exception:
            pass

    return bars


@router.get("/", response_model=list[InstrumentResponse])
async def list_instruments(
    segment: str | None = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    return await instrument_service.list_instruments(
        segment=segment, active_only=active_only, db=db,
    )


@router.get("/market-status")
async def get_market_status(db: AsyncSession = Depends(get_db)):
    """Return market open/closed status for every active instrument.

    Clients should poll this every 60 s (or on page focus) to refresh
    the market-open state without spamming the server.
    """
    return await instrument_service.get_market_status(db=db)


@router.get("/market-status/{symbol}")
async def get_symbol_market_status(symbol: str, db: AsyncSession = Depends(get_db)):
    """Return market status for a single symbol."""
    return await instrument_service.get_symbol_market_status(symbol=symbol, db=db)


@router.get("/prices/all")
@_limiter.exempt
async def get_all_prices():
    """Static path before /{symbol}/price so it is never captured as a symbol.
    Exempt from rate limiting — clients poll this sub-second for live prices."""
    return await instrument_service.get_all_prices()


@router.get("/{symbol}/price", response_model=TickData)
@_limiter.exempt
async def get_price(symbol: str):
    return await instrument_service.get_price(symbol=symbol)


@router.get("/{symbol}/bars")
@_limiter.exempt
async def get_bars(
    symbol: str,
    resolution: str = Query(default="5"),
    from_time: int = Query(default=0, alias="from"),
    to_time: int = Query(default=0, alias="to"),
):
    """Return MID-based OHLCV bars for the TradingView datafeed.

    Serving order (spec §4):
      1. Durable ohlcv_<tf> (TimescaleDB) — the real history.
      2. Redis list fallback (hot cache) if durable is unavailable/empty.
      3. On-demand provider fetch (crypto) when thin or panning older than
         cache — grid-snapped, merged, and PERSISTED so panning deepens history.
      4. Append the forming bar from bar:current:<SYM>:<TF>.

    Only the UPPER time bound is enforced; `from` is NOT a hard floor (a closed
    market must still return the latest bars before `from`, else a blank chart).
    """
    tf = _TV_RESOLUTION_TO_TF.get(resolution, "5m")
    sym = symbol.upper()
    bar_sec = _TF_SECONDS.get(tf, 300)
    is_crypto = sym in _BINANCE_PAIRS

    # --- 1. Durable history (upper bound only) ---
    bars = await _fetch_ohlcv_durable(sym, tf, to_time)

    # --- 2. Redis list fallback (upper bound only) ---
    if not bars:
        raw_list: list[bytes] = await redis_client.lrange(f"bars:{sym}:{tf}", 0, 999)
        for raw in raw_list:
            try:
                b = _json.loads(raw)
                t = int(b.get("time", 0))
                if to_time and t > to_time:
                    continue
                bars.append({
                    "time": t, "open": float(b["open"]), "high": float(b["high"]),
                    "low": float(b["low"]), "close": float(b["close"]),
                    "volume": float(b.get("volume", 0.0)),
                })
            except Exception:
                continue
        bars.sort(key=lambda x: x["time"])

    # --- 3. On-demand provider fetch (crypto): thin/stale, or panning older ---
    now_epoch = int(_time.time())
    has_recent = bars and (now_epoch - bars[-1]["time"]) < bar_sec * 3
    need_older = bool(from_time) and (not bars or bars[0]["time"] > from_time)
    if is_crypto and (not has_recent or need_older):
        lo = from_time or (now_epoch - _BARS_LIMIT * bar_sec)
        hi = to_time or now_epoch
        provider_bars = await _fetch_binance_klines(sym, resolution, lo, hi)
        if provider_bars:
            bars = _grid_snap(bars + provider_bars, bar_sec)
            await _persist_bars_durable(sym, tf, provider_bars)

    # Always grid-snap the merged set so no doubled candles survive.
    bars = _grid_snap(bars, bar_sec)

    # Weekend stripping for non-crypto (crypto is 24/7).
    if not is_crypto:
        bars = _strip_weekends(bars)

    # --- 4. Append the forming bar ---
    current_raw = await redis_client.get(f"bar:current:{sym}:{tf}")
    if current_raw:
        try:
            b = _json.loads(current_raw)
            bar_start = int(b.get("time") or (now_epoch // bar_sec) * bar_sec)
            weekend = (not is_crypto) and datetime.fromtimestamp(
                bar_start, tz=timezone.utc).weekday() >= 5
            if not weekend and (not to_time or bar_start <= to_time):
                bars = [x for x in bars if x["time"] != bar_start]
                bars.append({
                    "time": bar_start, "open": float(b["open"]), "high": float(b["high"]),
                    "low": float(b["low"]), "close": float(b["close"]),
                    "volume": float(b.get("volume", 0.0)),
                })
                bars.sort(key=lambda x: x["time"])
        except Exception:
            pass

    return {"s": "ok", "bars": bars, "noData": len(bars) == 0}
