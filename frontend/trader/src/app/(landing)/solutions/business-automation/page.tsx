import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Business Automation — SetupFX' };

export default function BusinessAutomationPage() {
  return (
    <MarketingTemplate
      eyebrow="Solutions"
      title="Business Automation"
      subtitle="Automate workflows and boost efficiency. We help businesses eliminate manual processes and focus on what matters most."
      leftHeading="Automate & Scale"
      leftBody="Manual processes slow your business down. We identify bottlenecks and implement automation solutions that save time, reduce errors, and allow your team to focus on high-value tasks that drive growth."
      features={[
        'Workflow automation & optimization',
        'Document management systems',
        'Automated reporting & analytics',
        'Email & notification automation',
        'Invoice & billing automation',
        'Custom API integrations',
      ]}
      rightHeading="Automation Areas"
      rightItems={[
        { title: 'Sales Automation', description: 'Automate lead nurturing and follow-ups.' },
        { title: 'HR Automation', description: 'Streamline hiring, onboarding, and payroll.' },
        { title: 'Finance Automation', description: 'Automated invoicing, billing, and reporting.' },
        { title: 'Operations', description: 'Optimize supply chain and inventory management.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
