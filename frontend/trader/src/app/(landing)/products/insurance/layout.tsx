import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade Insurance | SetupFX',
  description: 'On-chain trade insurance — every position policy-backed, automatic claim payout via smart contract.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
