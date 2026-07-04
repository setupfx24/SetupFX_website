import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Types — Standard, Pro, ECN, VIP',
  description:
    'Choose the SetupFX account that matches your strategy. Standard from , Pro ECN from ,000 with RAW spreads, VIP from  with institutional pricing.',
  openGraph: {
    title: 'Account Types — Standard, Pro, ECN, VIP',
    description:
      'Choose the SetupFX account that matches your strategy. Standard from , Pro ECN from ,000 with RAW spreads, VIP from  with institutional pricing.',
  },
  twitter: {
    title: 'Account Types — Standard, Pro, ECN, VIP',
    description:
      'Choose the SetupFX account that matches your strategy. Standard from , Pro ECN from ,000 with RAW spreads, VIP from  with institutional pricing.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}