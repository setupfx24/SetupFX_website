import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'For Small & Medium Businesses — SetupFX' };

export default function SmbPage() {
  return (
    <MarketingTemplate
      eyebrow="Industries"
      title="Small & Medium Businesses"
      subtitle="Growth-focused digital solutions. We help SMBs compete with larger companies through smart technology and marketing."
      leftHeading="Grow Your Business Digitally"
      leftBody="Small and medium businesses need smart, cost-effective solutions to compete in the digital landscape. We provide tailored services that help you attract more customers, streamline operations, and grow revenue."
      features={[
        'Growth-focused digital solutions',
        'Affordable pricing with flexible plans',
        'Website & e-commerce development',
        'Digital marketing & lead generation',
        'CRM & business process automation',
        'Ongoing support & maintenance',
      ]}
      rightHeading="SMB Solutions"
      rightItems={[
        { title: 'Business Website', description: 'Professional websites that convert visitors.' },
        { title: 'Online Store', description: 'E-commerce solutions to sell online.' },
        { title: 'Lead Generation', description: 'Digital marketing to attract new customers.' },
        { title: 'Business Tools', description: 'CRM and automation to save time.' },
      ]}
      ctaPrimary={{ label: 'Get Started', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
