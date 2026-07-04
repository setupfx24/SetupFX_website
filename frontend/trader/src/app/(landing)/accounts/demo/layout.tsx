import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo Account — Trade with ,000 Virtual Funds',
  description:
    'Practice your strategies risk-free with a SetupFX demo account. ,000 virtual funds, real market conditions, no expiry.',
  openGraph: {
    title: 'Demo Account — Trade with ,000 Virtual Funds',
    description:
      'Practice your strategies risk-free with a SetupFX demo account. ,000 virtual funds, real market conditions, no expiry.',
  },
  twitter: {
    title: 'Demo Account — Trade with ,000 Virtual Funds',
    description:
      'Practice your strategies risk-free with a SetupFX demo account. ,000 virtual funds, real market conditions, no expiry.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}