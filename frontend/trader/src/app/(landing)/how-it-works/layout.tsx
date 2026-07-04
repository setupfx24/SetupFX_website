import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — From Sign Up to Live Trading in Minutes',
  description:
    'Open an account in three minutes, fund via card/bank/crypto, and start trading global markets with SetupFX. Step-by-step onboarding.',
  openGraph: {
    title: 'How It Works — From Sign Up to Live Trading in Minutes',
    description:
      'Open an account in three minutes, fund via card/bank/crypto, and start trading global markets with SetupFX. Step-by-step onboarding.',
  },
  twitter: {
    title: 'How It Works — From Sign Up to Live Trading in Minutes',
    description:
      'Open an account in three minutes, fund via card/bank/crypto, and start trading global markets with SetupFX. Step-by-step onboarding.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}