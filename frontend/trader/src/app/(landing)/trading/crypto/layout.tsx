import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Trading — BTC, ETH, and 50+ Digital Asset CFDs',
  description:
    'Trade Bitcoin, Ethereum and 50+ cryptocurrency CFDs on SetupFX. 24/7 markets, leveraged exposure, tight spreads.',
  openGraph: {
    title: 'Crypto Trading — BTC, ETH, and 50+ Digital Asset CFDs',
    description:
      'Trade Bitcoin, Ethereum and 50+ cryptocurrency CFDs on SetupFX. 24/7 markets, leveraged exposure, tight spreads.',
  },
  twitter: {
    title: 'Crypto Trading — BTC, ETH, and 50+ Digital Asset CFDs',
    description:
      'Trade Bitcoin, Ethereum and 50+ cryptocurrency CFDs on SetupFX. 24/7 markets, leveraged exposure, tight spreads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}