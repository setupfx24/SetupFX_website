import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commodities Trading — Gold, Silver, Oil, Natural Gas',
  description:
    'Diversify your portfolio with precious metals, energy, and agricultural commodity CFDs on SetupFX.',
  openGraph: {
    title: 'Commodities Trading — Gold, Silver, Oil, Natural Gas',
    description:
      'Diversify your portfolio with precious metals, energy, and agricultural commodity CFDs on SetupFX.',
  },
  twitter: {
    title: 'Commodities Trading — Gold, Silver, Oil, Natural Gas',
    description:
      'Diversify your portfolio with precious metals, energy, and agricultural commodity CFDs on SetupFX.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}