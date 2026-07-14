/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TradingView Trading Terminal — Broker API adapter. Renders each open position
 * as a line with live P&L, SL / TP / ✕ buttons ON the line, and draggable
 * brackets. Dragging a bracket and releasing pops the library's confirm dialog
 * ("Set Stop Loss @ X → loss $Y — Cancel / Set SL") and, on confirm, calls the
 * same server modify endpoint the panels use. This is the exact reference UX.
 *
 * We hide the library's own Account Manager panel (the app has its own
 * positions table) so this adapter only needs to feed positions + brackets to
 * the chart. Live P&L and server-side SL/TP closes flow in through the store
 * (fed by the trades WebSocket) → host.plUpdate / positionUpdate.
 */
import api from '@/lib/api/client';
import { useTradingStore, type Position as StorePosition } from '@/stores/tradingStore';

const Side = { Buy: 1, Sell: -1 } as const;
const OrderType = { Limit: 1, Market: 2, Stop: 3 } as const;
const OrderStatus = { Working: 6 } as const;
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
 *  render as draggable lines when the position already has them. */
function bracketOrders(p: StorePosition) {
  const out: any[] = [];
  const opp = p.side === 'buy' ? Side.Sell : Side.Buy;
  if (p.stop_loss && p.stop_loss > 0) {
    out.push({
      id: `${p.id}__sl`, symbol: p.symbol, type: OrderType.Stop, side: opp,
      qty: p.lots, status: OrderStatus.Working, stopPrice: p.stop_loss, price: p.stop_loss,
      parentId: p.id, parentType: ParentType.Position,
    });
  }
  if (p.take_profit && p.take_profit > 0) {
    out.push({
      id: `${p.id}__tp`, symbol: p.symbol, type: OrderType.Limit, side: opp,
      qty: p.lots, status: OrderStatus.Working, limitPrice: p.take_profit, price: p.take_profit,
      parentId: p.id, parentType: ParentType.Position,
    });
  }
  return out;
}

/** Approx account-currency P&L if the position closed at `price` (for the
 *  confirm dialog). Quote==USD is exact; other quotes are a close estimate. */
function pnlAt(p: StorePosition, price: number): number {
  const inst = instrumentFor(p.symbol);
  const cs = inst?.contract_size || 100000;
  const raw = p.side === 'buy'
    ? (price - p.open_price) * p.lots * cs
    : (p.open_price - price) * p.lots * cs;
  const quote = (inst?.quote_currency || (p.symbol.length >= 6 ? p.symbol.slice(3, 6) : 'USD')).toUpperCase();
  if (!quote || quote === 'USD') return raw;
  return price ? raw / price : raw;   // rough base=USD conversion
}

function money(n: number): string {
  const s = n >= 0 ? '+' : '-';
  return `${s}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function createBroker(host: any, accountId: string) {
  const shown = new Set<string>();
  const balanceWV = host.createWatchedValue ? host.createWatchedValue(0) : null;
  const equityWV = host.createWatchedValue ? host.createWatchedValue(0) : null;
  const plWV = host.createWatchedValue ? host.createWatchedValue(0) : null;

  const pushUpdates = () => {
    const st = useTradingStore.getState();
    const acct = st.activeAccount;
    if (acct) {
      balanceWV?.setValue(Number(acct.balance) || 0);
      equityWV?.setValue(Number(acct.equity) || 0);
    }
    const positions = openPositionsFor(accountId);
    const live = new Set<string>();
    let totalPl = 0;
    for (const p of positions) {
      live.add(p.id);
      try { host.positionUpdate(toBrokerPosition(p)); } catch { /* noop */ }
      try { host.plUpdate(p.id, Number(p.profit) || 0); } catch { /* noop */ }
      for (const o of bracketOrders(p)) { try { host.orderUpdate(o); } catch { /* noop */ } }
      totalPl += Number(p.profit) || 0;
      shown.add(p.id);
    }
    for (const id of Array.from(shown)) {
      if (!live.has(id)) {
        try { host.positionUpdate({ id, symbol: '', qty: 0, side: Side.Buy, avgPrice: 0 }); } catch { /* noop */ }
        shown.delete(id);
      }
    }
    plWV?.setValue(totalPl);
  };
  const unsub = useTradingStore.subscribe(pushUpdates);

  const revert = (p: StorePosition | undefined) => {
    if (!p) return;
    try { host.positionUpdate(toBrokerPosition(p)); } catch { /* noop */ }
    for (const o of bracketOrders(p)) { try { host.orderUpdate(o); } catch { /* noop */ } }
  };

  const adapter = {
    connectionStatus: () => ConnectionStatus.Connected,
    isTradable: async () => true,
    chartContextMenuActions: (e: any) =>
      (host.defaultContextMenuActions ? host.defaultContextMenuActions(e) : Promise.resolve([])),
    accountsMetainfo: async () => [{ id: accountId, name: 'Trading Account', type: 'live' as const }],
    currentAccount: () => accountId,

    // Required, but the Account Manager panel is disabled via
    // `trading_account_manager`, so this just needs to be a valid shape.
    accountManagerInfo: () => ({
      accountTitle: 'SetupFX',
      summary: balanceWV ? [
        { text: 'Balance', wValue: balanceWV, formatter: 'fixed' as any },
        { text: 'Equity', wValue: equityWV, formatter: 'fixed' as any },
        { text: 'Open P&L', wValue: plWV, formatter: 'fixed' as any },
      ] : [],
      orderColumns: [],
      positionColumns: [],
      pages: [],
    }),

    symbolInfo: async (symbol: string) => {
      const inst = instrumentFor(symbol);
      const digits = inst?.digits ?? 5;
      return {
        qty: { min: inst?.min_lot ?? 0.01, max: inst?.max_lot ?? 100, step: inst?.lot_step ?? 0.01 },
        pipValue: 1,
        pipSize: inst?.pip_size ?? 0.0001,
        minTick: 1 / Math.pow(10, digits),
        description: inst?.display_name || symbol,
        type: (inst?.segment as any) || 'forex',
      };
    },

    positions: async () => openPositionsFor(accountId).map(toBrokerPosition),
    orders: async () => openPositionsFor(accountId).flatMap(bracketOrders),
    executions: async () => [],

    // Drag + release a bracket → confirm dialog → server modify (§ reference).
    editPositionBrackets: async (positionId: string, brackets: any) => {
      const pos = useTradingStore.getState().positions.find((p) => p.id === positionId);
      if (!pos) return;

      const patch: { stop_loss?: number | null; take_profit?: number | null } = {};
      let title = 'Update SL/TP';
      let body = '';
      if ('stopLoss' in brackets) {
        const sl = brackets.stopLoss;
        patch.stop_loss = sl ?? null;
        if (sl) {
          const impact = pnlAt(pos, sl);
          title = `Set Stop Loss @ ${sl}`;
          body = `${pos.side.toUpperCase()} ${pos.lots} ${pos.symbol} → ${impact >= 0 ? 'profit' : 'loss'} ${money(impact)}`;
        }
      }
      if ('takeProfit' in brackets) {
        const tp = brackets.takeProfit;
        patch.take_profit = tp ?? null;
        if (tp) {
          const impact = pnlAt(pos, tp);
          title = `Set Take Profit @ ${tp}`;
          body = `${pos.side.toUpperCase()} ${pos.lots} ${pos.symbol} → ${impact >= 0 ? 'profit' : 'loss'} ${money(impact)}`;
        }
      }

      // Confirm on drag-release (clearing a bracket via ✕ skips the dialog).
      if (body && host.showSimpleConfirmDialog) {
        let ok = false;
        try { ok = await host.showSimpleConfirmDialog(title, body, 'Set', 'Cancel'); } catch { ok = false; }
        if (!ok) { revert(pos); return; }
      }

      try {
        await api.put(`/positions/${positionId}`, patch);
        await useTradingStore.getState().refreshPositions();
      } catch (e) {
        try { host.showNotification?.('SL/TP rejected', e instanceof Error ? e.message : 'Rejected', 1); } catch { /* noop */ }
        revert(pos);   // snap the line back to the server value
      }
    },

    closePosition: async (positionId: string) => {
      await api.post(`/positions/${positionId}/close`, {});
      useTradingStore.getState().removePosition(positionId);
      await useTradingStore.getState().refreshPositions();
    },

    // Not used from the chart (order ticket is the app's own panel).
    placeOrder: async () => { throw new Error('Use the order panel to place trades.'); },
    modifyOrder: async () => { /* brackets go through editPositionBrackets */ },
    cancelOrder: async (orderId: string) => {
      const [posId, kind] = String(orderId).split('__');
      if (!posId || !kind) return;
      const patch = kind === 'sl' ? { stop_loss: null } : { take_profit: null };
      await api.put(`/positions/${posId}`, patch);
      await useTradingStore.getState().refreshPositions();
    },

    destroy: () => { try { unsub(); } catch { /* noop */ } },
  };

  // Seed once.
  setTimeout(pushUpdates, 0);
  return adapter;
}

/** Broker feature flags for the on-line SL/TP UX. */
export const BROKER_CONFIG = {
  configFlags: {
    supportPositions: true,
    supportPositionBrackets: true,
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
