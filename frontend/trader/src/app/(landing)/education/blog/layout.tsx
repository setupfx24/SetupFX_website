import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Blog — Strategy, Analysis, Market News',
  description:
    'SetupFX trading blog: market analysis, strategy guides, platform updates, and educational content from senior analysts.',
  openGraph: {
    title: 'Trading Blog — Strategy, Analysis, Market News',
    description:
      'SetupFX trading blog: market analysis, strategy guides, platform updates, and educational content from senior analysts.',
  },
  twitter: {
    title: 'Trading Blog — Strategy, Analysis, Market News',
    description:
      'SetupFX trading blog: market analysis, strategy guides, platform updates, and educational content from senior analysts.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}