import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Standard Account —  Minimum, No Commission',
  description:
    'Get started trading with the SetupFX Standard account.  minimum deposit, commission-free, all-in spreads from 1.2 pips.',
  openGraph: {
    title: 'Standard Account —  Minimum, No Commission',
    description:
      'Get started trading with the SetupFX Standard account.  minimum deposit, commission-free, all-in spreads from 1.2 pips.',
  },
  twitter: {
    title: 'Standard Account —  Minimum, No Commission',
    description:
      'Get started trading with the SetupFX Standard account.  minimum deposit, commission-free, all-in spreads from 1.2 pips.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}