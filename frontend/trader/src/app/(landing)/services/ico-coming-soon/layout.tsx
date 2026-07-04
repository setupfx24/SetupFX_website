import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ICO & Early-Stage Investments — Coming Soon | SetupFX',
  description:
    'Early access to vetted blockchain projects, launching soon on SetupFX. Join the early-access list to be notified the moment the first ICO drops.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
