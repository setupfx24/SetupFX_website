import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copy Trading — Replicate Top Traders Automatically',
  description:
    'Browse verified track records and automatically copy strategies from professional traders. Set your own risk and let proven traders trade for you.',
  openGraph: {
    title: 'Copy Trading — Replicate Top Traders Automatically',
    description:
      'Browse verified track records and automatically copy strategies from professional traders. Set your own risk and let proven traders trade for you.',
  },
  twitter: {
    title: 'Copy Trading — Replicate Top Traders Automatically',
    description:
      'Browse verified track records and automatically copy strategies from professional traders. Set your own risk and let proven traders trade for you.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}