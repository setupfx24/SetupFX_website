import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade Insurance — On-Chain Protection for Every Position',
  description:
    'Every SetupFX trade is policy-backed by on-chain insurance. If the market moves beyond defined thresholds, your insured amount is protected.',
  openGraph: {
    title: 'Trade Insurance — On-Chain Protection for Every Position',
    description:
      'Every SetupFX trade is policy-backed by on-chain insurance. If the market moves beyond defined thresholds, your insured amount is protected.',
  },
  twitter: {
    title: 'Trade Insurance — On-Chain Protection for Every Position',
    description:
      'Every SetupFX trade is policy-backed by on-chain insurance. If the market moves beyond defined thresholds, your insured amount is protected.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}