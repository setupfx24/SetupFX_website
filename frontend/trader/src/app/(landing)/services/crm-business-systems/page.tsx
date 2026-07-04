import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'CRM & Business Systems — SetupFX' };

export default function CrmBusinessSystemsPage() {
  return (
    <MarketingTemplate
      eyebrow="Services"
      title="CRM & Business Systems"
      subtitle="Custom CRM, ERP & admin panel development. We build centralized systems that streamline your operations and boost productivity."
      leftHeading="Centralized Business Management"
      leftBody="We design and develop custom CRM and business management systems that centralize your data, automate workflows, and provide actionable insights. Our solutions are tailored to fit your unique business processes."
      features={[
        'Custom CRM development & implementation',
        'ERP systems for business management',
        'Admin panels & back-office tools',
        'Client & partner portals',
        'Workflow automation & reporting',
        'Third-party integrations (payment, email, etc.)',
      ]}
      rightHeading="System Features"
      rightItems={[
        { title: 'Contact Management', description: 'Organize and track all client interactions.' },
        { title: 'Sales Pipeline', description: 'Visual deal tracking and forecasting.' },
        { title: 'Task Automation', description: 'Automate repetitive business processes.' },
        { title: 'Analytics & Reports', description: 'Real-time dashboards and custom reports.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
