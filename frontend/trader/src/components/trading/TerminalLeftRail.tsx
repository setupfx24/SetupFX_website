'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SetupFXWordmark } from '@/components/layout/SetupFXWordmark';
import {
  Search,
  Plus,
  PanelBottom,
  ArrowDownUp,
  LayoutTemplate,
  ChartCandlestick,
  Newspaper,
  MessageCircle,
  Settings,
  Calculator,
} from 'lucide-react';
import { clsx } from 'clsx';
import { wsManager, type ConnectionStatus } from '@/lib/ws/wsManager';

/** Kept for API back-compat (callers pass activeSpace / onSpaceChange) —
 *  the Spaces section itself has been removed from the rail. */
export type TerminalSpaceId = 'balanced' | 'chart' | 'trading';

interface TerminalLeftRailProps {
  /** No longer driven by the rail; left in the type so parent calls compile. */
  activeSpace?: TerminalSpaceId;
  onSpaceChange?: (id: TerminalSpaceId) => void;
  terminalMarketsOpen: boolean;
  onToggleMarkets: () => void;
  bottomPanelCollapsed: boolean;
  onToggleBottomPanel: () => void;
  onFocusSymbolSearch: () => void;
  chartExpanded: boolean;
  terminalNewsOpen: boolean;
  /** Right rail: symbol list + quotes */
  onPanelsSelectMarkets: () => void;
  /** Right rail: buy / sell order panel */
  onPanelsSelectOrder: () => void;
  /** Chart focus mode (expanded chart area; use with terminal page handler) */
  onExpandFullChart: () => void;
  /** Right rail: TradingView live news timeline */
  onPanelsSelectNews: () => void;
  /** Right rail: Risk calculator */
  terminalCalcOpen?: boolean;
  onPanelsSelectCalc?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block w-full text-center text-[8px] font-semibold tracking-[0.12em] text-text-tertiary/60 uppercase px-0.5 mt-3 mb-1.5 first:mt-0">
      {children}
    </span>
  );
}

function RailBtn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'w-9 h-9 rounded-md flex items-center justify-center transition-colors shrink-0',
        active
          ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]'
          : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
      )}
    >
      {children}
    </button>
  );
}

export default function TerminalLeftRail({
  terminalMarketsOpen,
  onToggleMarkets,
  bottomPanelCollapsed,
  onToggleBottomPanel,
  onFocusSymbolSearch,
  chartExpanded,
  terminalNewsOpen,
  onPanelsSelectMarkets,
  onPanelsSelectOrder,
  onExpandFullChart,
  onPanelsSelectNews,
  terminalCalcOpen,
  onPanelsSelectCalc,
}: TerminalLeftRailProps) {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const unsub = wsManager.onStatusChange(setWsStatus);
    return () => {
      unsub();
    };
  }, []);

  const statusTitle =
    wsStatus === 'connected'
      ? 'Live quotes connected'
      : wsStatus === 'connecting'
        ? 'Connecting…'
        : 'Disconnected';

  const statusDot = clsx(
    'w-2 h-2 rounded-full',
    wsStatus === 'connected' && 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    wsStatus === 'connecting' && 'bg-amber-500 animate-pulse',
    wsStatus === 'disconnected' && 'bg-red-500/90',
  );

  return (
    <aside
      className="shrink-0 w-[52px] flex flex-col items-stretch border-r border-border-primary bg-bg-secondary z-[5]"
      aria-label="Terminal toolbar"
    >
      <div className="flex flex-col items-center gap-0.5 pt-2 pb-1 px-1.5 border-b border-border-primary">
        <div className="mb-1 flex justify-center w-full">
          <SetupFXWordmark href="/accounts" variant="rail" />
        </div>
        <RailBtn title="Search symbols" onClick={onFocusSymbolSearch}>
          <Search size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn title="Markets / add symbol" onClick={onToggleMarkets}>
          <Plus size={17} strokeWidth={1.75} />
        </RailBtn>
      </div>

      <div className="flex-1 flex flex-col items-center px-1.5 overflow-y-auto overflow-x-hidden min-h-0 py-1">
        {/* The legacy "Spaces" section (Balanced / Chart focus / Order
            focus preset widths) has been retired — the changes were too
            subtle to notice and the Chart-focus icon overlapped with the
            ChartCandlestick Panels button below. Users can now adjust
            column widths directly via the resize handle between the
            chart and the right rail. */}
        <SectionLabel>Panels</SectionLabel>
        <RailBtn
          title="Markets — symbols & prices"
          active={terminalMarketsOpen && !chartExpanded && !terminalNewsOpen}
          onClick={onPanelsSelectMarkets}
        >
          <ArrowDownUp size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Buy / Sell — order panel"
          active={!terminalMarketsOpen && !chartExpanded && !terminalNewsOpen}
          onClick={onPanelsSelectOrder}
        >
          <LayoutTemplate size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Chart focus — max chart + buy/sell rail"
          active={chartExpanded && !terminalNewsOpen}
          onClick={onExpandFullChart}
        >
          <ChartCandlestick size={17} strokeWidth={1.75} />
        </RailBtn>
        <RailBtn
          title="Live news — TradingView timeline"
          active={terminalNewsOpen && !chartExpanded}
          onClick={onPanelsSelectNews}
        >
          <Newspaper size={17} strokeWidth={1.75} />
        </RailBtn>
        {onPanelsSelectCalc && (
          <RailBtn
            title="Risk Calculator"
            active={!!terminalCalcOpen && !chartExpanded && !terminalNewsOpen}
            onClick={onPanelsSelectCalc}
          >
            <Calculator size={17} strokeWidth={1.75} />
          </RailBtn>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 px-1.5 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] border-t border-border-primary">
        <RailBtn
          title={bottomPanelCollapsed ? 'Show positions strip' : 'Hide positions strip'}
          active={bottomPanelCollapsed}
          onClick={onToggleBottomPanel}
        >
          <PanelBottom size={17} strokeWidth={1.75} />
        </RailBtn>
        <Link
          href="/support"
          title="Support chat"
          className="w-9 h-9 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <MessageCircle size={17} strokeWidth={1.75} />
        </Link>
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center"
          title={statusTitle}
        >
          <span className={statusDot} />
        </div>
        <Link
          href="/profile"
          title="Settings"
          className="w-9 h-9 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <Settings size={17} strokeWidth={1.75} />
        </Link>
      </div>
    </aside>
  );
}
