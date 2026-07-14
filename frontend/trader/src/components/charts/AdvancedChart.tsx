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

// The v31 "Advanced Charts" bundle ships broker strings but the Broker API
// (Trading Terminal) does NOT reliably initialise here, so we use the manual
// createPositionLine/createOrderLine path — draggable SL/TP lines you can set
// AND move straight from the chart. (Flip to true only on a real Trading
// Terminal build.)
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
      // brackets, all wired to the same server modify/close endpoints.
      if (useBroker) {
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

  // Apply setters one-by-one, ignoring any a given library build doesn't
  // expose — so one odd method can never abort the whole line and leave the
  // chart with no SL/TP handles.
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

  const modify = async (posId: string, patch: { stop_loss?: number | null; take_profit?: number | null }) => {
    try {
      await api.put(`/positions/${posId}`, patch);
      await useTradingStore.getState().refreshPositions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update SL/TP');
      // Re-sync so a rejected drag snaps the line back to the server value.
      sync();
    }
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

  const money = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}`;

  const sync = () => {
    const state = useTradingStore.getState();
    const sym = symbolRef.current.toUpperCase();
    const open = state.positions.filter(
      (p) => String(p.symbol).toUpperCase() === sym && !p.id.startsWith('optim-'),
    );
    const liveIds = new Set(open.map((p) => p.id));

    // Drop lines for positions no longer open / off-symbol.
    for (const id of Array.from(posLines.keys())) if (!liveIds.has(id)) removeAllFor(id);
    for (const id of Array.from(slLines.keys())) if (!liveIds.has(id)) removeLine(slLines, id);
    for (const id of Array.from(tpLines.keys())) if (!liveIds.has(id)) removeLine(tpLines, id);

    for (const pos of open) {
      const buy = pos.side === 'buy';
      const color = buy ? '#2962FF' : '#ef5350';

      // Entry / position line with P&L + close (✕) button.
      let pl = posLines.get(pos.id);
      if (!pl) {
        try { pl = chart.createPositionLine(); } catch { pl = null; }
        if (pl) {
          apply(pl, [
            ['setLineStyle', 0], ['setLineColor', color], ['setBodyBorderColor', color],
            ['setBodyTextColor', '#ffffff'], ['setBodyBackgroundColor', color],
            ['setQuantityBackgroundColor', color], ['setQuantityBorderColor', color],
            ['setCloseButtonBackgroundColor', color], ['setCloseButtonBorderColor', color],
            ['setCloseButtonIconColor', '#ffffff'],
          ]);
          try { pl.onClose(() => closePos(pos.id)); } catch { /* noop */ }
          posLines.set(pos.id, pl);
        }
      }
      if (pl) {
        apply(pl, [
          ['setPrice', pos.open_price], ['setQuantity', `${pos.lots}`],
          ['setText', `${buy ? 'BUY' : 'SELL'}  ${money(pos.profit || 0)}`],
        ]);
      }

      // Draggable SL/TP handles — always visible so you can SET them from the
      // chart (drag the dashed handle) and MOVE them once set. Default handle
      // sits ~0.3% on the correct side of the current price.
      const tick = state.prices[sym];
      const cur = tick ? (buy ? Number(tick.bid) : Number(tick.ask)) : Number(pos.open_price);
      const off = Math.abs(cur) * 0.003 || 0;
      const slDefault = buy ? cur - off : cur + off;
      const tpDefault = buy ? cur + off : cur - off;

      syncBracket(slLines, pos, pos.stop_loss, slDefault, '#ef5350', 'SL',
        (price) => modify(pos.id, { stop_loss: price }),
        () => modify(pos.id, { stop_loss: null }));

      syncBracket(tpLines, pos, pos.take_profit, tpDefault, '#26a69a', 'TP',
        (price) => modify(pos.id, { take_profit: price }),
        () => modify(pos.id, { take_profit: null }));
    }
  };

  function syncBracket(
    map: Map<string, any>, pos: Position, value: number | undefined, defaultPrice: number,
    color: string, label: string,
    onSet: (price: number) => void, onClear: () => void,
  ) {
    const isSet = value != null && value > 0;
    const price = isSet ? (value as number) : defaultPrice;
    if (!Number.isFinite(price) || price <= 0) { removeLine(map, pos.id); return; }
    let line = map.get(pos.id);
    if (!line) {
      try { line = chart.createOrderLine(); } catch { line = null; }
      if (!line) return;
      apply(line, [
        ['setLineColor', color], ['setBodyTextColor', '#ffffff'],
        ['setBodyBackgroundColor', color], ['setBodyBorderColor', color],
        ['setQuantityBackgroundColor', color], ['setQuantityBorderColor', color],
        ['setCancelButtonBackgroundColor', color], ['setCancelButtonBorderColor', color],
        ['setCancelButtonIconColor', '#ffffff'], ['setQuantity', `${pos.lots}`],
      ]);
      // Drag the handle → set/move the level on the server.
      try {
        line.onMove(function (this: any) {
          const p = this.getPrice();
          if (typeof p === 'number' && p > 0) onSet(p);
        });
      } catch { /* noop */ }
      try { line.onCancel(() => onClear()); } catch { /* noop */ }
      map.set(pos.id, line);
    }
    apply(line, [
      ['setPrice', price],
      ['setText', isSet ? label : `${label} · drag to set`],
      ['setLineStyle', isSet ? 0 : 2],   // solid once set, dashed while it's a draggable default
      ['setCancellable', isSet],         // ✕ (clear) only once actually set
    ]);
  }

  // Initial paint + re-sync on any positions/prices change.
  sync();
  const unsub = useTradingStore.subscribe(sync);
  const cleanup = () => {
    unsub();
    for (const id of Array.from(posLines.keys())) removeAllFor(id);
  };
  return { cleanup, sync };
}
