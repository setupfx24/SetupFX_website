import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard',
  description:
    'Complete back-office administration for SetupFX brokerage operations — user management, KYC review, trade oversight.',
  openGraph: {
    title: 'Super Admin Dashboard',
    description:
      'Complete back-office administration for SetupFX brokerage operations — user management, KYC review, trade oversight.',
  },
  twitter: {
    title: 'Super Admin Dashboard',
    description:
      'Complete back-office administration for SetupFX brokerage operations — user management, KYC review, trade oversight.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}