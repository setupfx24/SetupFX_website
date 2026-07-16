'use client';

/**
 * Chrome-free advanced chart with draggable SL/TP — the SAME component the web
 * terminal uses (AdvancedChart), just bootstrapped standalone so the mobile
 * app can load it in a WebView and get the identical chart + on-chart SL/TP.
 *
 * The app injects auth/context before load:
 *   window.__SFX_TOKEN__   = JWT (used as Bearer for positions + modify)
 *   window.__SFX_SYMBOL__  = active symbol
 *   window.__SFX_ACCOUNT__ = trading account id
 * (Falls back to ?token=&symbol=&account= query params.)
 *
 * Candles come from the same backend as the web (public bars API); positions
 * are polled + streamed and drive AdvancedChart's SL/TP lines exactly as on web.
 */
import { useEffect, useRef, useState } from 'react';
import AdvancedChart from '@/components/charts/AdvancedChart';
import api from '@/lib/api/client';
import { useTradingStore } from '@/stores/tradingStore';
import { wsManager } from '@/lib/ws/wsManager';
import { tradeSocket } from '@/lib/ws/tradeSocket';
import { extractTicksFromPayload } from '@/lib/ws/normalizePricePayload';

/* eslint-disable @typescript-eslint/no-explicit-any */

function readCtx() {
  const w = window as any;
  const params = new URLSearchParams(window.location.search);
  return {
    token: String(w.__SFX_TOKEN__ || params.get('token') || ''),
    symbol: String(w.__SFX_SYMBOL__ || params.get('symbol') || 'XAUUSD').toUpperCase(),
    account: String(w.__SFX_ACCOUNT__ || params.get('account') || ''),
  };
}

export default function ChartPage() {
  const [booted, setBooted] = useState(false);
  const timersRef = useRef<Array<ReturnType<typeof setInterval>>>([]);

  useEffect(() => {
    let disposed = false;
    const store = useTradingStore.getState();
    const { token, symbol, account } = readCtx();

    store.setSelectedSymbol(symbol);
    if (token) api.setToken(token);   // Bearer — the WebView has no cookie

    (async () => {
      try {
        // Instruments (pricescale + contract_size for the chart + P&L).
        try {
          const inst = await api.get<any>('/instruments/');
          if (Array.isArray(inst)) store.setInstruments(inst);
        } catch { /* chart still works from bar data */ }

        // Active account (match the injected id, else the first live one).
        if (token) {
          try {
            const res = await api.get<any>('/accounts');
            const list = Array.isArray(res) ? res : (res?.items ?? []);
            const acct = list.find((a: any) => a.id === account) || list[0];
            if (acct) {
              store.setActiveAccount(acct);
              store.setAccounts(list);
              await store.refreshPositions();
              // Trades WS (JWT via ?token) — live fill/close so SL/TP lines
              // update instantly; the poll below is the fallback.
              try {
                tradeSocket.connect(acct.id, token);
                tradeSocket.subscribe((evt: any) => {
                  if (evt?.type === 'position_closed' && evt.position_id) {
                    store.removePosition(String(evt.position_id));
                  }
                  void store.refreshPositions();
                });
              } catch { /* poll covers it */ }
              // Poll positions + account as a fallback.
              timersRef.current.push(setInterval(() => {
                void store.refreshPositions();
                void store.refreshAccount();
              }, 1500));
            }
          } catch { /* no positions → chart still renders, just no SL/TP lines */ }
        }

        // Prices: live WS (anonymous) + REST poll fallback → drives P&L + bid-shift.
        wsManager.connect();
        wsManager.onMessage((data: unknown) => {
          for (const t of extractTicksFromPayload(data)) store.updatePrice(t);
        });
        const pollPrices = async () => {
          try {
            const raw = await api.get<unknown>('/instruments/prices/all', undefined, { timeoutMs: 15000 });
            for (const t of extractTicksFromPayload(raw)) store.updatePrice(t);
          } catch { /* transient */ }
        };
        void pollPrices();
        timersRef.current.push(setInterval(pollPrices, 1500));
      } finally {
        if (!disposed) setBooted(true);
      }
    })();

    return () => {
      disposed = true;
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current = [];
      try { tradeSocket.disconnect(); } catch { /* ignore */ }
      try { wsManager.disconnect(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AdvancedChart mounts immediately (history is public); positions stream in
  // and its SL/TP lines appear once they load. `booted` avoids an unused warning.
  void booted;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <AdvancedChart />
    </div>
  );
}
