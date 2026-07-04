import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Marketing Strategy — SetupFX' };

export default function MarketingStrategyPage() {
  return (
    <MarketingTemplate
      eyebrow="Marketing"
      title="Marketing Strategy"
      subtitle="Data-driven strategies for measurable growth. We create comprehensive marketing plans that align with your business goals."
      leftHeading="Strategic Growth Planning"
      leftBody="Every successful marketing campaign starts with a solid strategy. We analyze your market, competitors, and audience to create data-driven plans that maximize your marketing ROI and drive sustainable growth."
      features={[
        'Market research & competitor analysis',
        'Target audience identification',
        'Multi-channel marketing plans',
        'KPI setting & performance tracking',
        'Budget optimization & ROI analysis',
        'Quarterly strategy reviews & adjustments',
      ]}
      rightHeading="Strategy Components"
      rightItems={[
        { title: 'Market Analysis', description: 'Deep dive into your industry and competition.' },
        { title: 'Audience Mapping', description: 'Identify and segment your ideal customers.' },
        { title: 'Channel Strategy', description: 'Select the right platforms for maximum impact.' },
        { title: 'Performance Framework', description: 'Set measurable goals and tracking systems.' },
      ]}
      ctaPrimary={{ label: 'Get a Free Consultation', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
