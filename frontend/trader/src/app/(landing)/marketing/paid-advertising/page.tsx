import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Paid Advertising — SetupFX' };

export default function PaidAdvertisingPage() {
  return (
    <MarketingTemplate
      eyebrow="Marketing"
      title="Paid Advertising"
      subtitle="Google Ads & social media campaigns that deliver results. We create and manage high-performing ad campaigns that maximize your return on investment."
      leftHeading="Performance-Driven Advertising"
      leftBody="We create targeted ad campaigns that reach the right audience at the right time. Our data-driven approach ensures every dollar of your ad spend works harder, delivering measurable results and maximum ROI."
      features={[
        'Google Ads (Search, Display, Shopping)',
        'Facebook & Instagram Ads',
        'LinkedIn Ads for B2B',
        'Retargeting & remarketing campaigns',
        'A/B testing & conversion optimization',
        'Detailed ROI reporting & analytics',
      ]}
      rightHeading="Ad Platforms"
      rightItems={[
        { title: 'Google Ads', description: 'Search, display, and shopping campaigns.' },
        { title: 'Meta Ads', description: 'Facebook & Instagram advertising.' },
        { title: 'LinkedIn Ads', description: 'B2B lead generation campaigns.' },
        { title: 'YouTube Ads', description: 'Video advertising for brand awareness.' },
      ]}
      ctaPrimary={{ label: 'Get a Free Consultation', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
