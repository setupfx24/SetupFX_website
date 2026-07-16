'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Advanced chart (self-hosted TradingView Charting Library) with on-chart
 * draggable SL/TP — ported from the proven reference implementation.
 *
 * KEY: this Advanced-Charts build has NO order-line API (createOrderLine /
 * createPositionLine don't render), so SL/TP are drawn as horizontal-line
 * SHAPES via chart.createShape(). Dragging is detected through the widget's
 * `drawing_event`; a press-and-drag from the on-line SL/TP buttons places a
 * line that follows the crosshair; releasing pops a confirm dialog, then the
 * level is saved via the same modify endpoint the panels use.
 */
import { memo, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { createDatafeed } from '@/lib/charting/datafeed';
import { useTradingStore } from '@/stores/tradingStore';

const LIBRARY_PATH = '/charting_library/';
const SCRIPT_SRC = '/charting_library/charting_library.standalone.js';

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

function AdvancedChart({ interval = '5' }: { symbol?: string; interval?: string; theme?: string }) {
  const CONTAINER_ID = useRef('sfx_tv_' + Math.random().toString(36).slice(2, 10)).current;
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const readyRef = useRef(false);

  const positions = useTradingStore((s) => s.positions);
  const [chartReady, setChartReady] = useState(false);
  const linesRef = useRef<Map<string, any>>(new Map());
  const syncBusyRef = useRef(false);

  const [confirm, setConfirm] = useState<
    { positionId: string; leg: 'sl' | 'tp'; price: number; side: string; lots: number; symbol: string; pnl: number } | null
  >(null);
  const confirmRevertRef = useRef<(() => void) | null>(null);
  const requestBracketRef = useRef<((positionId: string, leg: 'sl' | 'tp', price: number, revert?: () => void) => void) | null>(null);

  // ── Mount the widget once ──────────────────────────────────────────────
  useEffect(() => {
    let disposed = false;
    (async () => {
      try { await loadLibrary(); } catch { return; }
      if (disposed || !containerRef.current || !(window as any).TradingView) return;

      widgetRef.current = new (window as any).TradingView.widget({
        symbol: (selectedSymbol ?? 'EURUSD').toUpperCase(),
        interval,
        // This build wants the container's element ID (string), not the node.
        container: CONTAINER_ID,
        container_id: CONTAINER_ID,
        datafeed: createDatafeed(),
        library_path: LIBRARY_PATH,
        locale: 'en',
        timezone: 'Etc/UTC',
        theme: 'light',
        autosize: true,
        fullscreen: false,
        toolbar_bg: '#ffffff',
        loading_screen: { backgroundColor: '#ffffff' },
        disabled_features: ['use_localstorage_for_settings', 'symbol_search_hot_key'],
        enabled_features: ['hide_left_toolbar_by_default'],
      });
      try {
        widgetRef.current.onChartReady(() => { readyRef.current = true; setChartReady(true); });
      } catch { /* ignore */ }
    })();

    return () => {
      disposed = true;
      try { widgetRef.current?.remove?.(); } catch { /* ignore */ }
      widgetRef.current = null;
      readyRef.current = false;
      linesRef.current.clear();
      setChartReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Switch symbol without reloading the library ────────────────────────
  useEffect(() => {
    const sym = (selectedSymbol ?? 'EURUSD').toUpperCase();
    const w = widgetRef.current;
    if (!w || typeof w.onChartReady !== 'function') return;
    try { w.onChartReady(() => { try { w.chart().setSymbol(sym); } catch { /* ignore */ } }); } catch { /* ignore */ }
  }, [selectedSymbol]);

  const entityMapRef = useRef<Map<string, { positionId: string; leg: 'sl' | 'tp' }>>(new Map());
  const dragTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const suppressEidsRef = useRef<Set<string>>(new Set());
  const syncWarnedRef = useRef(false);
  // The not-yet-confirmed SL/TP line dropped by a button tap (see startPlacement).
  const placingLineRef = useRef<{ id: string; bandId?: string; entry: number; positionId: string; leg: 'sl' | 'tp' } | null>(null);

  const removePlacementLine = useCallback(() => {
    const p = placingLineRef.current;
    if (!p) return;
    placingLineRef.current = null;
    entityMapRef.current.delete(p.id);
    try {
      const w = widgetRef.current;
      const chart = typeof w?.activeChart === 'function' ? w.activeChart() : w?.chart?.();
      chart?.removeEntity(p.id);
      if (p.bandId) chart?.removeEntity(p.bandId);
    } catch { /* ignore */ }
  }, []);

  // ── Reconcile SL/TP/entry SHAPES with open positions on the symbol ─────
  const syncLines = useCallback(async () => {
    const w = widgetRef.current;
    if (!w || syncBusyRef.current) return;
    let chart: any;
    try { chart = typeof w.activeChart === 'function' ? w.activeChart() : w.chart(); } catch { return; }
    if (!chart || typeof chart.createShape !== 'function') {
      if (!syncWarnedRef.current) {
        syncWarnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn('[chart] createShape unavailable — SL/TP lines cannot render on this build.');
      }
      return;
    }

    syncBusyRef.current = true;
    try {
      const state = useTradingStore.getState();
      const sym = (state.selectedSymbol ?? 'EURUSD').toUpperCase();
      const rel = (state.positions || []).filter((p) => String(p.symbol).toUpperCase() === sym && !String(p.id ?? '').startsWith('optim-'));
      const relIds = new Set(rel.map((p) => p.id));
      const map = linesRef.current;

      let anchorTime = Math.floor(Date.now() / 1000);
      try { const vr = chart.getVisibleRange?.(); if (vr && Number.isFinite(vr.from)) anchorTime = Math.floor(vr.from); } catch { /* keep now */ }

      const removeEntity = (entityId?: string) => {
        if (entityId == null) return;
        try { chart.removeEntity(entityId); } catch { /* ignore */ }
        entityMapRef.current.delete(String(entityId));
      };

      for (const [id, set] of Array.from(map.entries())) {
        if (!relIds.has(id)) {
          removeEntity(set.entry?.id); removeEntity(set.sl?.id); removeEntity(set.tp?.id);
          removeEntity(set.slBand?.id); removeEntity(set.tpBand?.id);
          map.delete(id);
        }
      }

      const ensure = async (set: any, leg: 'entry' | 'sl' | 'tp', price: number, label: string, color: string, locked: boolean) => {
        const existing = set[leg];
        if (existing) {
          if (Math.abs(Number(existing.price) - price) > 1e-9) {
            suppressEidsRef.current.add(existing.id);
            try { chart.getShapeById(existing.id).setPoints([{ time: anchorTime, price }]); } catch { /* ignore */ }
            setTimeout(() => suppressEidsRef.current.delete(existing.id), 300);
            existing.price = price;
          }
          return;
        }
        const creatingKey = `${leg}Creating`;
        if (set[creatingKey]) return;
        set[creatingKey] = true;
        try {
          const id = await chart.createShape(
            { time: anchorTime, price },
            {
              shape: 'horizontal_line', text: label, lock: locked, disableSelection: locked,
              disableSave: true, disableUndo: true,
              overrides: {
                linecolor: color, linewidth: leg === 'entry' ? 1 : 2, linestyle: leg === 'entry' ? 2 : 0,
                showLabel: true, textcolor: color, horzLabelsAlign: 'right', showPrice: true, bold: true,
              },
            },
          );
          const sid = String(id);
          set[leg] = { id: sid, price };
          if (leg !== 'entry') entityMapRef.current.set(sid, { positionId: set.__pid, leg });
        } catch { /* ignore */ }
        set[creatingKey] = false;
      };

      // Full-width shaded zone between the entry and an SL/TP line (transparent
      // red for SL, green for TP), like the reference. It's a locked rectangle
      // spanning a very wide time range so it always covers the visible width.
      const bandFrom = anchorTime - 12 * 365 * 86400;
      const bandTo = anchorTime + 12 * 365 * 86400;
      const ensureBand = async (set: any, key: 'slBand' | 'tpBand', entryPrice: number, legPrice: number, color: string) => {
        const existing = set[key];
        if (existing) {
          if (Math.abs(Number(existing.price) - legPrice) > 1e-9 || Math.abs(Number(existing.entry) - entryPrice) > 1e-9) {
            suppressEidsRef.current.add(existing.id);
            try { chart.getShapeById(existing.id).setPoints([{ time: bandFrom, price: entryPrice }, { time: bandTo, price: legPrice }]); } catch { /* ignore */ }
            setTimeout(() => suppressEidsRef.current.delete(existing.id), 300);
            existing.price = legPrice; existing.entry = entryPrice;
          }
          return;
        }
        const creatingKey = `${key}Creating`;
        if (set[creatingKey]) return;
        set[creatingKey] = true;
        try {
          const id = await chart.createMultipointShape(
            [{ time: bandFrom, price: entryPrice }, { time: bandTo, price: legPrice }],
            {
              shape: 'rectangle', lock: true, disableSelection: true, disableSave: true, disableUndo: true,
              overrides: { backgroundColor: color, color, fillBackground: true, linewidth: 0, transparency: 82 },
            },
          );
          set[key] = { id: String(id), price: legPrice, entry: entryPrice };
        } catch { /* ignore */ }
        set[creatingKey] = false;
      };

      for (const p of rel) {
        let set = map.get(p.id);
        if (!set) { set = { __pid: p.id }; map.set(p.id, set); }
        const isCopy = p.trade_type === 'copy_trade';
        const entryPx = Number(p.open_price);

        await ensure(set, 'entry', entryPx, `${String(p.side ?? '').toUpperCase()} ${p.lots}`, '#64748b', true);

        if (!isCopy && p.stop_loss != null) {
          await ensure(set, 'sl', Number(p.stop_loss), 'SL', '#dc2626', false);
          await ensureBand(set, 'slBand', entryPx, Number(p.stop_loss), '#dc2626');
        } else { removeEntity(set.sl?.id); set.sl = undefined; removeEntity(set.slBand?.id); set.slBand = undefined; }
        if (!isCopy && p.take_profit != null) {
          await ensure(set, 'tp', Number(p.take_profit), 'TP', '#16a34a', false);
          await ensureBand(set, 'tpBand', entryPx, Number(p.take_profit), '#16a34a');
        } else { removeEntity(set.tp?.id); set.tp = undefined; removeEntity(set.tpBand?.id); set.tpBand = undefined; }
      }
    } finally {
      syncBusyRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!chartReady) return;
    void syncLines();
  }, [positions, selectedSymbol, chartReady, syncLines]);

  // ── Drag an SL/TP line → confirm + persist (debounced to release) ──────
  useEffect(() => {
    if (!chartReady) return;
    const w = widgetRef.current;
    if (!w || typeof w.subscribe !== 'function') return;
    const handler = (sourceId: unknown, type: string) => {
      if (type !== 'move' && type !== 'points_changed') return;
      const eid = String(sourceId);
      if (suppressEidsRef.current.has(eid)) return;
      const meta = entityMapRef.current.get(eid);
      if (!meta) return;
      // Live-follow the shaded zone while the line is being dragged.
      try {
        const ch = w.activeChart();
        const pr = ch.getShapeById(eid).getPoints()?.[0]?.price;
        const now = Math.floor(Date.now() / 1000);
        // Placement (temp) line → follow its own band.
        const place = placingLineRef.current;
        if (place && place.id === eid && place.bandId && pr != null && Number.isFinite(pr)) {
          const bId = place.bandId;
          suppressEidsRef.current.add(bId);
          ch.getShapeById(bId).setPoints([{ time: now - 12 * 365 * 86400, price: place.entry }, { time: now + 12 * 365 * 86400, price: Number(pr) }]);
          setTimeout(() => suppressEidsRef.current.delete(bId), 100);
        }
        // Existing (set) SL/TP line → follow its managed band.
        const set0 = linesRef.current.get(meta.positionId);
        const band = set0?.[meta.leg === 'sl' ? 'slBand' : 'tpBand'];
        if (band && pr != null && Number.isFinite(pr)) {
          suppressEidsRef.current.add(band.id);
          ch.getShapeById(band.id).setPoints([{ time: now - 12 * 365 * 86400, price: band.entry }, { time: now + 12 * 365 * 86400, price: Number(pr) }]);
          setTimeout(() => suppressEidsRef.current.delete(band.id), 100);
        }
      } catch { /* ignore */ }
      const timers = dragTimersRef.current;
      const prev = timers.get(eid);
      if (prev) clearTimeout(prev);
      timers.set(eid, setTimeout(() => {
        timers.delete(eid);
        let chart: any;
        try { chart = w.activeChart(); } catch { return; }
        let price: number | undefined;
        try { price = chart.getShapeById(eid).getPoints()?.[0]?.price; } catch { return; }
        if (price == null || !Number.isFinite(price)) return;
        const newPrice = Number(price);
        const revert = () => {
          const set = linesRef.current.get(meta.positionId);
          const cur = useTradingStore.getState().positions.find((x) => x.id === meta.positionId);
          const back = meta.leg === 'sl' ? cur?.stop_loss : cur?.take_profit;
          if (back != null) {
            suppressEidsRef.current.add(eid);
            try { chart.getShapeById(eid).setPoints([{ time: Math.floor(Date.now() / 1000), price: Number(back) }]); } catch { /* ignore */ }
            setTimeout(() => suppressEidsRef.current.delete(eid), 300);
            if (set && set[meta.leg]) set[meta.leg].price = Number(back);
          }
        };
        requestBracketRef.current?.(meta.positionId, meta.leg, newPrice, revert);
      }, 450));
    };
    try { w.subscribe('drawing_event', handler); } catch { /* ignore */ }
    return () => { try { w.unsubscribe('drawing_event', handler); } catch { /* ignore */ } };
  }, [chartReady]);

  // ── Tap an SL/TP button → drop a DRAGGABLE line at a sensible default ──
  // The user then drags the LINE itself; the chart moves it natively (smooth &
  // accurate on touch, unlike a button-to-chart pixel guess which this build
  // can't do reliably on mobile). Releasing pops the confirm via `drawing_event`
  // (the same handler that drags existing SL/TP lines). Works identically on
  // mobile and desktop.
  const startPlacement = useCallback((e: ReactPointerEvent, positionId: string, leg: 'sl' | 'tp') => {
    e.preventDefault();
    e.stopPropagation();
    const w = widgetRef.current;
    if (!w) return;
    let chart: any;
    try { chart = typeof w.activeChart === 'function' ? w.activeChart() : w.chart(); } catch { return; }
    if (!chart?.createShape) return;

    const st = useTradingStore.getState();
    const pos = st.positions.find((p) => p.id === positionId);
    if (!pos) return;

    // Drop any half-placed line from a previous tap.
    removePlacementLine();

    const color = leg === 'sl' ? '#dc2626' : '#16a34a';
    const q = st.prices[String(pos.symbol).toUpperCase()];
    const cur = Number(pos.side === 'buy' ? (q?.bid ?? pos.open_price) : (q?.ask ?? pos.open_price));
    if (!Number.isFinite(cur)) return;
    const off = Math.abs(cur) * 0.004 || 0.0004;
    const buy = pos.side === 'buy';
    // SL sits on the losing side, TP on the winning side of the current price,
    // so the default already passes the modify validation.
    const price = leg === 'sl' ? (buy ? cur - off : cur + off) : (buy ? cur + off : cur - off);
    let anchorTime = Math.floor(Date.now() / 1000);
    try { const vr = chart.getVisibleRange?.(); if (vr && Number.isFinite(vr.from)) anchorTime = Math.floor(vr.from); } catch { /* ignore */ }

    const entryPx = Number(pos.open_price);
    (async () => {
      try {
        const id = String(await chart.createShape(
          { time: anchorTime, price },
          { shape: 'horizontal_line', text: `${leg.toUpperCase()} ⇕ drag`, lock: false, disableSave: true, disableUndo: true,
            overrides: { linecolor: color, linewidth: 2, linestyle: 2, showLabel: true, textcolor: color, horzLabelsAlign: 'right', showPrice: true, bold: true } },
        ));
        entityMapRef.current.set(id, { positionId, leg });
        placingLineRef.current = { id, entry: entryPx, positionId, leg };
        // Shaded zone (entry → line) so the band shows WHILE placing, exactly as
        // it does after the level is set. Live-followed by the drag handler.
        try {
          const bandId = String(await chart.createMultipointShape(
            [{ time: anchorTime - 12 * 365 * 86400, price: entryPx }, { time: anchorTime + 12 * 365 * 86400, price }],
            { shape: 'rectangle', lock: true, disableSelection: true, disableSave: true, disableUndo: true,
              overrides: { backgroundColor: color, color, fillBackground: true, linewidth: 0, transparency: 82 } },
          ));
          if (placingLineRef.current && placingLineRef.current.id === id) placingLineRef.current.bandId = bandId;
        } catch { /* ignore */ }
      } catch { /* ignore */ }
    })();
  }, [removePlacementLine]);

  const closePositionFromChart = useCallback(async (positionId: string) => {
    try {
      await api.post(`/positions/${positionId}/close`, {});
      useTradingStore.getState().removePosition(positionId);
      await useTradingStore.getState().refreshPositions();
      toast.success('Position closed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to close position');
    }
  }, []);

  const computePnlAt = useCallback((pos: any, price: number): number => {
    const sym = String(pos.symbol).toUpperCase();
    const inst = useTradingStore.getState().instruments.find((i) => String(i.symbol).toUpperCase() === sym);
    const cs = Number(inst?.contract_size) || 100000;
    const pnl = pos.side === 'buy'
      ? (price - Number(pos.open_price)) * Number(pos.lots) * cs
      : (Number(pos.open_price) - price) * Number(pos.lots) * cs;
    const base = String(inst?.base_currency || sym.slice(0, 3)).toUpperCase();
    const quote = String(inst?.quote_currency || sym.slice(3, 6)).toUpperCase();
    if (!quote || quote === 'USD') return pnl;
    if (base === 'USD' && price) return pnl / price;
    const prices = useTradingStore.getState().prices;
    const usdQ = prices[`USD${quote}`];
    if (usdQ?.bid) return pnl / usdQ.bid;
    const qUsd = prices[`${quote}USD`];
    if (qUsd?.bid) return pnl * qUsd.bid;
    return pnl;
  }, []);

  const requestBracket = useCallback((positionId: string, leg: 'sl' | 'tp', price: number, revert?: () => void) => {
    const pos = useTradingStore.getState().positions.find((p) => p.id === positionId);
    if (!pos || !Number.isFinite(price)) { revert?.(); return; }
    confirmRevertRef.current = revert ?? null;
    setConfirm({
      positionId, leg, price: Number(price.toFixed(5)),
      side: pos.side, lots: pos.lots, symbol: pos.symbol, pnl: computePnlAt(pos, price),
    });
  }, [computePnlAt]);
  requestBracketRef.current = requestBracket;

  const confirmCancel = useCallback(() => {
    const r = confirmRevertRef.current;
    confirmRevertRef.current = null;
    setConfirm(null);
    r?.();
    removePlacementLine();   // drop a just-placed (unconfirmed) line
  }, [removePlacementLine]);

  const confirmSet = useCallback(async () => {
    if (!confirm) return;
    const { positionId, leg, price } = confirm;
    confirmRevertRef.current = null;
    setConfirm(null);
    // Drop the temp placement line; syncLines redraws the managed SL/TP line.
    removePlacementLine();
    const cur = useTradingStore.getState().positions.find((x) => x.id === positionId);
    const body: Record<string, number> = {};
    body[leg === 'sl' ? 'stop_loss' : 'take_profit'] = price;
    const other = leg === 'sl' ? cur?.take_profit : cur?.stop_loss;
    if (other != null) body[leg === 'sl' ? 'take_profit' : 'stop_loss'] = Number(other);
    try {
      await api.put(`/positions/${positionId}`, body);
      await useTradingStore.getState().refreshPositions();
      toast.success(`${leg.toUpperCase()} set @ ${price}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to set ${leg.toUpperCase()}`);
    }
  }, [confirm, removePlacementLine]);

  const chartSym = (selectedSymbol ?? 'EURUSD').toUpperCase();
  const panelPositions = positions.filter((p) => String(p.symbol).toUpperCase() === chartSym && !String(p.id ?? '').startsWith('optim-'));

  return (
    <div className={clsx('relative w-full h-full min-h-[200px] min-w-0 bg-bg-base')} data-tv-chart-root>
      <div id={CONTAINER_ID} ref={containerRef} className="h-full w-full min-h-[200px]" />

      {panelPositions.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center gap-1.5">
          {panelPositions.map((p) => {
            const profit = Number(p.profit ?? 0);
            const up = profit >= 0;
            const isCopy = p.trade_type === 'copy_trade';
            return (
              <div
                key={p.id}
                className="pointer-events-auto flex items-center gap-1 px-2 py-1 text-[11px] font-bold whitespace-nowrap rounded-md bg-bg-secondary/90 border border-border-primary shadow-lg backdrop-blur-sm"
              >
                <span className={p.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'}>
                  {String(p.side ?? '').toUpperCase()} {p.lots}
                </span>
                <span className={up ? 'text-emerald-500' : 'text-rose-500'}>
                  {up ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                </span>
                {!isCopy && (
                  <>
                    <button type="button" onPointerDown={(e) => startPlacement(e, p.id, 'sl')} className="rounded px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-black cursor-pointer touch-none" title="Tap to drop a stop-loss line, then drag it to the price">SL</button>
                    <button type="button" onPointerDown={(e) => startPlacement(e, p.id, 'tp')} className="rounded px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer touch-none" title="Tap to drop a take-profit line, then drag it to the price">TP</button>
                  </>
                )}
                <button type="button" onClick={() => closePositionFromChart(p.id)} className="rounded px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white" title="Close position">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 pointer-events-auto" onClick={confirmCancel}>
          <div className="w-[340px] max-w-[90%] rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-text-primary">
                Set {confirm.leg === 'sl' ? 'Stop Loss' : 'Take Profit'} @ {confirm.price}
              </h3>
              <button type="button" onClick={confirmCancel} className="text-text-tertiary hover:text-text-primary text-base leading-none" aria-label="Cancel">✕</button>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {confirm.side.toUpperCase()} {confirm.lots} {confirm.symbol} →{' '}
              {confirm.pnl >= 0 ? 'profit ' : 'loss '}
              <span className={confirm.pnl >= 0 ? 'font-bold text-emerald-500' : 'font-bold text-rose-500'}>
                {confirm.pnl >= 0 ? '+' : '-'}${Math.abs(confirm.pnl).toFixed(2)}
              </span>
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={confirmCancel} className="flex-1 rounded-lg bg-bg-hover text-text-secondary py-2 text-sm font-semibold hover:opacity-80">Cancel</button>
              <button type="button" onClick={() => void confirmSet()} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-sm font-bold">Set {confirm.leg.toUpperCase()}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AdvancedChart);
