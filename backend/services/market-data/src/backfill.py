"""Deep historical backfill — pages the provider's kline REST BACKWARD and
upserts into the durable ohlcv_<tf> store (Timescale). Idempotent and
resumable: every write is ON CONFLICT (symbol, time), so re-running only tops
up what's missing and never duplicates a candle.

Depth targets per timeframe (spec §4):
    1m=10d, 5m=60d, 15m=180d, 30m=1y, 1h=2y, 4h=5y, 1d=10y

Usage (inside the market-data container):
    python -m src.backfill                # all crypto symbols, all TFs
    python -m src.backfill BTCUSD ETHUSD  # specific symbols

Only crypto (Binance public REST) is wired here — it's the sole historical
kline provider available in this deployment. FX/metals/indices deep history
accrues from live ticks via the aggregator + the reconcile loop; when an
Infoway (or other) kline REST is added, register it in _PROVIDERS below and
this script backfills them the same way.
"""
import asyncio
import json
import logging
import sys
import time

import httpx

from packages.common.src.redis_client import redis_client
from .store import BarStore, OHLCV_TABLES

logger = logging.getLogger("backfill")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-5s %(message)s")

TF_SECONDS = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400}

# Depth per TF, in seconds.
_DAY = 86400
TARGET_DEPTH_SEC = {
    "1m": 10 * _DAY,
    "5m": 60 * _DAY,
    "15m": 180 * _DAY,
    "30m": 365 * _DAY,
    "1h": 2 * 365 * _DAY,
    "4h": 5 * 365 * _DAY,
    "1d": 10 * 365 * _DAY,
}

_TF_TO_BINANCE = {"1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m", "1h": "1h", "4h": "4h", "1d": "1d"}

BINANCE_PAIRS = {
    "BTCUSD": "BTCUSDT", "ETHUSD": "ETHUSDT", "LTCUSD": "LTCUSDT",
    "XRPUSD": "XRPUSDT", "SOLUSD": "SOLUSDT", "BNBUSD": "BNBUSDT",
    "DOGEUSD": "DOGEUSDT", "ADAUSD": "ADAUSDT",
}

_PAGE = 1000              # Binance max klines per request
_MIN_CALL_SPACING = 0.3   # ≥ this many seconds between REST calls (rate-limit)


def _grid_snap(bars: list[dict], bar_sec: int) -> list[dict]:
    """One bar per grid slot; a grid-aligned original always wins, an off-grid
    bar only fills an empty slot (mirrors the bars-API snap)."""
    slots: dict[int, dict] = {}
    for b in bars:
        t = int(b["time"])
        if t % bar_sec == 0:
            slots[t] = {**b, "time": t}
    for b in bars:
        t = int(b["time"])
        if t % bar_sec != 0:
            slot = (t // bar_sec) * bar_sec
            slots.setdefault(slot, {**b, "time": slot})
    return [slots[k] for k in sorted(slots)]


async def _binance_page(client: httpx.AsyncClient, pair: str, interval: str, end_ms: int) -> list[dict]:
    """One backward page ending at end_ms (inclusive)."""
    try:
        r = await client.get(
            "https://api.binance.com/api/v3/klines",
            params={"symbol": pair, "interval": interval, "endTime": end_ms, "limit": _PAGE},
            timeout=15.0,
        )
        r.raise_for_status()
        rows = r.json()
    except Exception as e:
        logger.warning("Binance page failed (%s %s @%s): %s", pair, interval, end_ms, e)
        return []
    out = []
    for k in rows:
        # [ openTime, open, high, low, close, volume, closeTime, ... ]
        out.append({
            "time": int(k[0]) // 1000,
            "open": float(k[1]), "high": float(k[2]), "low": float(k[3]),
            "close": float(k[4]), "volume": float(k[5]),
        })
    return out


async def _backfill_symbol_tf(store: BarStore, client: httpx.AsyncClient, symbol: str, tf: str):
    pair = BINANCE_PAIRS.get(symbol)
    if not pair:
        return
    interval = _TF_TO_BINANCE[tf]
    bar_sec = TF_SECONDS[tf]
    floor_epoch = int(time.time()) - TARGET_DEPTH_SEC[tf]

    collected: dict[int, dict] = {}
    end_ms = int(time.time() * 1000)
    empty_pages = 0
    while True:
        page = await _binance_page(client, pair, interval, end_ms)
        await asyncio.sleep(_MIN_CALL_SPACING)
        if not page:
            empty_pages += 1
            if empty_pages >= 2:
                break
            end_ms -= _PAGE * bar_sec * 1000
            continue
        empty_pages = 0
        for b in page:
            collected[b["time"]] = b
        oldest = min(b["time"] for b in page)
        if oldest <= floor_epoch:
            break
        # cursor: just before the oldest open time we saw
        end_ms = (oldest - 1) * 1000
        if len(collected) > 2_000_000:  # safety cap
            break

    bars = _grid_snap([b for b in collected.values() if b["time"] >= floor_epoch], bar_sec)
    if not bars:
        logger.info("  %s %s: no bars", symbol, tf)
        return

    for b in bars:
        await store.upsert_bar(tf, symbol, b["time"], b["open"], b["high"], b["low"], b["close"], b["volume"], 0)

    # Refresh the Redis hot cache (newest-first, capped at 1000).
    list_key = f"bars:{symbol}:{tf}"
    try:
        await redis_client.delete(list_key)
        recent = bars[-1000:]
        for b in reversed(recent):  # lpush oldest→newest leaves newest at index 0
            await redis_client.lpush(list_key, json.dumps({"symbol": symbol, "timeframe": tf, **b, "tick_count": 0}))
        await redis_client.ltrim(list_key, 0, 999)
    except Exception as e:
        logger.debug("redis refresh failed %s: %s", list_key, e)

    logger.info("  %s %s: %d bars (back to %s)", symbol, tf, len(bars),
                time.strftime("%Y-%m-%d", time.gmtime(bars[0]["time"])))


async def backfill(symbols: list[str] | None = None):
    store = BarStore()
    await store.ensure_schema()
    syms = [s.upper() for s in (symbols or list(BINANCE_PAIRS.keys()))]
    async with httpx.AsyncClient() as client:
        for sym in syms:
            if sym not in BINANCE_PAIRS:
                logger.info("Skipping %s (no historical kline provider wired)", sym)
                continue
            logger.info("Backfilling %s...", sym)
            for tf in OHLCV_TABLES:  # 1m,5m,15m,30m,1h,4h,1d
                try:
                    await _backfill_symbol_tf(store, client, sym, tf)
                except Exception as e:
                    logger.warning("  %s %s failed: %s", sym, tf, e)
    logger.info("Backfill complete.")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    asyncio.run(backfill(args or None))
