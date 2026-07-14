"""Reconcile loop — continuously re-asserts the provider's OFFICIAL OHLC over
the last few CLOSED bars, round-robin and rate-limited. Our tick-built candles
are ~99% identical to the provider's; this upsert makes the closed ones
byte-exact so there's no visible seam where our history meets provider history.

NEVER touches the forming bar. Idempotent (ON CONFLICT upsert via BarStore), so
it's safe to run forever. Crypto (Binance public REST) only — FX/metals need a
provider kline REST that isn't wired in this deployment.
"""
import asyncio
import logging

import httpx

logger = logging.getLogger("reconcile")

BINANCE_PAIRS = {
    "BTCUSD": "BTCUSDT", "ETHUSD": "ETHUSDT", "LTCUSD": "LTCUSDT",
    "XRPUSD": "XRPUSDT", "SOLUSD": "SOLUSDT", "BNBUSD": "BNBUSDT",
    "DOGEUSD": "DOGEUSDT", "ADAUSD": "ADAUSDT",
}
_TF_TO_BINANCE = {"1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m", "1h": "1h", "4h": "4h", "1d": "1d"}

_RECONCILE_DEPTH = 6        # last N closed bars to re-assert
_CALL_SPACING_SEC = 2.0     # rate-limit between REST calls (round-robin)


async def _reconcile_one(client: httpx.AsyncClient, bar_store, symbol: str, tf: str):
    pair = BINANCE_PAIRS[symbol]
    interval = _TF_TO_BINANCE[tf]
    try:
        r = await client.get(
            "https://api.binance.com/api/v3/klines",
            params={"symbol": pair, "interval": interval, "limit": _RECONCILE_DEPTH + 1},
            timeout=15.0,
        )
        r.raise_for_status()
        rows = r.json()
    except Exception as e:
        logger.debug("reconcile fetch %s %s failed: %s", symbol, tf, e)
        return
    if not rows:
        return
    # The last kline is the CURRENT (forming) bucket — drop it, never overwrite
    # a live candle with a provider snapshot.
    for k in rows[:-1]:
        await bar_store.upsert_bar(
            tf, symbol, int(k[0]) // 1000,
            float(k[1]), float(k[2]), float(k[3]), float(k[4]), float(k[5]), 0,
        )


async def reconcile_loop(bar_store, is_running):
    """Round-robin over every (crypto symbol, timeframe), one REST call each
    with `_CALL_SPACING_SEC` between them. `is_running` is a callable → bool."""
    pairs = [(s, tf) for s in BINANCE_PAIRS for tf in _TF_TO_BINANCE]
    if not pairs:
        return
    idx = 0
    async with httpx.AsyncClient() as client:
        # Small head start so we don't hammer Binance the instant the service boots.
        await asyncio.sleep(30.0)
        while is_running():
            sym, tf = pairs[idx % len(pairs)]
            idx += 1
            try:
                await _reconcile_one(client, bar_store, sym, tf)
            except Exception as e:
                logger.debug("reconcile %s %s error: %s", sym, tf, e)
            await asyncio.sleep(_CALL_SPACING_SEC)
