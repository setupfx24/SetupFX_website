import type { Metadata } from 'next';
import { FaqLd } from '@/components/seo/JsonLd';
import { FAQS } from './faqs-data';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about SetupFX services, pricing, technologies, project timelines, and ongoing support.',
  openGraph: {
    title: 'Frequently Asked Questions | SetupFX',
    description:
      'Answers to common questions about SetupFX services, pricing, technologies, project timelines, and ongoing support.',
  },
  twitter: {
    title: 'Frequently Asked Questions | SetupFX',
    description:
      'Answers to common questions about SetupFX services, pricing, technologies, project timelines, and ongoing support.',
  },
};

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaqLd items={FAQS.map((f) => ({ q: f.q, a: f.a }))} />
      {children}
    </>
  );
}
