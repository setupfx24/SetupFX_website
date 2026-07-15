'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { createDatafeed } from '@/lib/charting/datafeed';
import { createBroker, BROKER_CONFIG } from '@/lib/charting/broker';
import { useTradingStore, type Position } from '@/stores/tradingStore';

const LIBRARY_PATH = '/charting_library/';
const SCRIPT_SRC = '/charting_library/charting_library.standalone.js';

// Draggable SL/TP via the chart's order/position-line API. NOTE: in v31
// createOrderLine()/createPositionLine() return PROMISES — they must be
// awaited (the earlier bug: setters were called on the unresolved Promise, so
// nothing rendered). This path draws a position line (P&L + ✕ close) and
// draggable red SL / green TP lines; dragging + releasing pops a confirm
// dialog, then modifies on the server.
const USE_BROKER_API = false;

let scriptPromise: Promise<void> | null = null;
function loadLibrary(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).TradingView?.widget) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('Failed to load charting library')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export default function AdvancedChart({ symbol, interval = '5', theme = 'light' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;
  // Lets the symbol-change effect force an immediate SL/TP line re-sync.
  const syncRef = useRef<(() => void) | null>(null);

  // ── Create the widget once ────────────────────────────────────────────────
  useEffect(() => {
    let disposed = false;
    let cleanupLines: (() => void) | null = null;

    let broker: any = null;

    loadLibrary().then(() => {
      if (disposed || !containerRef.current) return;
      const TV = (window as any).TradingView;

      const accountId = useTradingStore.getState().activeAccount?.id || '';
      const useBroker = USE_BROKER_API && !!accountId;

      const options: any = {
        container: containerRef.current,
        library_path: LIBRARY_PATH,
        datafeed: createDatafeed(),
        symbol: symbolRef.current,
        interval,
        locale: 'en',
        theme,
        autosize: true,
        timezone: 'Etc/UTC',
        // The datafeed already serves broker symbols, so no symbol search.
        disabled_features: [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_compare',
        ],
        enabled_features: [],
      };
      // Trading Terminal: renders SL/TP/✕ on the position line + draggable
      // brackets, all wired to the same server modify/close endpoints. Hide the
      // library's own Account Manager panel — the app has its own positions
      // table, and a minimal account manager is what broke init before.
      if (useBroker) {
        options.disabled_features.push('trading_account_manager');
        options.broker_factory = (host: any) => {
          broker = createBroker(host, accountId);
          return broker;
        };
        options.broker_config = BROKER_CONFIG;
      }

      const widget = new TV.widget(options);
      widgetRef.current = widget;

      widget.onChartReady(() => {
        if (disposed) return;
        // Manual lines ONLY when the Broker API isn't active (else the
        // broker draws the position/SL/TP lines and we'd double them up).
        if (!useBroker) {
          const { cleanup, sync } = setupSLTPLines(widget, symbolRef);
          cleanupLines = cleanup;
          syncRef.current = sync;
        }
      });
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });

    return () => {
      disposed = true;
      if (cleanupLines) cleanupLines();
      try { broker?.destroy?.(); } catch { /* noop */ }
      syncRef.current = null;
      try { widgetRef.current?.remove?.(); } catch { /* noop */ }
      widgetRef.current = null;
    };
    // Recreate only when interval/theme change; symbol handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, theme]);

  // ── Switch symbol without tearing down the widget ─────────────────────────
  useEffect(() => {
    const w = widgetRef.current;
    if (!w) return;
    try {
      w.onChartReady(() => {
        // Redraw SL/TP lines for the new symbol as soon as it loads (don't
        // wait for the next store tick).
        try { w.activeChart().setSymbol(symbol, () => { syncRef.current?.(); }); } catch { /* noop */ }
      });
    } catch { /* noop */ }
  }, [symbol]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

/** Styled confirm dialog (like the reference "Set Stop Loss @ X → loss $Y").
 *  Resolves true on the main button, false on cancel/dismiss. */
function confirmDialog(title: string, body: string, okText: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: boolean, id: string) => { if (settled) return; settled = true; toast.dismiss(id); resolve(v); };
    toast(
      (t) => (
        <div style={{ minWidth: 230 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0A0A0A' }}>{title}</div>
          <div style={{ fontSize: 13, marginBottom: 12, color: '#4B5563' }}>{body}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => done(false, t.id)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E5E5', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >Cancel</button>
            <button
              type="button"
              onClick={() => done(true, t.id)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >{okText}</button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  });
}

/**
 * Renders each open position on the current chart symbol as:
 *   • a position line at the entry with live P&L + a close (✕) button, and
 *   • draggable SL / TP order lines whose drag calls the same PUT modify
 *     endpoint the panel uses (server re-validates side + min distance).
 *
 * Candles are drawn at BID; SL/TP/entry values are already bid-comparable, so
 * the lines are placed at their RAW prices (no shift) and sit correctly on the
 * bid scale — a buy's entry (an ask fill) naturally shows a spread above the
 * current bid candle, the MT4/MT5 look.
 */
function setupSLTPLines(widget: any, symbolRef: { current: string }): { cleanup: () => void; sync: () => void } {
  const chart = widget.activeChart();
  const posLines = new Map<string, any>();
  const slLines = new Map<string, any>();
  const tpLines = new Map<string, any>();
  const creating = new Set<string>();   // keys mid-creation (async createOrderLine)
  let disposed = false;

  const apply = (line: any, ops: Array<[string, unknown]>) => {
    for (const [method, arg] of ops) {
      try { if (typeof line?.[method] === 'function') line[method](arg); } catch { /* noop */ }
    }
    return line;
  };

  const removeLine = (map: Map<string, any>, id: string) => {
    const line = map.get(id);
    if (line) { try { line.remove(); } catch { /* noop */ } map.delete(id); }
  };
  const removeAllFor = (id: string) => {
    removeLine(posLines, id); removeLine(slLines, id); removeLine(tpLines, id);
  };

  const money = (n: number) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`;

  const contractSize = (symbol: string) => {
    const inst = useTradingStore.getState().instruments.find(
      (i) => String(i.symbol).toUpperCase() === symbol.toUpperCase());
    return inst?.contract_size || 100000;
  };
  // Approx account-currency P&L if the position closed at `price` (for confirm).
  const pnlAt = (pos: Position, price: number) => {
    const cs = contractSize(pos.symbol);
    const raw = pos.side === 'buy'
      ? (price - pos.open_price) * pos.lots * cs
      : (pos.open_price - price) * pos.lots * cs;
    const quote = pos.symbol.length >= 6 ? pos.symbol.slice(3, 6).toUpperCase() : 'USD';
    return (!quote || quote === 'USD' || !price) ? raw : raw / price;
  };

  const modify = async (posId: string, patch: { stop_loss?: number | null; take_profit?: number | null }) => {
    try {
      await api.put(`/positions/${posId}`, patch);
      await useTradingStore.getState().refreshPositions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update SL/TP');
      sync();   // snap the dragged line back to the server value
    }
  };

  // Drag-release → confirm dialog with P&L impact, then modify (or revert).
  const confirmAndSet = async (posId: string, kind: 'sl' | 'tp', price: number) => {
    const pos = useTradingStore.getState().positions.find((p) => p.id === posId);
    if (!pos) return;
    const impact = pnlAt(pos, price);
    const title = `${kind === 'sl' ? 'Set Stop Loss' : 'Set Take Profit'} @ ${price}`;
    const body = `${pos.side.toUpperCase()} ${pos.lots} ${pos.symbol} → ${impact >= 0 ? 'profit' : 'loss'} ${money(impact)}`;
    const ok = await confirmDialog(title, body, kind === 'sl' ? 'Set SL' : 'Set TP');
    if (!ok) { sync(); return; }   // revert the dragged line
    await modify(posId, kind === 'sl' ? { stop_loss: price } : { take_profit: price });
  };

  const closePos = async (posId: string) => {
    try {
      await api.post(`/positions/${posId}/close`, {});
      useTradingStore.getState().removePosition(posId);
      await useTradingStore.getState().refreshPositions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to close position');
    }
  };

  async function ensurePositionLine(pos: Position, color: string) {
    if (posLines.has(pos.id) || creating.has(`pos-${pos.id}`)) return;
    creating.add(`pos-${pos.id}`);
    try {
      const pl = await chart.createPositionLine();   // ← Promise, must await
      if (disposed) { try { pl.remove(); } catch { /* noop */ } return; }
      apply(pl, [
        ['setLineColor', color], ['setBodyBorderColor', color], ['setBodyTextColor', '#ffffff'],
        ['setBodyBackgroundColor', color], ['setQuantityBackgroundColor', color],
        ['setQuantityBorderColor', color], ['setCloseButtonBackgroundColor', color],
        ['setCloseButtonBorderColor', color], ['setCloseButtonIconColor', '#ffffff'],
      ]);
      try { pl.onClose(() => closePos(pos.id)); } catch { /* noop */ }
      posLines.set(pos.id, pl);
    } catch { /* noop */ } finally { creating.delete(`pos-${pos.id}`); }
  }

  async function ensureBracket(
    map: Map<string, any>, pos: Position, kind: 'sl' | 'tp', color: string,
  ) {
    if (map.has(pos.id) || creating.has(`${kind}-${pos.id}`)) return;
    creating.add(`${kind}-${pos.id}`);
    try {
      const line = await chart.createOrderLine();     // ← Promise, must await
      if (disposed) { try { line.remove(); } catch { /* noop */ } return; }
      apply(line, [
        ['setEditable', true],
        ['setLineColor', color], ['setBodyTextColor', '#ffffff'],
        ['setBodyBackgroundColor', color], ['setBodyBorderColor', color],
        ['setQuantityBackgroundColor', color], ['setQuantityBorderColor', color],
        ['setCancelButtonBackgroundColor', color], ['setCancelButtonBorderColor', color],
        ['setCancelButtonIconColor', '#ffffff'], ['setQuantity', `${pos.lots}`],
      ]);
      try {
        line.onMove(function (this: any) {
          const p = this.getPrice();
          if (typeof p === 'number' && p > 0) confirmAndSet(pos.id, kind, p);
        });
      } catch { /* noop */ }
      try {
        line.onCancel(() => modify(pos.id, kind === 'sl' ? { stop_loss: null } : { take_profit: null }));
      } catch { /* noop */ }
      map.set(pos.id, line);
    } catch { /* noop */ } finally { creating.delete(`${kind}-${pos.id}`); }
  }

  const reconcile = async () => {
    if (disposed) return;
    const state = useTradingStore.getState();
    const sym = symbolRef.current.toUpperCase();
    const open = state.positions.filter(
      (p) => String(p.symbol).toUpperCase() === sym && !p.id.startsWith('optim-'),
    );
    const liveIds = new Set(open.map((p) => p.id));

    for (const id of Array.from(posLines.keys())) if (!liveIds.has(id)) removeAllFor(id);
    for (const id of Array.from(slLines.keys())) if (!liveIds.has(id)) removeLine(slLines, id);
    for (const id of Array.from(tpLines.keys())) if (!liveIds.has(id)) removeLine(tpLines, id);

    for (const pos of open) {
      const buy = pos.side === 'buy';
      await ensurePositionLine(pos, buy ? '#2962FF' : '#ef5350');
      const pl = posLines.get(pos.id);
      if (pl) apply(pl, [
        ['setPrice', pos.open_price], ['setQuantity', `${pos.lots}`],
        ['setText', `${buy ? 'BUY' : 'SELL'}  ${money(pos.profit || 0)}`],
      ]);

      // Default handle ~0.3% on the correct side of the current price (unset).
      const tick = state.prices[sym];
      const cur = tick ? (buy ? Number(tick.bid) : Number(tick.ask)) : Number(pos.open_price);
      const off = Math.abs(cur) * 0.003 || 0;

      await ensureBracket(slLines, pos, 'sl', '#ef5350');
      const slSet = pos.stop_loss != null && pos.stop_loss > 0;
      const slPrice = slSet ? (pos.stop_loss as number) : (buy ? cur - off : cur + off);
      const slLine = slLines.get(pos.id);
      if (slLine && Number.isFinite(slPrice) && slPrice > 0) apply(slLine, [
        ['setPrice', slPrice], ['setText', slSet ? 'SL' : 'SL · drag to set'],
        ['setLineStyle', slSet ? 0 : 2], ['setCancellable', slSet],
      ]);

      await ensureBracket(tpLines, pos, 'tp', '#26a69a');
      const tpSet = pos.take_profit != null && pos.take_profit > 0;
      const tpPrice = tpSet ? (pos.take_profit as number) : (buy ? cur + off : cur - off);
      const tpLine = tpLines.get(pos.id);
      if (tpLine && Number.isFinite(tpPrice) && tpPrice > 0) apply(tpLine, [
        ['setPrice', tpPrice], ['setText', tpSet ? 'TP' : 'TP · drag to set'],
        ['setLineStyle', tpSet ? 0 : 2], ['setCancellable', tpSet],
      ]);
    }
  };

  // Coalesced async runner — the store fires many times/sec; one reconcile at a
  // time, re-run once more if something changed while it was running.
  let running = false;
  let dirty = false;
  const sync = () => {
    if (running) { dirty = true; return; }
    running = true;
    (async () => {
      try { do { dirty = false; await reconcile(); } while (dirty && !disposed); }
      finally { running = false; }
    })();
  };

  sync();
  const unsub = useTradingStore.subscribe(sync);
  const poll = setInterval(sync, 1500);
  const cleanup = () => {
    disposed = true;
    clearInterval(poll);
    unsub();
    for (const id of Array.from(posLines.keys())) removeAllFor(id);
  };
  return { cleanup, sync };
}
