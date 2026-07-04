import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'Case Studies — SetupFX' };

const CASE_STUDIES = [
  {
    title: 'E-Commerce Platform for Fashion Brand',
    industry: 'Retail',
    result: '150% increase in online sales',
    description: 'Built a custom e-commerce platform with AI-powered recommendations, resulting in significant revenue growth.',
    tech: ['Next.js', 'Node.js', 'PostgreSQL'],
  },
  {
    title: 'CRM System for Real Estate Agency',
    industry: 'Real Estate',
    result: '40% faster deal closures',
    description: 'Developed a custom CRM that streamlined lead management and automated follow-ups for a growing agency.',
    tech: ['React', 'Python', 'MongoDB'],
  },
  {
    title: 'Mobile App for Fitness Startup',
    industry: 'Health & Fitness',
    result: '50K+ downloads in 3 months',
    description: 'Created a cross-platform fitness app with workout tracking, social features, and subscription management.',
    tech: ['React Native', 'Firebase', 'Stripe'],
  },
  {
    title: 'SEO Campaign for SaaS Company',
    industry: 'Technology',
    result: '300% organic traffic growth',
    description: 'Implemented a comprehensive SEO strategy that tripled organic traffic and doubled lead generation.',
    tech: ['SEO', 'Content Marketing', 'Analytics'],
  },
  {
    title: 'Admin Dashboard for Logistics Company',
    industry: 'Logistics',
    result: '60% reduction in manual work',
    description: 'Built a real-time dashboard for fleet management, route optimization, and automated reporting.',
    tech: ['React', 'Node.js', 'AWS'],
  },
  {
    title: 'Social Media Campaign for Restaurant Chain',
    industry: 'Food & Beverage',
    result: '200% engagement increase',
    description: 'Managed social media presence across platforms, creating viral content that drove foot traffic.',
    tech: ['Social Media', 'Paid Ads', 'Content'],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Resources
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
            Case Studies
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Real results from real clients. See how we have helped businesses achieve their goals through technology and marketing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((c) => (
            <article key={c.title} className="liquid-glass rounded-3xl p-7 hover:border-primary/35 transition-colors flex flex-col">
              <span className="inline-block self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
                {c.industry}
              </span>
              <h2 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">{c.title}</h2>
              <p className="text-primary text-sm font-semibold mb-3">{c.result}</p>
              <p className="text-sm text-foreground/65 leading-relaxed mb-5 flex-1">{c.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {c.tech.map((t) => (
                  <span key={t} className="text-[11px] rounded-md bg-foreground/5 border border-foreground/10 px-2 py-1 text-foreground/65 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/company/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Start Your Project
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
