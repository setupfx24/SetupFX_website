import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pro / ECN Account — RAW Spreads from 0.0 Pips',
  description:
    'Active traders unlock RAW pricing with the SetupFX Pro / ECN account. Spreads from 0.0 pips, .5 commission per lot, ,000 minimum.',
  openGraph: {
    title: 'Pro / ECN Account — RAW Spreads from 0.0 Pips',
    description:
      'Active traders unlock RAW pricing with the SetupFX Pro / ECN account. Spreads from 0.0 pips, .5 commission per lot, ,000 minimum.',
  },
  twitter: {
    title: 'Pro / ECN Account — RAW Spreads from 0.0 Pips',
    description:
      'Active traders unlock RAW pricing with the SetupFX Pro / ECN account. Spreads from 0.0 pips, .5 commission per lot, ,000 minimum.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}