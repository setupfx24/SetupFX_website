import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Markets — Forex, Crypto, Commodities, Indices, Shares',
  description:
    'Trade 500+ instruments across forex, commodities, indices, crypto, and shares on SetupFX. Real-time pricing, deep liquidity, tight spreads.',
  openGraph: {
    title: 'Live Markets — Forex, Crypto, Commodities, Indices, Shares',
    description:
      'Trade 500+ instruments across forex, commodities, indices, crypto, and shares on SetupFX. Real-time pricing, deep liquidity, tight spreads.',
  },
  twitter: {
    title: 'Live Markets — Forex, Crypto, Commodities, Indices, Shares',
    description:
      'Trade 500+ instruments across forex, commodities, indices, crypto, and shares on SetupFX. Real-time pricing, deep liquidity, tight spreads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}