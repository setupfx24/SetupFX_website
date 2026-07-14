"""Deep historical candles for FX / metals / indices from Yahoo Finance's
free chart API (no key). We have no kline REST for these instruments (Binance
is crypto-only, Infoway REST isn't wired), so this seeds ohlcv_<tf> with real
history — years of daily, months of intraday — so the chart isn't empty.

Yahoo's price is close to the broker's (both real market), so the seam where
this history meets our live tick-built candle is tiny. Crypto is NOT fetched
here (it has exact Binance history). Idempotent (ON CONFLICT upsert).

    python -m src.yahoo_history            # all mapped symbols
    python -m src.yahoo_history XAUUSD     # one symbol
"""
import asyncio
import logging
import sys

import httpx

from .store import BarStore

logger = logging.getLogger("yahoo-history")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-5s %(message)s")

TF_SECONDS = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400}

# Broker symbol → Yahoo symbol. FX pairs use "=X", metals/oil use futures
# "=F" (spot-equivalent), indices use "^".
YAHOO_MAP = {
    "EURUSD": "EURUSD=X", "GBPUSD": "GBPUSD=X", "USDJPY": "USDJPY=X",
    "AUDUSD": "AUDUSD=X", "USDCAD": "USDCAD=X", "USDCHF": "USDCHF=X",
    "NZDUSD": "NZDUSD=X", "EURJPY": "EURJPY=X", "GBPJPY": "GBPJPY=X",
    "XAUUSD": "GC=F", "XAGUSD": "SI=F", "USOIL": "CL=F",
    "US30": "^DJI", "US500": "^GSPC", "NAS100": "^NDX",
    "GER40": "^GDAXI", "UK100": "^FTSE", "JP225": "^N225",
}

# TF → (yahoo interval, yahoo range). Yahoo caps intraday range per interval.
# 4h isn't a Yahoo interval → we derive it from the 1h pull.
_TF_YAHOO = {
    "1m": ("1m", "7d"),
    "5m": ("5m", "60d"),
    "15m": ("15m", "60d"),
    "30m": ("30m", "60d"),
    "1h": ("60m", "730d"),
    "1d": ("1d", "max"),
}

_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SetupFX/1.0)"}
_CALL_SPACING = 0.4


def _grid_snap(bars, bar_sec):
    slots = {}
    for b in bars:
        t = int(b["time"])
        slot = (t // bar_sec) * bar_sec
        slots.setdefault(slot, {**b, "time": slot})
        if t % bar_sec == 0:
            slots[slot] = {**b, "time": slot}
    return [slots[k] for k in sorted(slots)]


def _aggregate(bars, bar_sec):
    """Roll smaller bars up into bar_sec buckets (used to derive 4h from 1h)."""
    buckets = {}
    for b in sorted(bars, key=lambda x: x["time"]):
        slot = (int(b["time"]) // bar_sec) * bar_sec
        bk = buckets.get(slot)
        if not bk:
            buckets[slot] = {"time": slot, "open": b["open"], "high": b["high"],
                             "low": b["low"], "close": b["close"], "volume": 0}
        else:
            bk["high"] = max(bk["high"], b["high"])
            bk["low"] = min(bk["low"], b["low"])
            bk["close"] = b["close"]
    return [buckets[k] for k in sorted(buckets)]


async def _fetch_yahoo(client, ysym, interval, rng):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ysym}"
    try:
        r = await client.get(url, params={"interval": interval, "range": rng},
                             headers=_HEADERS, timeout=25.0)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        logger.warning("yahoo fetch %s %s/%s failed: %s", ysym, interval, rng, e)
        return []
    try:
        res = (data.get("chart", {}).get("result") or [None])[0]
        if not res:
            return []
        ts = res.get("timestamp") or []
        quote = ((res.get("indicators", {}).get("quote") or [{}])[0]) or {}
        opens, highs, lows, closes = (
            quote.get("open") or [], quote.get("high") or [],
            quote.get("low") or [], quote.get("close") or [],
        )
        bars = []
        for i, t in enumerate(ts):
            o, h, l, c = (opens[i] if i < len(opens) else None,
                          highs[i] if i < len(highs) else None,
                          lows[i] if i < len(lows) else None,
                          closes[i] if i < len(closes) else None)
            if None in (o, h, l, c):
                continue
            bars.append({"time": int(t), "open": float(o), "high": float(h),
                         "low": float(l), "close": float(c), "volume": 0})
        return bars
    except Exception as e:
        logger.warning("yahoo parse %s failed: %s", ysym, e)
        return []


async def _backfill_symbol(store, client, sym, ysym):
    hourly = []
    for tf, (interval, rng) in _TF_YAHOO.items():
        bars = await _fetch_yahoo(client, ysym, interval, rng)
        await asyncio.sleep(_CALL_SPACING)
        if not bars:
            continue
        bars = _grid_snap(bars, TF_SECONDS[tf])
        for b in bars:
            await store.upsert_bar(tf, sym, b["time"], b["open"], b["high"], b["low"], b["close"], 0, 0)
        if tf == "1h":
            hourly = bars
        logger.info("  %s %s: %d bars", sym, tf, len(bars))
    # Derive 4h from the 1h pull (Yahoo has no 4h interval).
    if hourly:
        fourh = _aggregate(hourly, TF_SECONDS["4h"])
        for b in fourh:
            await store.upsert_bar("4h", sym, b["time"], b["open"], b["high"], b["low"], b["close"], 0, 0)
        logger.info("  %s 4h: %d bars (derived)", sym, len(fourh))


async def backfill_yahoo(symbols=None):
    store = BarStore()
    await store.ensure_schema()
    syms = [s.upper() for s in (symbols or list(YAHOO_MAP.keys()))]
    async with httpx.AsyncClient() as client:
        for sym in syms:
            ysym = YAHOO_MAP.get(sym)
            if not ysym:
                continue
            logger.info("Yahoo backfill %s (%s)…", sym, ysym)
            try:
                await _backfill_symbol(store, client, sym, ysym)
            except Exception as e:
                logger.warning("  %s failed: %s", sym, e)
    logger.info("Yahoo backfill complete.")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    asyncio.run(backfill_yahoo(args or None))
