import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Tutorials — Learn to Trade Forex, Crypto, CFDs',
  description:
    'Step-by-step trading tutorials from SetupFX. Beginner to advanced strategies for forex, crypto, indices, and commodities.',
  openGraph: {
    title: 'Trading Tutorials — Learn to Trade Forex, Crypto, CFDs',
    description:
      'Step-by-step trading tutorials from SetupFX. Beginner to advanced strategies for forex, crypto, indices, and commodities.',
  },
  twitter: {
    title: 'Trading Tutorials — Learn to Trade Forex, Crypto, CFDs',
    description:
      'Step-by-step trading tutorials from SetupFX. Beginner to advanced strategies for forex, crypto, indices, and commodities.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}