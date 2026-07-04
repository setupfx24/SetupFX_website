import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Trust SetupFX — Regulation, Security, Transparency',
  description:
    'SetupFX is regulated by CySEC with segregated client funds at tier-1 banks. Audited trade records, transparent pricing, no conflicts of interest.',
  openGraph: {
    title: 'Why Trust SetupFX — Regulation, Security, Transparency',
    description:
      'SetupFX is regulated by CySEC with segregated client funds at tier-1 banks. Audited trade records, transparent pricing, no conflicts of interest.',
  },
  twitter: {
    title: 'Why Trust SetupFX — Regulation, Security, Transparency',
    description:
      'SetupFX is regulated by CySEC with segregated client funds at tier-1 banks. Audited trade records, transparent pricing, no conflicts of interest.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}