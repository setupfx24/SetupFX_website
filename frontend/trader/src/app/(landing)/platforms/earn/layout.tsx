import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earn — Rewards, Staking, and Lifestyle Perks',
  description:
    'Earn rewards, stake assets for fixed returns, and unlock lifestyle perks as you trade on SetupFX.',
  openGraph: {
    title: 'Earn — Rewards, Staking, and Lifestyle Perks',
    description:
      'Earn rewards, stake assets for fixed returns, and unlock lifestyle perks as you trade on SetupFX.',
  },
  twitter: {
    title: 'Earn — Rewards, Staking, and Lifestyle Perks',
    description:
      'Earn rewards, stake assets for fixed returns, and unlock lifestyle perks as you trade on SetupFX.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}