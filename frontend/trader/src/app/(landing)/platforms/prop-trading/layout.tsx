import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prop Trading — Get Funded Up to ',
  description:
    'Prove your trading edge and access company capital up to ,000 with SetupFX prop trading programs. Keep up to 80% of profits.',
  openGraph: {
    title: 'Prop Trading — Get Funded Up to ',
    description:
      'Prove your trading edge and access company capital up to ,000 with SetupFX prop trading programs. Keep up to 80% of profits.',
  },
  twitter: {
    title: 'Prop Trading — Get Funded Up to ',
    description:
      'Prove your trading edge and access company capital up to ,000 with SetupFX prop trading programs. Keep up to 80% of profits.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}