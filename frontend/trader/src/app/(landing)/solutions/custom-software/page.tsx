import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Custom Software Solutions — SetupFX' };

export default function CustomSoftwarePage() {
  return (
    <MarketingTemplate
      eyebrow="Solutions"
      title="Custom Software Solutions"
      subtitle="Bespoke software for unique challenges. We design and build custom software that perfectly fits your business requirements."
      leftHeading="Tailored Software Solutions"
      leftBody="Off-the-shelf software does not always fit. We build custom solutions from the ground up, designed specifically for your workflows, processes, and goals. Our solutions grow with your business and adapt to changing needs."
      features={[
        'Bespoke software for unique business challenges',
        'Microservices & modular architecture',
        'Cloud-native development',
        'Legacy system modernization',
        'Data migration & system integration',
        '24/7 monitoring & support',
      ]}
      rightHeading="Solution Areas"
      rightItems={[
        { title: 'Process Automation', description: 'Streamline operations with custom workflows.' },
        { title: 'Data Management', description: 'Centralized data systems with real-time access.' },
        { title: 'Integration Hub', description: 'Connect all your tools and platforms seamlessly.' },
        { title: 'Legacy Modernization', description: 'Upgrade outdated systems to modern tech.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
