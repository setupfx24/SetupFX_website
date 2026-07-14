'use client';

// Thin adapter: reads the selected symbol from the trading store and renders
// the self-hosted Advanced Charting Library chart (broker datafeed + SL/TP
// lines). Kept separate so the terminal page's dynamic import is a one-liner
// and the marketing pages keep using the lightweight TradingView widget.
import AdvancedChart from './AdvancedChart';
import { useTradingStore } from '@/stores/tradingStore';

export default function TerminalChart({ interval = '5' }: { interval?: string }) {
  const symbol = useTradingStore((s) => s.selectedSymbol);
  return <AdvancedChart symbol={symbol} interval={interval} theme="light" />;
}
