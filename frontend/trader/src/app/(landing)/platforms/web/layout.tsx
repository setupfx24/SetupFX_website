import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Trading Platform — Browser-Based Trading, No Download',
  description:
    'Access full-featured trading from any modern browser. Real-time charts, advanced indicators, and one-click execution on SetupFX WebTrader.',
  openGraph: {
    title: 'Web Trading Platform — Browser-Based Trading, No Download',
    description:
      'Access full-featured trading from any modern browser. Real-time charts, advanced indicators, and one-click execution on SetupFX WebTrader.',
  },
  twitter: {
    title: 'Web Trading Platform — Browser-Based Trading, No Download',
    description:
      'Access full-featured trading from any modern browser. Real-time charts, advanced indicators, and one-click execution on SetupFX WebTrader.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}