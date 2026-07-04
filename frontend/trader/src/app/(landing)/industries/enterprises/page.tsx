import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'For Enterprises — SetupFX' };

export default function EnterprisesPage() {
  return (
    <MarketingTemplate
      eyebrow="Industries"
      title="Enterprises"
      subtitle="Complex systems & integrations. We deliver enterprise-grade solutions that handle the scale and complexity of large organizations."
      leftHeading="Enterprise Digital Transformation"
      leftBody="Large organizations face unique challenges — legacy systems, complex workflows, and strict compliance requirements. We help enterprises modernize their technology stack and implement solutions that drive efficiency at scale."
      features={[
        'Complex systems & integrations',
        'Enterprise-grade security & compliance',
        'Multi-department collaboration tools',
        'Custom ERP & workflow systems',
        'Data analytics & business intelligence',
        'Dedicated project management',
      ]}
      rightHeading="Enterprise Services"
      rightItems={[
        { title: 'Digital Transformation', description: 'Modernize legacy systems and processes.' },
        { title: 'System Integration', description: 'Connect disparate systems seamlessly.' },
        { title: 'Data Platform', description: 'Unified data analytics and BI solutions.' },
        { title: 'Compliance', description: 'Meet industry regulations and standards.' },
      ]}
      ctaPrimary={{ label: 'Talk to Sales', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Solutions', href: '/solutions/enterprise-applications' }}
    />
  );
}
