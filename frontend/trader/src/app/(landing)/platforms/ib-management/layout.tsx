import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IB Management Platform — Multi-Tier Partner Network',
  description:
    'Build and manage a multi-tier introducing broker network with SetupFX. Automated commissions, real-time analytics, branded partner dashboards.',
  openGraph: {
    title: 'IB Management Platform — Multi-Tier Partner Network',
    description:
      'Build and manage a multi-tier introducing broker network with SetupFX. Automated commissions, real-time analytics, branded partner dashboards.',
  },
  twitter: {
    title: 'IB Management Platform — Multi-Tier Partner Network',
    description:
      'Build and manage a multi-tier introducing broker network with SetupFX. Automated commissions, real-time analytics, branded partner dashboards.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}