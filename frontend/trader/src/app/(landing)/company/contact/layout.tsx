import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact SetupFX — Talk to Our Team',
  description:
    'Get in touch with SetupFX. 24/7 multilingual support via live chat, email, and WhatsApp.',
  openGraph: {
    title: 'Contact SetupFX — Talk to Our Team',
    description:
      'Get in touch with SetupFX. 24/7 multilingual support via live chat, email, and WhatsApp.',
  },
  twitter: {
    title: 'Contact SetupFX — Talk to Our Team',
    description:
      'Get in touch with SetupFX. 24/7 multilingual support via live chat, email, and WhatsApp.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}