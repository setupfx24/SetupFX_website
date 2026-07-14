"""Build OHLCV history from the broker's OWN stored ticks (TimescaleDB).

The chart's single price basis IS our tick stream, and every tick is persisted
to the `ticks` hypertable. Aggregating that into ohlcv_<tf> gives seam-free
historical candles with NO external provider and no provider-mixing — exactly
the "save history in the DB, serve history from the DB" flow.

This is how FX / metals / indices get history (we have no kline REST for them).
Crypto history comes from Binance (backfill.py / reconcile.py), so crypto
symbols are skipped here to avoid clobbering those exact bars.

Bars are MID-based, matching the live aggregator (the stored bid/ask already
carry the admin spread, so mid = the same basis the forming candle uses).

Idempotent (ON CONFLICT upsert) — safe to run repeatedly or on startup:
    python -m src.backfill_from_ticks
"""
import asyncio
import logging

from sqlalchemy import text, bindparam

from packages.common.src.database import TimescaleSessionLocal
from .store import BarStore, OHLCV_TABLES

logger = logging.getLogger("backfill-ticks")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-5s %(message)s")

# Aggregator TF → TimescaleDB time_bucket interval.
_TF_BUCKET = {
    "1m": "1 minute", "5m": "5 minutes", "15m": "15 minutes", "30m": "30 minutes",
    "1h": "1 hour", "4h": "4 hours", "1d": "1 day",
}

# Crypto: history comes from Binance, not from ticks — skip so we never
# overwrite the exact Binance bars with tick-built ones.
_CRYPTO = [
    "BTCUSD", "ETHUSD", "LTCUSD", "XRPUSD", "SOLUSD", "BNBUSD", "DOGEUSD", "ADAUSD",
]


async def backfill_from_ticks() -> int:
    """Aggregate the ticks table into every base-resolution ohlcv table.
    Returns the total number of candle rows written/updated."""
    store = BarStore()
    await store.ensure_schema()
    total = 0
    async with TimescaleSessionLocal() as s:
        for tf, table in OHLCV_TABLES.items():
            bucket = _TF_BUCKET[tf]
            sql = text(
                f"""
                INSERT INTO {table} (time, symbol, open, high, low, close, volume, tick_count)
                SELECT time_bucket(CAST(:bucket AS interval), time) AS t,
                       symbol,
                       (first(bid, time) + first(ask, time)) / 2.0 AS open,
                       max((bid + ask) / 2.0) AS high,
                       min((bid + ask) / 2.0) AS low,
                       (last(bid, time) + last(ask, time)) / 2.0 AS close,
                       0 AS volume,
                       count(*) AS tick_count
                FROM ticks
                WHERE symbol NOT IN :crypto
                GROUP BY t, symbol
                ON CONFLICT (symbol, time) DO UPDATE SET
                    open = EXCLUDED.open, high = EXCLUDED.high, low = EXCLUDED.low,
                    close = EXCLUDED.close, tick_count = EXCLUDED.tick_count
                """
            ).bindparams(bindparam("crypto", expanding=True))
            try:
                res = await s.execute(sql, {"bucket": bucket, "crypto": _CRYPTO})
                await s.commit()
                n = res.rowcount or 0
                total += n
                logger.info("ticks → %s: %d candles", table, n)
            except Exception as e:
                await s.rollback()
                logger.warning("ticks → %s failed: %s", table, e)
    logger.info("Tick backfill complete: %d candle rows.", total)
    return total


if __name__ == "__main__":
    asyncio.run(backfill_from_ticks())
