"""Feed Handler — Infoway (see `infoway_feed`) when `INFOWAY_API_KEY` is set.

Fallback (no API key): Binance for crypto + GBM simulator for other symbols.
"""

import asyncio
import json
import logging
import math
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import websockets

from packages.common.src.redis_client import redis_client

logger = logging.getLogger("market-data.feed")

BINANCE_WS = "wss://stream.binance.com:9443/ws"
BINANCE_MAP = {
    "btcusdt": "BTCUSD",
    "ethusdt": "ETHUSD",
    "ltcusdt": "LTCUSD",
    "xrpusdt": "XRPUSD",
    "solusdt": "SOLUSD",
}
LIVE_CRYPTO_SYMBOLS = set(BINANCE_MAP.values())

INSTRUMENTS: Dict[str, dict] = {
    "EURUSD":  {"base_price": 1.0845,   "category": "forex_major", "pip": 0.0001,  "decimals": 5},
    "GBPUSD":  {"base_price": 1.2650,   "category": "forex_major", "pip": 0.0001,  "decimals": 5},
    "USDJPY":  {"base_price": 149.50,   "category": "forex_major", "pip": 0.01,    "decimals": 3},
    "AUDUSD":  {"base_price": 0.6580,   "category": "forex_major", "pip": 0.0001,  "decimals": 5},
    "USDCAD":  {"base_price": 1.3650,   "category": "forex_major", "pip": 0.0001,  "decimals": 5},
    "USDCHF":  {"base_price": 0.8820,   "category": "forex_major", "pip": 0.0001,  "decimals": 5},
    "NZDUSD":  {"base_price": 0.6120,   "category": "forex_minor", "pip": 0.0001,  "decimals": 5},
    "EURGBP":  {"base_price": 0.8575,   "category": "forex_minor", "pip": 0.0001,  "decimals": 5},
    "EURJPY":  {"base_price": 162.10,   "category": "forex_minor", "pip": 0.01,    "decimals": 3},
    "GBPJPY":  {"base_price": 189.20,   "category": "forex_minor", "pip": 0.01,    "decimals": 3},
    "XAUUSD":  {"base_price": 2650.50,  "category": "commodity",   "pip": 0.01,    "decimals": 2},
    "XAGUSD":  {"base_price": 31.25,    "category": "commodity",   "pip": 0.001,   "decimals": 3},
    "USOIL":   {"base_price": 78.50,    "category": "commodity",   "pip": 0.01,    "decimals": 2},
    "US30":    {"base_price": 39250.0,  "category": "index",       "pip": 0.1,     "decimals": 1},
    "US500":   {"base_price": 5180.0,   "category": "index",       "pip": 0.01,    "decimals": 2},
    "NAS100":  {"base_price": 18250.0,  "category": "index",       "pip": 0.1,     "decimals": 1},
    "UK100":   {"base_price": 8150.0,   "category": "index",       "pip": 0.1,     "decimals": 1},
    "GER40":   {"base_price": 17850.0,  "category": "index",       "pip": 0.1,     "decimals": 1},
    "BTCUSD":  {"base_price": 67500.0,  "category": "crypto",      "pip": 0.01,    "decimals": 2},
    "ETHUSD":  {"base_price": 3450.0,   "category": "crypto",      "pip": 0.01,    "decimals": 2},
    "LTCUSD":  {"base_price": 95.0,     "category": "crypto",      "pip": 0.01,    "decimals": 2},
    "XRPUSD":  {"base_price": 0.52,     "category": "crypto",      "pip": 0.0001,  "decimals": 4},
    "SOLUSD":  {"base_price": 145.0,    "category": "crypto",      "pip": 0.01,    "decimals": 2},
    "EURCHF":  {"base_price": 0.9340,   "category": "forex_minor", "pip": 0.0001,  "decimals": 5},
    "GBPCHF":  {"base_price": 1.1180,   "category": "forex_minor", "pip": 0.0001,  "decimals": 5},
    "AUDJPY":  {"base_price": 98.50,    "category": "forex_minor", "pip": 0.01,    "decimals": 3},
    "CADJPY":  {"base_price": 110.20,   "category": "forex_minor", "pip": 0.01,    "decimals": 3},
    "NZDJPY":  {"base_price": 91.40,    "category": "forex_minor", "pip": 0.01,    "decimals": 3},
    "USDHKD":  {"base_price": 7.7850,   "category": "forex_minor", "pip": 0.0001,  "decimals": 5},
}

ANNUAL_VOLATILITY = {
    "forex_major": 0.08,
    "forex_minor": 0.08,
    "commodity":   0.20,
    "index":       0.15,
    "crypto":      0.50,
}

SPREAD_RANGE: Dict[str, tuple] = {
    "EURUSD":  (0.00005, 0.00015),
    "GBPUSD":  (0.00005, 0.00015),
    "USDJPY":  (0.005,   0.015),
    "AUDUSD":  (0.00005, 0.00015),
    "USDCAD":  (0.00005, 0.00015),
    "USDCHF":  (0.00005, 0.00015),
    "NZDUSD":  (0.00010, 0.00030),
    "EURGBP":  (0.00010, 0.00030),
    "EURJPY":  (0.010,   0.030),
    "GBPJPY":  (0.010,   0.030),
    "XAUUSD":  (0.15,    0.30),
    "XAGUSD":  (0.02,    0.05),
    "USOIL":   (0.03,    0.05),
    "US30":    (1.0,     3.0),
    "US500":   (0.5,     1.5),
    "NAS100":  (1.0,     3.0),
    "UK100":   (0.5,     2.0),
    "GER40":   (0.5,     2.0),
    "BTCUSD":  (10.0,    50.0),
    "ETHUSD":  (1.0,     5.0),
    "LTCUSD":  (0.05,    0.15),
    "XRPUSD":  (0.0002,  0.0008),
    "SOLUSD":  (0.05,    0.20),
    "EURCHF":  (0.00010, 0.00030),
    "GBPCHF":  (0.00015, 0.00040),
    "AUDJPY":  (0.010,   0.030),
    "CADJPY":  (0.010,   0.030),
    "NZDJPY":  (0.012,   0.035),
    "USDHKD":  (0.0002,  0.0006),
}

TICK_FREQ: Dict[str, tuple] = {
    "forex_major": (2, 5),
    "forex_minor": (2, 5),
    "commodity":   (1, 3),
    "index":       (1, 3),
    "crypto":      (3, 8),
}

VOLUME_RANGE: Dict[str, tuple] = {
    "forex_major": (50, 500),
    "forex_minor": (20, 200),
    "commodity":   (10, 150),
    "index":       (5, 100),
    "crypto":      (1, 50),
}

CORRELATIONS: List[tuple] = [
    ("EURUSD", "EURGBP",  0.60),
    ("EURUSD", "EURJPY",  0.70),
    ("EURUSD", "USDCHF", -0.80),
    ("EURUSD", "USDCAD", -0.40),
    ("GBPUSD", "EURGBP", -0.50),
    ("GBPUSD", "GBPJPY",  0.70),
    ("USDJPY", "EURJPY",  0.50),
    ("USDJPY", "GBPJPY",  0.50),
    ("XAUUSD", "XAGUSD",  0.85),
    ("XAUUSD", "EURUSD",  0.30),
    ("US500",  "NAS100",  0.90),
    ("US500",  "US30",    0.85),
    ("UK100",  "GER40",   0.65),
    ("BTCUSD", "ETHUSD",  0.75),
    ("BTCUSD", "LTCUSD",  0.70),
    ("ETHUSD", "SOLUSD",  0.72),
]

TRADING_SECONDS_PER_YEAR = 252 * 24 * 3600
MEAN_REVERSION_SPEED = 0.01



# FeedSimulator (mock price generator) removed — a real feed (Corecen LP / Infoway) is required.
