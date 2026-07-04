import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Enterprise Applications — SetupFX' };

export default function EnterpriseApplicationsPage() {
  return (
    <MarketingTemplate
      eyebrow="Solutions"
      title="Enterprise Applications"
      subtitle="Large-scale enterprise-grade systems. We build mission-critical applications that handle complex business requirements at scale."
      leftHeading="Enterprise-Grade Solutions"
      leftBody="We specialize in building large-scale applications that meet the demanding requirements of enterprise organizations. Our solutions are designed for high performance, security, and reliability at scale."
      features={[
        'Large-scale enterprise-grade systems',
        'High availability & fault tolerance',
        'Microservices architecture',
        'Enterprise security & compliance',
        'Multi-region deployment',
        'Dedicated support & SLA',
      ]}
      rightHeading="Enterprise Capabilities"
      rightItems={[
        { title: 'Scalability', description: 'Handle millions of users and transactions.' },
        { title: 'Security', description: 'Enterprise-grade encryption and compliance.' },
        { title: 'Integration', description: 'Connect with existing enterprise systems.' },
        { title: 'Support', description: 'Dedicated team with guaranteed SLA.' },
      ]}
      ctaPrimary={{ label: 'Talk to Sales', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
