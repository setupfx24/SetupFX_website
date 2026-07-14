import redis.asyncio as aioredis
from .config import get_settings

settings = get_settings()

redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=50,
    decode_responses=True,
)

redis_client = aioredis.Redis(connection_pool=redis_pool)


class PriceChannel:
    TICK_PREFIX = "tick:"
    # Durable last-known price (no TTL) — read as a fallback when the live
    # tick: key has expired (e.g. forex/indices over the weekend).
    LAST_PRICE_PREFIX = "last_price:"
    PRICE_CHANNEL = "prices"
    ORDERBOOK_CHANNEL = "orderbook"

    @staticmethod
    def tick_key(symbol: str) -> str:
        return f"{PriceChannel.TICK_PREFIX}{symbol}"

    @staticmethod
    def last_price_key(symbol: str) -> str:
        return f"{PriceChannel.LAST_PRICE_PREFIX}{symbol}"

    @staticmethod
    def price_channel(symbol: str) -> str:
        return f"{PriceChannel.PRICE_CHANNEL}:{symbol}"


async def get_redis():
    return redis_client


async def publish_price(
    symbol: str, bid: float, ask: float, timestamp: str, spread_mult: float = 1.0,
):
    import json
    data = json.dumps({
        "symbol": symbol,
        "bid": bid,
        "ask": ask,
        "timestamp": timestamp,
        "spread": round(ask - bid, 8),
        # Applied-spread multiplier (admin spread ÷ native feed spread). Lets the
        # chart's bid-shift and any downstream consumer know how much the mid was
        # widened. 1.0 = native (no admin widening, or native spread unknown).
        "spread_mult": round(spread_mult, 4),
    })
    # 120 s TTL: if market-data dies, stale prices clear themselves
    # within 2 min instead of persisting forever. Live feed refreshes
    # the key on every tick (sub-second cadence), so the TTL never
    # actually expires during healthy operation — it's a crash safety
    # net, not a cache window.
    await redis_client.set(PriceChannel.tick_key(symbol), data, ex=120)
    # Durable last-known price (NO TTL). The tick: key self-expires in 120 s so
    # a dead feed doesn't masquerade as "live"; but for instruments whose market
    # is closed (forex / indices / metals over the weekend) we still want to SHOW
    # the last price instead of "-". Readers fall back to this key when the live
    # tick: has expired. Also survives market-data restarts / long closures.
    await redis_client.set(PriceChannel.last_price_key(symbol), data)
    await redis_client.publish(PriceChannel.price_channel(symbol), data)
    await redis_client.publish(PriceChannel.PRICE_CHANNEL, data)


CONFIG_INSTRUMENTS_RELOAD_CHANNEL = "config:instruments:reload"


async def publish_instrument_config_reload() -> None:
    """Notify services that instrument charge/spread config changed (optional cache bust)."""
    await redis_client.publish(CONFIG_INSTRUMENTS_RELOAD_CHANNEL, "1")
