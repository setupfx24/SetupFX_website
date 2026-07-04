import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staking — Earn Passive Yield on Your Capital',
  description:
    'Lock your principal for guaranteed returns with SetupFX staking. Predictable monthly yields with transparent terms.',
  openGraph: {
    title: 'Staking — Earn Passive Yield on Your Capital',
    description:
      'Lock your principal for guaranteed returns with SetupFX staking. Predictable monthly yields with transparent terms.',
  },
  twitter: {
    title: 'Staking — Earn Passive Yield on Your Capital',
    description:
      'Lock your principal for guaranteed returns with SetupFX staking. Predictable monthly yields with transparent terms.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}