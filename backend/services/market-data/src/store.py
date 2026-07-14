"""Tick Store — Writes tick data to TimescaleDB."""
import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import text
from packages.common.src.database import TimescaleSessionLocal

logger = logging.getLogger("market-data.store")

# Aggregator timeframe → durable OHLCV table. These are the base resolutions
# the bars API serves; the charting library builds every other TF client-side.
OHLCV_TABLES = {
    "1m": "ohlcv_1m",
    "5m": "ohlcv_5m",
    "15m": "ohlcv_15m",
    "30m": "ohlcv_30m",
    "1h": "ohlcv_1h",
    "4h": "ohlcv_4h",
    "1d": "ohlcv_1d",
}


def _parse_tick_time(ts: str) -> datetime:
    """Infoway / feed timestamps are ISO strings; asyncpg needs datetime."""
    t = (ts or "").strip()
    if not t:
        return datetime.now(timezone.utc)
    if t.endswith("Z"):
        t = t[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(t)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return datetime.now(timezone.utc)


class TickStore:
    def __init__(self):
        self._batch: list[tuple] = []
        self._batch_size = 100
        # Time-based flush so a low-volume symbol mix never leaves ticks
        # sitting unwritten (the old code only flushed at 100 rows and never
        # on shutdown, so up to 99 ticks could be lost on restart).
        self._flush_after_sec = 2.0
        self._last_flush = 0.0
        self._lock = asyncio.Lock()
        self._initialized = False

    async def init(self):
        self._initialized = True
        self._last_flush = _monotonic()
        logger.info("Tick store initialized")

    async def insert_tick(self, symbol: str, bid: float, ask: float, timestamp: str):
        async with self._lock:
            self._batch.append((_parse_tick_time(timestamp), symbol, bid, ask))
            due = (
                len(self._batch) >= self._batch_size
                or (_monotonic() - self._last_flush) >= self._flush_after_sec
            )
        if due:
            await self._flush()

    async def flush_pending(self):
        """Explicit flush — call on shutdown so in-flight ticks aren't lost."""
        await self._flush()

    async def _flush(self):
        async with self._lock:
            if not self._batch:
                return
            batch = self._batch[:]
            self._batch.clear()
            self._last_flush = _monotonic()

        try:
            # One multi-row INSERT instead of a loop of single-row statements.
            async with TimescaleSessionLocal() as session:
                await session.execute(
                    text(
                        "INSERT INTO ticks (time, symbol, bid, ask) "
                        "VALUES (:time, :symbol, :bid, :ask)"
                    ),
                    [
                        {"time": ts, "symbol": sym, "bid": bid, "ask": ask}
                        for ts, sym, bid, ask in batch
                    ],
                )
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to flush ticks: {e}")


def _monotonic() -> float:
    import time as _t
    return _t.monotonic()


class BarStore:
    """Durable OHLCV persistence. The Redis lists are a hot cache (capped at
    1000 bars); THIS is the real history. Upserts are idempotent on
    (symbol, time) so the reconcile/backfill loops can re-assert provider
    values without creating duplicates."""

    def __init__(self):
        self._ready = False

    async def ensure_schema(self):
        """Create the 30m table (missing from init-timescale.sql) and the
        UNIQUE(symbol, time) indexes every TF needs for ON CONFLICT upserts.
        Idempotent — safe to run on every startup on an existing volume."""
        try:
            async with TimescaleSessionLocal() as session:
                await session.execute(text(
                    """
                    CREATE TABLE IF NOT EXISTS ohlcv_30m (
                        time TIMESTAMPTZ NOT NULL,
                        symbol VARCHAR(20) NOT NULL,
                        open DECIMAL(18,8) NOT NULL,
                        high DECIMAL(18,8) NOT NULL,
                        low DECIMAL(18,8) NOT NULL,
                        close DECIMAL(18,8) NOT NULL,
                        volume DECIMAL(18,4) DEFAULT 0,
                        tick_count INT DEFAULT 0
                    )
                    """
                ))
                await session.execute(text(
                    "SELECT create_hypertable('ohlcv_30m', 'time', if_not_exists => TRUE)"
                ))
                # A hypertable UNIQUE index must include the partition column
                # (time) — (symbol, time) satisfies that and enforces one row
                # per candle slot.
                for tbl in OHLCV_TABLES.values():
                    await session.execute(text(
                        f"CREATE UNIQUE INDEX IF NOT EXISTS {tbl}_symbol_time_uidx "
                        f"ON {tbl} (symbol, time)"
                    ))
                await session.commit()
            self._ready = True
            logger.info("OHLCV durable schema ready (ohlcv_30m + unique indexes)")
        except Exception as e:
            logger.error("BarStore.ensure_schema failed (durable OHLCV disabled): %s", e)

    async def upsert_bar(
        self, timeframe: str, symbol: str, time_epoch: int,
        o: float, h: float, l: float, c: float, volume: float, tick_count: int,
    ):
        if not self._ready:
            return
        table = OHLCV_TABLES.get(timeframe)
        if not table:
            return
        ts = datetime.fromtimestamp(time_epoch, tz=timezone.utc)
        try:
            async with TimescaleSessionLocal() as session:
                await session.execute(
                    text(
                        f"INSERT INTO {table} "
                        "(time, symbol, open, high, low, close, volume, tick_count) "
                        "VALUES (:time, :symbol, :o, :h, :l, :c, :v, :tc) "
                        "ON CONFLICT (symbol, time) DO UPDATE SET "
                        "open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low, "
                        "close=EXCLUDED.close, volume=EXCLUDED.volume, "
                        "tick_count=EXCLUDED.tick_count"
                    ),
                    {"time": ts, "symbol": symbol, "o": o, "h": h, "l": l,
                     "c": c, "v": volume, "tc": tick_count},
                )
                await session.commit()
        except Exception as e:
            logger.debug("upsert_bar %s %s failed: %s", table, symbol, e)
