import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SetupFX Academy — Video Lessons | Forex & Crypto Education',
  description: 'Bite-sized video lessons on forex, crypto, strategy, and the SetupFX platform. Filter by category, level, and topic.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
