import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SetupFX — Built for Modern Traders',
  description:
    'SetupFX brings institutional-grade execution to every trader. Deep liquidity, modern engineering, and a relentless focus on the people who use the platform.',
  openGraph: {
    title: 'About SetupFX — Built for Modern Traders',
    description:
      'SetupFX brings institutional-grade execution to every trader. Deep liquidity, modern engineering, and a relentless focus on the people who use the platform.',
  },
  twitter: {
    title: 'About SetupFX — Built for Modern Traders',
    description:
      'SetupFX brings institutional-grade execution to every trader. Deep liquidity, modern engineering, and a relentless focus on the people who use the platform.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}