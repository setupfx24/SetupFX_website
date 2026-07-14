/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TradingView Broker API adapter (Trading Terminal). This is what renders the
 * SL / TP / ✕ buttons ON the position line and lets the user drag brackets
 * straight from the chart — the exact UX in the reference.
 *
 * We only implement the positions + brackets + close surface (no order ticket
 * placement from the chart); everything maps to the same REST + WS the panels
 * use. Live P&L and server-side SL/TP closes flow in via the trades WebSocket
 * (the store), which we relay to the chart with host.plUpdate / positionUpdate.
 */
import api from '@/lib/api/client';
import { useTradingStore, type Position as StorePosition } from '@/stores/tradingStore';

// Broker enums (from charting_library.d.ts).
const Side = { Buy: 1, Sell: -1 } as const;
const OrderType = { Limit: 1, Market: 2, Stop: 3, StopLimit: 4 } as const;
const OrderStatus = { Filled: 2, Working: 6 } as const;
const ParentType = { Position: 2 } as const;
const ConnectionStatus = { Connected: 1 } as const;

function instrumentFor(symbol: string) {
  const sym = symbol.toUpperCase();
  return useTradingStore.getState().instruments.find(
    (i) => String(i.symbol).toUpperCase() === sym,
  );
}

function openPositionsFor(accountId: string): StorePosition[] {
  return useTradingStore.getState().positions.filter(
    (p) => !p.id.startsWith('optim-') && (!p.account_id || p.account_id === accountId),
  );
}

function toBrokerPosition(p: StorePosition) {
  return {
    id: p.id,
    symbol: p.symbol,
    qty: p.lots,
    side: p.side === 'buy' ? Side.Buy : Side.Sell,
    avgPrice: p.open_price,
  };
}

/** Existing SL/TP shown as bracket orders parented to the position, so they
 *  render as draggable lines when the position already has them set. */
function bracketOrdersFor(p: StorePosition) {
  const out: any[] = [];
  const oppSide = p.side === 'buy' ? Side.Sell : Side.Buy;
  if (p.stop_loss && p.stop_loss > 0) {
    out.push({
      id: `${p.id}__sl`, symbol: p.symbol, qty: p.lots, side: oppSide,
      type: OrderType.Stop, stopPrice: p.stop_loss, price: p.stop_loss,
      status: OrderStatus.Working, parentId: p.id, parentType: ParentType.Position,
    });
  }
  if (p.take_profit && p.take_profit > 0) {
    out.push({
      id: `${p.id}__tp`, symbol: p.symbol, qty: p.lots, side: oppSide,
      type: OrderType.Limit, limitPrice: p.take_profit, price: p.take_profit,
      status: OrderStatus.Working, parentId: p.id, parentType: ParentType.Position,
    });
  }
  return out;
}

export function createBroker(host: any, accountId: string) {
  const shown = new Set<string>();
  const money = (n: number) => (Number.isFinite(n) ? n : 0);

  // Push live P&L + position/bracket changes to the chart whenever the store
  // updates (the store is fed by the trades WS + the price stream), so a
  // server-side SL/TP close removes the line without any refresh.
  const unsub = useTradingStore.subscribe(() => {
    const positions = openPositionsFor(accountId);
    const live = new Set(positions.map((p) => p.id));
    for (const p of positions) {
      try { host.positionUpdate(toBrokerPosition(p)); } catch { /* noop */ }
      try { host.plUpdate(p.id, Number(p.profit) || 0); } catch { /* noop */ }
      for (const o of bracketOrdersFor(p)) { try { host.orderUpdate(o); } catch { /* noop */ } }
    }
    // Anything we previously showed that's now gone → flatten to qty 0 so the
    // chart line disappears.
    for (const id of Array.from(shown)) {
      if (!live.has(id)) {
        try { host.positionUpdate({ id, symbol: '', qty: 0, side: Side.Buy, avgPrice: 0 }); } catch { /* noop */ }
        shown.delete(id);
      }
    }
    positions.forEach((p) => shown.add(p.id));
  });

  const adapter = {
    // ── connection / account ────────────────────────────────────────────
    connectionStatus: () => ConnectionStatus.Connected,
    isTradable: async () => true,
    chartContextMenuActions: (e: any) =>
      (host.defaultContextMenuActions ? host.defaultContextMenuActions(e) : Promise.resolve([])),
    accountsMetainfo: async () => [{ id: accountId, name: 'Trading Account', type: 'live' as const }],
    currentAccount: () => accountId,

    accountManagerInfo: () => ({
      accountTitle: 'SetupFX',
      // Minimal Account Manager — the on-chart position lines are the point;
      // the bottom panel just needs a valid (empty) shape.
      summary: [],
      orderColumns: [],
      positionColumns: [],
      pages: [],
      contextMenuActions: (_e: any, actions: any[]) => Promise.resolve(actions),
    }),

    symbolInfo: async (symbol: string) => {
      const inst = instrumentFor(symbol);
      const digits = inst?.digits ?? 5;
      const minTick = 1 / Math.pow(10, digits);
      return {
        qty: {
          min: inst?.min_lot ?? 0.01,
          max: inst?.max_lot ?? 100,
          step: inst?.lot_step ?? 0.01,
        },
        pipValue: 1,
        pipSize: inst?.pip_size ?? 0.0001,
        minTick,
        description: inst?.display_name || symbol,
        type: (inst?.segment as any) || 'forex',
      };
    },

    // ── read models ─────────────────────────────────────────────────────
    positions: async () => openPositionsFor(accountId).map(toBrokerPosition),
    orders: async () => openPositionsFor(accountId).flatMap(bracketOrdersFor),
    executions: async () => [],

    // ── the SL/TP drag → server modify (§2) ─────────────────────────────
    editPositionBrackets: async (positionId: string, brackets: any) => {
      const before = useTradingStore.getState().positions.find((p) => p.id === positionId);
      const patch: { stop_loss?: number | null; take_profit?: number | null } = {};
      if ('stopLoss' in brackets) patch.stop_loss = brackets.stopLoss ?? null;
      if ('takeProfit' in brackets) patch.take_profit = brackets.takeProfit ?? null;
      try {
        await api.put(`/positions/${positionId}`, patch);
        await useTradingStore.getState().refreshPositions();
      } catch (e) {
        // Server rejected (e.g. would trigger instantly) — re-push the OLD
        // position so the dragged line snaps back, and surface the message.
        if (before) {
          try { host.positionUpdate(toBrokerPosition(before)); } catch { /* noop */ }
          for (const o of bracketOrdersFor(before)) { try { host.orderUpdate(o); } catch { /* noop */ } }
        }
        throw new Error(e instanceof Error ? e.message : 'Failed to update SL/TP');
      }
    },

    closePosition: async (positionId: string) => {
      await api.post(`/positions/${positionId}/close`, {});
      useTradingStore.getState().removePosition(positionId);
      await useTradingStore.getState().refreshPositions();
    },

    // ── order-ticket surface (not used from the chart) ──────────────────
    placeOrder: async () => {
      throw new Error('Use the order panel to place trades.');
    },
    modifyOrder: async () => { /* brackets go through editPositionBrackets */ },
    cancelOrder: async (orderId: string) => {
      // Cancelling a bracket line (the ✕ on an SL/TP line) clears that level.
      const [posId, kind] = String(orderId).split('__');
      if (!posId || !kind) return;
      const patch = kind === 'sl' ? { stop_loss: null } : { take_profit: null };
      await api.put(`/positions/${posId}`, patch);
      await useTradingStore.getState().refreshPositions();
    },

    // Called by the library on teardown.
    destroy: () => { try { unsub(); } catch { /* noop */ } },
  };

  // Seed initial P&L once the chart asks for positions.
  setTimeout(() => {
    for (const p of openPositionsFor(accountId)) {
      try { host.plUpdate(p.id, money(Number(p.profit))); } catch { /* noop */ }
      shown.add(p.id);
    }
  }, 0);

  return adapter;
}

/** Broker feature flags that drive the on-line SL/TP UX (spec §1). */
export const BROKER_CONFIG = {
  configFlags: {
    supportPositions: true,
    supportPositionBrackets: true,   // ← SL/TP buttons + draggable lines on the position line
    supportClosePosition: true,
    supportPLUpdate: true,
    supportOrderBrackets: false,
    supportOrdersHistory: false,
    supportLevel2Data: false,
    showQuantityInsteadOfAmount: true,
    supportEditAmount: false,
    supportMarketOrders: false,
    supportLimitOrders: false,
    supportStopOrders: false,
  },
};
