import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Social Media Marketing — SetupFX' };

export default function SocialMediaPage() {
  return (
    <MarketingTemplate
      eyebrow="Marketing"
      title="Social Media Marketing"
      subtitle="Build brand presence across platforms. We create engaging social media strategies that grow your audience and drive meaningful engagement."
      leftHeading="Social Media Excellence"
      leftBody="We help brands build authentic connections with their audience through strategic social media management. From content creation to community engagement, we handle every aspect of your social presence."
      features={[
        'Social media strategy & planning',
        'Content creation & scheduling',
        'Community management & engagement',
        'Influencer marketing partnerships',
        'Social media analytics & reporting',
        'Brand reputation management',
      ]}
      rightHeading="Platforms We Manage"
      rightItems={[
        { title: 'Instagram', description: 'Visual storytelling and brand building.' },
        { title: 'LinkedIn', description: 'Professional networking and B2B engagement.' },
        { title: 'Facebook', description: 'Community building and audience growth.' },
        { title: 'Twitter / X', description: 'Real-time engagement and thought leadership.' },
      ]}
      ctaPrimary={{ label: 'Get a Free Audit', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
