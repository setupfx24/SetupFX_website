import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indices Trading — US500, NAS100, GER40 and 15+ Global Indices',
  description:
    'Trade global stock indices including US500, NASDAQ 100, DAX, FTSE 100 on SetupFX. Competitive leverage and no requotes.',
  openGraph: {
    title: 'Indices Trading — US500, NAS100, GER40 and 15+ Global Indices',
    description:
      'Trade global stock indices including US500, NASDAQ 100, DAX, FTSE 100 on SetupFX. Competitive leverage and no requotes.',
  },
  twitter: {
    title: 'Indices Trading — US500, NAS100, GER40 and 15+ Global Indices',
    description:
      'Trade global stock indices including US500, NASDAQ 100, DAX, FTSE 100 on SetupFX. Competitive leverage and no requotes.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}