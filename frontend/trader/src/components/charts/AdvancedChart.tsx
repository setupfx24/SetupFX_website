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

// Tell the React Native app (when this runs inside its WebView) that an SL/TP
// drag is in progress, so it can freeze the surrounding ScrollView — otherwise
// the page scrolls instead of the line dragging. No-op in a normal browser.
function postDragToNative(active: boolean) {
  try {
    (window as unknown as { ReactNativeWebView?: { postMessage: (s: string) => void } })
      .ReactNativeWebView?.postMessage(JSON.stringify({ type: 'chart:drag', active }));
  } catch { /* ignore */ }
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
  // Active "press an SL/TP button and drag onto the chart" gesture, if any.
  const placingRef = useRef<boolean>(false);
  // Calibrated pane-top offset for Y→price (null → fall back to the estimate).
  const paneTopRef = useRef<number | null>(null);
  // Pill-pinning: each position's control pill is projected onto its entry line.
  const pillNodeRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastMouseYRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const paneTopSamplesRef = useRef<number[]>([]);

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
        // Existing (set) SL/TP line → follow its managed band while dragging.
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

  // Pin each position's control pill to its entry-price line. Advanced Charts
  // has no price→pixel API, so calibrate the pane's top offset from a crosshair
  // sample (exact on a linear scale) and re-project every frame from the live
  // visible price range — the pill then tracks zoom / pan / scroll. On touch the
  // finger position feeds the same calibration (mouse hover isn't available).
  useEffect(() => {
    if (!chartReady) return;
    const w = widgetRef.current;
    const container = containerRef.current;
    if (!w || !container) return;

    const getChart = (): any => { try { return w.activeChart(); } catch { return null; } };
    const readGeo = (chart: any) => {
      try {
        const pane = chart.getPanes?.()[0];
        const range = pane?.getMainSourcePriceScale?.()?.getVisiblePriceRange?.();
        const paneH = pane?.getHeight?.();
        if (!range || !paneH || range.to === range.from) return null;
        return { paneH: Number(paneH), top: Number(range.to), bottom: Number(range.from) };
      } catch { return null; }
    };

    const setY = (clientY: number) => { lastMouseYRef.current = clientY - container.getBoundingClientRect().top; };
    const onMove = (e: MouseEvent) => setY(e.clientY);
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) setY(t.clientY); };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('touchmove', onTouch, { passive: true });
    container.addEventListener('touchstart', onTouch, { passive: true });

    const onResize = () => { paneTopSamplesRef.current = []; };
    window.addEventListener('resize', onResize);

    let crossSub: any = null;
    const crossCb = (params: any) => {
      const price = params?.price;
      const my = lastMouseYRef.current;
      if (price == null || my == null) return;
      const chart = getChart();
      const geo = chart && readGeo(chart);
      if (!geo) return;
      const candidate = my - ((geo.top - Number(price)) / (geo.top - geo.bottom)) * geo.paneH;
      if (!Number.isFinite(candidate)) return;
      // Rolling median of 15 samples: accurate yet smooth (rejects per-move jitter).
      const arr = paneTopSamplesRef.current;
      arr.push(candidate);
      while (arr.length > 15) arr.shift();
      const sorted = [...arr].sort((a, b) => a - b);
      paneTopRef.current = sorted[Math.floor(sorted.length / 2)] ?? candidate;
    };
    try { crossSub = getChart()?.crossHairMoved?.(); crossSub?.subscribe(null, crossCb); } catch { /* ignore */ }

    const HIDE = 'translate(-50%, -9999px)';
    const tick = () => {
      const chart = getChart();
      const geo = chart && readGeo(chart);
      if (geo) {
        let paneTop = paneTopRef.current;
        if (paneTop == null) paneTop = container.getBoundingClientRect().height - geo.paneH - 46;
        const st = useTradingStore.getState();
        const sym = (st.selectedSymbol ?? 'EURUSD').toUpperCase();
        pillNodeRef.current.forEach((node, id) => {
          if (!node.isConnected) { pillNodeRef.current.delete(id); return; }
          const pos = st.positions.find((p) => p.id === id);
          if (!pos || String(pos.symbol).toUpperCase() !== sym) { node.style.transform = HIDE; return; }
          // Pin to the ENTRY line (open price) — a fixed level, so the pill sits
          // still instead of drifting with the live price.
          const pillPrice = Number(pos.open_price);
          const y = (paneTop as number) + ((geo.top - pillPrice) / (geo.top - geo.bottom)) * geo.paneH;
          node.style.transform = (y < (paneTop as number) - 6 || y > (paneTop as number) + geo.paneH + 6)
            ? HIDE : `translate(-50%, ${Math.round(y)}px)`;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('touchmove', onTouch);
      container.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', onResize);
      try { crossSub?.unsubscribe(null, crossCb); } catch { /* ignore */ }
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [chartReady]);

  // ── Press an SL/TP button and DRAG onto the chart to place the line ────
  // Pointer capture on the BUTTON makes pointermove/up fire on it reliably for
  // both mouse and TOUCH (this is what makes the finger drag the line on
  // mobile), and the chart doesn't pan under the finger. On touch the crosshair
  // doesn't fire, so the line follows via pixel→price; on desktop the crosshair
  // gives the exact price. postDragToNative() freezes the app's ScrollView so
  // the page doesn't scroll during the drag. (Ported 1:1 from the reference.)
  const startPlacement = useCallback((e: ReactPointerEvent, positionId: string, leg: 'sl' | 'tp') => {
    e.preventDefault();
    e.stopPropagation();
    if (placingRef.current) return;
    const btn = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const w = widgetRef.current;
    const container = containerRef.current;
    if (!w || !container) return;
    let chart: any;
    try { chart = typeof w.activeChart === 'function' ? w.activeChart() : w.chart(); } catch { return; }
    if (!chart?.createShape) return;

    const st = useTradingStore.getState();
    const pos = st.positions.find((p) => p.id === positionId);
    if (!pos) return;
    const color = leg === 'sl' ? '#dc2626' : '#16a34a';
    const q = st.prices[String(pos.symbol).toUpperCase()];
    const startPrice = Number(pos.side === 'buy' ? (q?.bid ?? pos.open_price) : (q?.ask ?? pos.open_price));
    if (!Number.isFinite(startPrice)) return;

    try { btn.setPointerCapture(pointerId); } catch { /* ignore */ }
    postDragToNative(true); // freeze the app's ScrollView during the drag

    placingRef.current = true;
    let lineId: string | null = null;
    let bandId: string | null = null;
    const entryPrice = Number(pos.open_price);
    let bandFrom = Math.floor(Date.now() / 1000);
    let bandTo = bandFrom + 1;
    let lastPrice = startPrice;
    let anchorTime = Math.floor(Date.now() / 1000);
    let lastCrossTs = 0;
    let crossSub: any = null;
    let done = false;

    const moveTo = (price: number) => {
      if (!Number.isFinite(price) || !lineId) return;
      lastPrice = Number(price);
      try { chart.getShapeById(lineId).setPoints([{ time: anchorTime, price: lastPrice }]); } catch { /* ignore */ }
      try {
        if (bandId) chart.getShapeById(bandId).setPoints([{ time: bandFrom, price: entryPrice }, { time: bandTo, price: lastPrice }]);
      } catch { /* ignore */ }
    };
    // Y (viewport) → price. This is how the line follows a TOUCH drag (the
    // mobile crosshair doesn't fire during a finger drag).
    const pixelToPrice = (clientY: number): number | null => {
      try {
        const rect = container.getBoundingClientRect();
        const pane = chart.getPanes?.()[0];
        const range = pane?.getMainSourcePriceScale?.()?.getVisiblePriceRange?.();
        const paneH = pane?.getHeight?.();
        if (!range || !paneH || range.to === range.from) return null;
        let paneTop = paneTopRef.current;
        if (paneTop == null) paneTop = rect.height - Number(paneH) - 46;
        const y = clientY - rect.top;
        return Number(range.to) - ((y - paneTop) / Number(paneH)) * (Number(range.to) - Number(range.from));
      } catch { return null; }
    };
    const onCross = (params: any) => {
      const p = params?.price;
      if (p == null || !Number.isFinite(p)) return;
      lastCrossTs = Date.now();
      moveTo(Number(p)); // desktop: exact price under the cursor
    };
    const onPointerMove = (ev: PointerEvent) => {
      // Only when the crosshair isn't driving (i.e. touch / mobile).
      if (Date.now() - lastCrossTs < 160) return;
      const price = pixelToPrice(ev.clientY);
      if (price != null) moveTo(price);
    };

    const finish = async () => {
      if (done) return;
      done = true;
      btn.removeEventListener('pointermove', onPointerMove);
      btn.removeEventListener('pointerup', finish);
      btn.removeEventListener('pointercancel', finish);
      window.removeEventListener('pointerup', finish, true);
      window.removeEventListener('mouseup', finish, true);
      window.removeEventListener('blur', finish);
      try { w.unsubscribe?.('mouse_up', finish); } catch { /* ignore */ }
      try { crossSub?.unsubscribe(null, onCross); } catch { /* ignore */ }
      try { btn.releasePointerCapture(pointerId); } catch { /* ignore */ }
      postDragToNative(false); // re-enable the app's ScrollView
      placingRef.current = false;
      // Drop the temp line + band and ASK before committing (modal shows P&L).
      try { if (lineId) chart.removeEntity(lineId); } catch { /* ignore */ }
      try { if (bandId) chart.removeEntity(bandId); } catch { /* ignore */ }
      requestBracketRef.current?.(positionId, leg, Number(lastPrice));
    };

    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup', finish);
    btn.addEventListener('pointercancel', finish);
    window.addEventListener('pointerup', finish, true);
    window.addEventListener('mouseup', finish, true);
    window.addEventListener('blur', finish);
    try { w.subscribe?.('mouse_up', finish); } catch { /* ignore */ }

    (async () => {
      try { const vr = chart.getVisibleRange?.(); if (vr && Number.isFinite(vr.from)) anchorTime = Math.floor(vr.from); } catch { /* ignore */ }
      if (done) return;
      try {
        lineId = String(await chart.createShape(
          { time: anchorTime, price: startPrice },
          { shape: 'horizontal_line', text: leg.toUpperCase(), lock: true, disableSave: true, disableUndo: true,
            overrides: { linecolor: color, linewidth: 2, linestyle: 0, showLabel: true, textcolor: color, horzLabelsAlign: 'right', showPrice: true, bold: true } },
        ));
      } catch { return; }
      if (done) { try { if (lineId) chart.removeEntity(lineId); } catch { /* ignore */ } return; }

      // Filled band from the entry line to the dragged level (transparent
      // red for SL / green for TP), spanning the visible time range.
      try {
        const vr2 = chart.getVisibleRange?.();
        if (vr2 && Number.isFinite(vr2.from) && Number.isFinite(vr2.to)) { bandFrom = Math.floor(vr2.from); bandTo = Math.floor(vr2.to); }
        if (!done && Number.isFinite(entryPrice) && typeof chart.createMultipointShape === 'function') {
          bandId = String(await chart.createMultipointShape(
            [{ time: bandFrom, price: entryPrice }, { time: bandTo, price: startPrice }],
            { shape: 'rectangle', lock: true, disableSave: true, disableUndo: true, disableSelection: true, zOrder: 'bottom',
              overrides: { backgroundColor: color, transparency: 82, fillBackground: true, color, linewidth: 0, linestyle: 2 } },
          ));
          if (done && bandId) { try { chart.removeEntity(bandId); } catch { /* ignore */ } }
        }
      } catch { /* band is optional */ }

      try { crossSub = chart.crossHairMoved?.(); crossSub?.subscribe(null, onCross); } catch { /* ignore */ }
    })();
  }, []);

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
  }, []);

  const confirmSet = useCallback(async () => {
    if (!confirm) return;
    const { positionId, leg, price } = confirm;
    confirmRevertRef.current = null;
    setConfirm(null);
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
  }, [confirm]);

  const chartSym = (selectedSymbol ?? 'EURUSD').toUpperCase();
  const panelPositions = positions.filter((p) => String(p.symbol).toUpperCase() === chartSym && !String(p.id ?? '').startsWith('optim-'));

  return (
    <div className={clsx('relative w-full h-full min-h-[200px] min-w-0 bg-bg-base')} data-tv-chart-root>
      <div id={CONTAINER_ID} ref={containerRef} className="h-full w-full min-h-[200px]" />

      {/* Loader shown until the widget fires onChartReady — no blank flash. */}
      {!chartReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white" aria-label="Loading chart">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 rounded-full border-[3px] border-gray-300 border-t-blue-600 animate-spin" />
            <span className="text-xs font-medium text-gray-500">Loading chart…</span>
          </div>
        </div>
      )}

      {panelPositions.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {panelPositions.map((p) => {
            const profit = Number(p.profit ?? 0);
            const up = profit >= 0;
            const isCopy = p.trade_type === 'copy_trade';
            return (
              <div
                key={p.id}
                ref={(el) => { if (el) pillNodeRef.current.set(p.id, el); else pillNodeRef.current.delete(p.id); }}
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[9999px] pointer-events-auto flex items-center gap-1 px-2 py-1 text-[11px] font-bold whitespace-nowrap rounded-md bg-bg-secondary/90 border border-border-primary shadow-lg backdrop-blur-sm"
              >
                <span className={p.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'}>
                  {String(p.side ?? '').toUpperCase()} {p.lots}
                </span>
                <span className={up ? 'text-emerald-500' : 'text-rose-500'}>
                  {up ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                </span>
                {!isCopy && (
                  <>
                    <button type="button" onPointerDown={(e) => startPlacement(e, p.id, 'sl')} className="rounded px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-black cursor-ns-resize touch-none select-none" title="Press and drag onto the chart to set the stop-loss">SL</button>
                    <button type="button" onPointerDown={(e) => startPlacement(e, p.id, 'tp')} className="rounded px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-ns-resize touch-none select-none" title="Press and drag onto the chart to set the take-profit">TP</button>
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
