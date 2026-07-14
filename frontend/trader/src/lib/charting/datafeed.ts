/**
 * Custom TradingView datafeed backed by the broker's OWN bars API + the
 * `/ws/bars` live channel. One price basis for everything — history and live
 * come from the same feed, so there's no seam where history meets the live
 * candle.
 *
 * BID-based drawing (MT4/MT5 convention): the server returns MID bars; we shift
 * every bar DOWN by half the live spread (read from the same tick the order
 * panel renders) so the chart's last price equals the panel BID equals a buy
 * position's current price, to the pip.
 */
import api from '@/lib/api/client';
import { barsSocket, type BarUpdate } from '@/lib/ws/barsSocket';
import { useTradingStore } from '@/stores/tradingStore';

// Base resolutions the server serves; the library builds every other TF
// (3m, 45m, 2h, 3h, W, M, 3M, 6M, 12M) client-side from these.
export const SUPPORTED_RESOLUTIONS = [
  '1', '3', '5', '10', '15', '30', '45', '60', '120', '180', '240',
  '1D', '1W', '1M', '3M', '6M', '12M',
];
const INTRADAY_MULTIPLIERS = ['1', '5', '15', '30', '60', '240'];
const DAILY_MULTIPLIERS = ['1'];

interface RawBar { time: number; open: number; high: number; low: number; close: number; volume: number }
interface BarsResponse { s: string; bars: RawBar[]; noData?: boolean }

// Loose shapes — the full library types live in the self-hosted d.ts; we keep
// this file independent of that import path.
interface TVBar { time: number; open: number; high: number; low: number; close: number; volume: number }
interface PeriodParams { from: number; to: number; firstDataRequest: boolean; countBack?: number }
type SymbolInfo = { ticker: string; name: string; pricescale: number };

/** Map a TradingView resolution to the server's base-resolution query value. */
function toServerResolution(resolution: string): string {
  if (resolution === 'D' || resolution === '1D') return 'D';
  return resolution;
}

/** Half the live spread in PRICE units — how far MID sits above BID right now. */
function bidShift(symbol: string): number {
  const tick = useTradingStore.getState().prices[symbol.toUpperCase()];
  const spread = tick?.spread;
  return spread && spread > 0 ? spread / 2 : 0;
}

function instrumentFor(symbol: string) {
  const sym = symbol.toUpperCase();
  return useTradingStore.getState().instruments.find(
    (i) => String(i.symbol).toUpperCase() === sym,
  );
}

export function createDatafeed() {
  // guid → cleanup (socket unsub + reconnect-reset unsub)
  const subs = new Map<string, () => void>();

  return {
    onReady(callback: (config: unknown) => void) {
      setTimeout(() => callback({
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      }), 0);
    },

    searchSymbols(
      _userInput: string, _exchange: string, _symbolType: string,
      onResult: (items: unknown[]) => void,
    ) {
      onResult([]);
    },

    resolveSymbol(
      symbolName: string,
      onResolve: (info: unknown) => void,
      onError: (reason: string) => void,
    ) {
      const sym = symbolName.toUpperCase();
      const inst = instrumentFor(sym);
      const digits = inst?.digits ?? 5;
      const info = {
        ticker: sym,
        name: sym,
        full_name: sym,
        description: inst?.display_name || sym,
        type: inst?.segment || 'forex',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: 'SetupFX',
        listed_exchange: 'SetupFX',
        format: 'price',
        minmov: 1,
        pricescale: Math.round(Math.pow(10, digits)),
        has_intraday: true,
        has_weekly_and_monthly: false,           // library builds W/M/3M/6M/12M from 1D
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        intraday_multipliers: INTRADAY_MULTIPLIERS,
        daily_multipliers: DAILY_MULTIPLIERS,
        volume_precision: 2,
        data_status: 'streaming',
      };
      setTimeout(() => {
        if (info.ticker) onResolve(info); else onError('unknown symbol');
      }, 0);
    },

    async getBars(
      symbolInfo: SymbolInfo,
      resolution: string,
      periodParams: PeriodParams,
      onResult: (bars: TVBar[], meta: { noData: boolean }) => void,
      onError: (reason: string) => void,
    ) {
      const { from, to } = periodParams;
      try {
        const res = await api.get<BarsResponse>(
          `/instruments/${encodeURIComponent(symbolInfo.ticker)}/bars`,
          { resolution: toServerResolution(resolution), from: String(from), to: String(to) },
        );
        const raw = Array.isArray(res?.bars) ? res.bars : [];
        const shift = bidShift(symbolInfo.ticker);
        const bars: TVBar[] = raw.map((b) => ({
          time: b.time * 1000,                   // library wants ms
          open: b.open - shift,
          high: b.high - shift,
          low: b.low - shift,
          close: b.close - shift,
          volume: b.volume || 0,
        }));
        onResult(bars, { noData: bars.length === 0 });
      } catch (e) {
        onError(e instanceof Error ? e.message : 'getBars failed');
      }
    },

    subscribeBars(
      symbolInfo: SymbolInfo,
      resolution: string,
      onTick: (bar: TVBar) => void,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void,
    ) {
      const relay = (b: BarUpdate) => {
        const shift = bidShift(symbolInfo.ticker);
        onTick({
          time: b.time * 1000,
          open: b.open - shift,
          high: b.high - shift,
          low: b.low - shift,
          close: b.close - shift,
          volume: b.volume || 0,
        });
      };
      const unsub = barsSocket.subscribe(symbolInfo.ticker, resolution, relay);
      // On bar-socket reconnect, reset the library cache so it re-fetches the
      // bars missed during the drop (spec §5).
      const unReset = barsSocket.onReconnect(() => onResetCacheNeededCallback());
      subs.set(listenerGuid, () => { unsub(); unReset(); });
    },

    unsubscribeBars(listenerGuid: string) {
      const cleanup = subs.get(listenerGuid);
      if (cleanup) { cleanup(); subs.delete(listenerGuid); }
    },
  };
}
