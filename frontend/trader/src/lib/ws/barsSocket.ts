import { getWebSocketBaseUrl } from './getWebSocketBaseUrl';

/** One live bar per message: {symbol,timeframe,time,open,high,low,close,volume}. */
export interface BarUpdate {
  symbol: string;
  timeframe: string;
  time: number;      // bar-start epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type BarHandler = (bar: BarUpdate) => void;

/**
 * Singleton client for the gateway `/ws/bars` relay. One socket for the whole
 * app; the datafeed subscribes per (symbol, resolution). Includes the three
 * things §7 requires: exponential-backoff reconnect, a half-open watchdog
 * (assume dead if no frame in ~45s despite the server's 30s ping), and
 * resubscribe-on-reconnect. On every reconnect it fires the registered
 * "reset" callbacks so the datafeed can re-fetch bars missed during the drop.
 */
class BarsSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnect = 12;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private lastMsgAt = 0;
  private readonly HALF_OPEN_MS = 45_000;

  // key = `${SYMBOL}|${resolution}` → handlers
  private subs = new Map<string, Set<BarHandler>>();
  private resetHandlers = new Set<() => void>();

  private ensureConnected() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const url = `${getWebSocketBaseUrl()}/ws/bars`;
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.lastMsgAt = Date.now();
      // Resubscribe every active (symbol, resolution).
      for (const key of this.subs.keys()) {
        const [symbol, resolution] = key.split('|');
        this.rawSend({ type: 'subscribe', symbol, resolution });
      }
      // A drop may have hidden bars — let each chart re-fetch history.
      this.resetHandlers.forEach((h) => { try { h(); } catch { /* noop */ } });
      this.startWatchdog();
    };

    this.ws.onmessage = (ev) => {
      this.lastMsgAt = Date.now();
      let data: unknown;
      try { data = JSON.parse(ev.data); } catch { return; }
      const msg = data as Partial<BarUpdate> & { type?: string };
      if (msg.type === 'ping') return;             // server keepalive
      if (!msg.symbol || !msg.timeframe || typeof msg.time !== 'number') return;
      const key = `${String(msg.symbol).toUpperCase()}|${tfToResolution(msg.timeframe)}`;
      const handlers = this.subs.get(key);
      if (handlers) handlers.forEach((h) => h(msg as BarUpdate));
    };

    this.ws.onclose = () => { this.stopWatchdog(); this.scheduleReconnect(); };
    this.ws.onerror = () => { try { this.ws?.close(); } catch { /* noop */ } };
  }

  private startWatchdog() {
    this.stopWatchdog();
    this.watchdog = setInterval(() => {
      if (Date.now() - this.lastMsgAt > this.HALF_OPEN_MS) {
        // Socket looks open but is silent past the server ping interval →
        // treat as half-open dead and force a reconnect.
        try { this.ws?.close(); } catch { /* noop */ }
      }
    }, 10_000);
  }

  private stopWatchdog() {
    if (this.watchdog) { clearInterval(this.watchdog); this.watchdog = null; }
  }

  private scheduleReconnect() {
    if (this.subs.size === 0) return;               // nobody listening
    if (this.reconnectTimer || this.reconnectAttempts >= this.maxReconnect) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureConnected();
    }, delay);
  }

  private rawSend(obj: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(obj)); } catch { /* noop */ }
    }
  }

  subscribe(symbol: string, resolution: string, handler: BarHandler): () => void {
    const key = `${symbol.toUpperCase()}|${resolution}`;
    if (!this.subs.has(key)) this.subs.set(key, new Set());
    this.subs.get(key)!.add(handler);
    this.reconnectAttempts = 0;                     // fresh intent → allow reconnects
    this.ensureConnected();
    this.rawSend({ type: 'subscribe', symbol: symbol.toUpperCase(), resolution });
    return () => {
      const set = this.subs.get(key);
      if (!set) return;
      set.delete(handler);
      if (set.size === 0) {
        this.subs.delete(key);
        this.rawSend({ type: 'unsubscribe', symbol: symbol.toUpperCase(), resolution });
      }
    };
  }

  /** Called on every reconnect so charts can reset TradingView's bar cache. */
  onReconnect(handler: () => void): () => void {
    this.resetHandlers.add(handler);
    return () => this.resetHandlers.delete(handler);
  }
}

/** Aggregator timeframe (e.g. "5m") → TradingView resolution ("5"). */
function tfToResolution(tf: string): string {
  const map: Record<string, string> = {
    '1m': '1', '5m': '5', '15m': '15', '30m': '30',
    '1h': '60', '4h': '240', '1d': '1D',
  };
  return map[tf] || tf;
}

export const barsSocket = new BarsSocket();
