import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Search Engine Optimization — SetupFX' };

export default function SeoPage() {
  return (
    <MarketingTemplate
      eyebrow="Marketing"
      title="Search Engine Optimization"
      subtitle="Rank higher and drive organic traffic. We implement proven SEO strategies that improve your visibility and bring qualified leads."
      leftHeading="Dominate Search Results"
      leftBody="Our SEO experts use white-hat techniques and data-driven approaches to improve your search engine rankings. We focus on sustainable, long-term results that drive consistent organic traffic to your website."
      features={[
        'Technical SEO audits & optimization',
        'Keyword research & content strategy',
        'On-page & off-page SEO',
        'Local SEO & Google Business Profile',
        'Link building & authority development',
        'Monthly reporting & rank tracking',
      ]}
      rightHeading="SEO Services"
      rightItems={[
        { title: 'Technical SEO', description: 'Site speed, crawlability, and indexing optimization.' },
        { title: 'Content SEO', description: 'Keyword-optimized content that ranks and converts.' },
        { title: 'Local SEO', description: 'Dominate local search results in your area.' },
        { title: 'Link Building', description: 'High-quality backlinks from authoritative sources.' },
      ]}
      ctaPrimary={{ label: 'Get a Free Audit', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
