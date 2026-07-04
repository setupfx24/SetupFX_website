import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Content Marketing — SetupFX' };

export default function ContentMarketingPage() {
  return (
    <MarketingTemplate
      eyebrow="Marketing"
      title="Content Marketing"
      subtitle="Engaging content that drives engagement and conversions. We create valuable content that attracts, educates, and converts your target audience."
      leftHeading="Content That Converts"
      leftBody="Great content is the foundation of digital marketing success. We create compelling, SEO-optimized content that positions your brand as an industry authority and drives organic traffic and conversions."
      features={[
        'Content strategy & editorial planning',
        'Blog writing & article creation',
        'Video content production',
        'Email marketing campaigns',
        'Infographics & visual content',
        'Content performance analytics',
      ]}
      rightHeading="Content Types"
      rightItems={[
        { title: 'Blog Posts', description: 'SEO-optimized articles that drive organic traffic.' },
        { title: 'Case Studies', description: 'Showcase your success stories and results.' },
        { title: 'Email Campaigns', description: 'Nurture leads with targeted email sequences.' },
        { title: 'Video Content', description: 'Engaging videos for social and web platforms.' },
      ]}
      ctaPrimary={{ label: 'Get a Free Consultation', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
