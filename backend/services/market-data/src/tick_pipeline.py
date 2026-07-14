"""Tick sanitiser — the bad-tick guard + de-spike that run BEFORE the spread
engine. Every rule here exists because a raw provider tick occasionally lies
(a zero, a crossed quote, a fat-finger print) and one bad tick otherwise draws
a permanent spike on the chart and can trip SL/TP.
"""
import statistics
from collections import deque, defaultdict

MAX_JUMP_PCT = 0.10        # >10% move from last good mid = suspicious
MAX_CONSECUTIVE_BAD = 5    # after this many, accept (the market really moved)
DESPIKE_WINDOW = 3         # median of the last 3 mids


class TickGuard:
    def __init__(self) -> None:
        self._mids: dict[str, deque] = defaultdict(lambda: deque(maxlen=DESPIKE_WINDOW))
        self._last_good_mid: dict[str, float] = {}
        self._bad_streak: dict[str, int] = defaultdict(int)

    def process(self, symbol: str, bid: float, ask: float):
        """Return a cleaned (bid, ask, mid) native quote, or None to DROP the
        tick. De-spike uses the median of the last 3 mids; a suspicious tick is
        dropped until MAX_CONSECUTIVE_BAD in a row prove the move is real."""
        bad = bid <= 0 or ask <= 0 or ask < bid
        if not bad:
            mid = (bid + ask) / 2.0
            last = self._last_good_mid.get(symbol)
            if last and last > 0 and abs(mid - last) / last > MAX_JUMP_PCT:
                bad = True

        if bad:
            self._bad_streak[symbol] += 1
            if self._bad_streak[symbol] < MAX_CONSECUTIVE_BAD:
                return None                      # drop — one-off glitch
            # 5+ bad in a row → not a glitch, the market/feed re-based. Accept.

        self._bad_streak[symbol] = 0
        if ask < bid:                            # uncross on forced-accept
            bid, ask = ask, bid
        if bid <= 0 or ask <= 0:
            return None                          # can't form a mid at all

        mid = (bid + ask) / 2.0
        self._mids[symbol].append(mid)
        despiked = statistics.median(self._mids[symbol])
        self._last_good_mid[symbol] = despiked

        half = (ask - bid) / 2.0                 # preserve native half-spread,
        return despiked - half, despiked + half, despiked  # recentred on the clean mid
