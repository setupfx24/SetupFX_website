import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'For Startups — SetupFX' };

export default function StartupsPage() {
  return (
    <MarketingTemplate
      eyebrow="Industries"
      title="Startups"
      subtitle="MVP development & rapid scaling. We help startups go from idea to market-ready product in record time."
      leftHeading="Launch Faster, Scale Smarter"
      leftBody="We understand the startup world — speed matters, budgets are tight, and every decision counts. Our team helps you build MVPs quickly, validate ideas, and scale when you are ready, all without breaking the bank."
      features={[
        'MVP development & rapid prototyping',
        'Lean startup methodology',
        'Scalable architecture from day one',
        'Investor-ready product demos',
        'Growth hacking & user acquisition',
        'Flexible engagement models',
      ]}
      rightHeading="Startup Services"
      rightItems={[
        { title: 'MVP Development', description: 'Build and launch your product in weeks.' },
        { title: 'Product Design', description: 'User-centric design that attracts investors.' },
        { title: 'Technical Co-Founder', description: 'CTO-level guidance for your tech stack.' },
        { title: 'Growth Strategy', description: 'Data-driven user acquisition plans.' },
      ]}
      ctaPrimary={{ label: 'Book a Free Call', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
