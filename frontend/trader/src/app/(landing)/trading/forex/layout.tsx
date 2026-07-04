import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forex Trading — 80+ Currency Pairs with Tight Spreads',
  description:
    'Trade major, minor and exotic forex pairs on SetupFX. Spreads from 0.0 pips, 1:500 leverage, MT4 / MT5 / WebTrader access.',
  openGraph: {
    title: 'Forex Trading — 80+ Currency Pairs with Tight Spreads',
    description:
      'Trade major, minor and exotic forex pairs on SetupFX. Spreads from 0.0 pips, 1:500 leverage, MT4 / MT5 / WebTrader access.',
  },
  twitter: {
    title: 'Forex Trading — 80+ Currency Pairs with Tight Spreads',
    description:
      'Trade major, minor and exotic forex pairs on SetupFX. Spreads from 0.0 pips, 1:500 leverage, MT4 / MT5 / WebTrader access.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}