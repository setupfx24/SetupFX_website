import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'For Global Brands — SetupFX' };

export default function GlobalBrandsPage() {
  return (
    <MarketingTemplate
      eyebrow="Industries"
      title="Global Brands"
      subtitle="World-class digital experiences. We partner with global brands to create exceptional digital products that reach millions worldwide."
      leftHeading="Global Digital Excellence"
      leftBody="Global brands need digital partners who understand scale, performance, and brand integrity. We deliver world-class solutions that maintain brand consistency while reaching diverse audiences across multiple markets and languages."
      features={[
        'World-class digital experiences',
        'Multi-language & multi-region support',
        'Brand consistency across platforms',
        'High-traffic performance optimization',
        'Global CDN & infrastructure',
        'White-glove service & dedicated team',
      ]}
      rightHeading="Global Capabilities"
      rightItems={[
        { title: 'Multi-Region', description: 'Deploy across global markets seamlessly.' },
        { title: 'Localization', description: 'Multi-language support and cultural adaptation.' },
        { title: 'Performance', description: 'Handle millions of concurrent users.' },
        { title: 'Brand Governance', description: 'Maintain consistency across all touchpoints.' },
      ]}
      ctaPrimary={{ label: 'Talk to Sales', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
