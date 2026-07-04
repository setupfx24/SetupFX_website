import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic News & Market Updates',
  description:
    'Stay informed with SetupFX market news, central bank decisions, earnings reports, and macro events that move the markets.',
  openGraph: {
    title: 'Economic News & Market Updates',
    description:
      'Stay informed with SetupFX market news, central bank decisions, earnings reports, and macro events that move the markets.',
  },
  twitter: {
    title: 'Economic News & Market Updates',
    description:
      'Stay informed with SetupFX market news, central bank decisions, earnings reports, and macro events that move the markets.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}