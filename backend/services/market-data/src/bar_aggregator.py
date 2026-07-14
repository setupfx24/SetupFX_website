"""Bar Aggregator — Aggregates ticks into OHLCV bars for multiple timeframes."""
import asyncio
import json
import logging
from datetime import datetime, timezone
from collections import defaultdict

from packages.common.src.redis_client import redis_client

logger = logging.getLogger("market-data.aggregator")

TIMEFRAMES = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
}

# Channel every live-bar consumer (the /ws/bars relay) subscribes to. Payload
# is a single forming-or-closed bar: {symbol,timeframe,time,open,high,low,close,volume}.
BARS_UPDATES_CHANNEL = "bars:updates"


class BarData:
    __slots__ = ("open", "high", "low", "close", "volume", "tick_count", "timestamp")

    def __init__(self, price: float, timestamp: str):
        self.open = price
        self.high = price
        self.low = price
        self.close = price
        self.volume = 0.0
        self.tick_count = 1
        self.timestamp = timestamp

    def update(self, price: float):
        self.high = max(self.high, price)
        self.low = min(self.low, price)
        self.close = price
        self.tick_count += 1


class BarAggregator:
    def __init__(self, bar_store=None):
        self._bars: dict[str, dict[str, BarData]] = defaultdict(dict)
        self._bar_timestamps: dict[str, dict[str, int]] = defaultdict(dict)
        # Durable OHLCV store (store.BarStore). Optional so the aggregator
        # still runs (Redis-only) if Timescale is unavailable.
        self._bar_store = bar_store
        # Last (time, o, h, l, c) published per key, so the 1s loop only emits
        # a forming-bar update when it actually changed — which also means a
        # frozen market (no ticks) produces no phantom "live" updates.
        self._last_pub: dict[str, tuple] = {}

    async def _publish_update(self, symbol: str, timeframe: str, time_epoch: int, bar: "BarData"):
        payload = {
            "symbol": symbol,
            "timeframe": timeframe,
            "time": time_epoch,
            "open": bar.open,
            "high": bar.high,
            "low": bar.low,
            "close": bar.close,
            "volume": bar.volume,
        }
        try:
            await redis_client.publish(BARS_UPDATES_CHANNEL, json.dumps(payload))
        except Exception as exc:
            logger.debug("bars:updates publish failed for %s:%s: %s", symbol, timeframe, exc)

    def update(self, symbol: str, bid: float, ask: float, timestamp: str):
        mid = (bid + ask) / 2
        now = datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc)
        epoch = int(now.timestamp())

        for tf_name, tf_seconds in TIMEFRAMES.items():
            bar_start = (epoch // tf_seconds) * tf_seconds
            key = f"{symbol}:{tf_name}"

            current_start = self._bar_timestamps.get(symbol, {}).get(tf_name)

            if current_start != bar_start:
                if current_start is not None and key in self._bars.get(symbol, {}):
                    old_bar = self._bars[symbol].pop(tf_name, None)
                    if old_bar:
                        asyncio.create_task(self._store_bar(symbol, tf_name, old_bar, current_start))

                if symbol not in self._bars:
                    self._bars[symbol] = {}
                self._bars[symbol][tf_name] = BarData(mid, timestamp)

                if symbol not in self._bar_timestamps:
                    self._bar_timestamps[symbol] = {}
                self._bar_timestamps[symbol][tf_name] = bar_start
            else:
                if symbol in self._bars and tf_name in self._bars[symbol]:
                    self._bars[symbol][tf_name].update(mid)

    async def _store_bar(self, symbol: str, timeframe: str, bar: BarData, bar_start: int):
        bar_data = {
            "symbol": symbol,
            "timeframe": timeframe,
            "time": bar_start,
            "open": bar.open,
            "high": bar.high,
            "low": bar.low,
            "close": bar.close,
            "volume": bar.volume,
            "tick_count": bar.tick_count,
        }

        bar_key = f"bar:{symbol}:{timeframe}"
        await redis_client.set(bar_key, json.dumps(bar_data))

        list_key = f"bars:{symbol}:{timeframe}"
        await redis_client.lpush(list_key, json.dumps(bar_data))
        await redis_client.ltrim(list_key, 0, 999)

        # Durable history — the real source of truth (Redis is the cache).
        if self._bar_store is not None:
            await self._bar_store.upsert_bar(
                timeframe, symbol, bar_start,
                bar.open, bar.high, bar.low, bar.close, bar.volume, bar.tick_count,
            )

        # Push the newly CLOSED bar so live subscribers finalize it and the
        # next tick opens a fresh candle in place.
        await self._publish_update(symbol, timeframe, bar_start, bar)
        self._last_pub[f"{symbol}:{timeframe}"] = (
            bar_start, bar.open, bar.high, bar.low, bar.close,
        )

        # ATR(14) — volatility metric cached for downstream consumers.
        # Computed only on 1m bars.
        if timeframe == "1m":
            await self._update_atr14(symbol)

    async def _update_atr14(self, symbol: str):
        """Compute the 14-period True-Range average from the most recent 1m
        bars and cache at `atr:<SYMBOL>:14` with a 5-minute TTL."""
        import json
        try:
            raw = await redis_client.lrange(f"bars:{symbol}:1m", 0, 14)
            if len(raw) < 15:
                return  # need 14 TR values → 15 bars
            bars = [json.loads(b) for b in raw]
            # bars[0] is newest. We need TR for bars[0..13] using bars[i+1] as prev.
            tr_total = 0.0
            for i in range(14):
                cur = bars[i]
                prev_close = bars[i + 1]["close"]
                tr = max(
                    cur["high"] - cur["low"],
                    abs(cur["high"] - prev_close),
                    abs(cur["low"] - prev_close),
                )
                tr_total += tr
            atr = tr_total / 14
            await redis_client.set(f"atr:{symbol.upper()}:14", f"{atr:.8f}", ex=300)
        except Exception as exc:
            logger.debug("ATR update failed for %s: %s", symbol, exc)

    async def run_aggregation_loop(self):
        """Every second, snapshot the forming bar to `bar:current:<SYM>:<TF>`
        (with its bar-start `time`, which the datafeed needs to align it) and
        publish it on `bars:updates` — but only when it changed, so a frozen
        market emits nothing (no fake 'live' candle)."""
        while True:
            for symbol, timeframes in list(self._bars.items()):
                for tf_name, bar in list(timeframes.items()):
                    bar_start = self._bar_timestamps.get(symbol, {}).get(tf_name)
                    if bar_start is None:
                        continue
                    bar_data = {
                        "symbol": symbol,
                        "timeframe": tf_name,
                        "time": bar_start,
                        "open": bar.open,
                        "high": bar.high,
                        "low": bar.low,
                        "close": bar.close,
                        "volume": bar.volume,
                        "tick_count": bar.tick_count,
                    }
                    bar_key = f"bar:current:{symbol}:{tf_name}"
                    await redis_client.set(bar_key, json.dumps(bar_data))

                    sig = (bar_start, bar.open, bar.high, bar.low, bar.close)
                    key = f"{symbol}:{tf_name}"
                    if self._last_pub.get(key) != sig:
                        self._last_pub[key] = sig
                        await self._publish_update(symbol, tf_name, bar_start, bar)

            await asyncio.sleep(1)
