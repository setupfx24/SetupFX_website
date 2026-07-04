import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Software Development — SetupFX' };

export default function SoftwareDevelopmentPage() {
  return (
    <MarketingTemplate
      eyebrow="Services"
      title="Software Development"
      subtitle="Custom software tailored to your business needs. We build robust, scalable applications that drive efficiency and growth."
      leftHeading="End-to-End Software Solutions"
      leftBody="From concept to deployment, we deliver custom software solutions that solve real business problems. Our team of experienced developers uses the latest technologies to build applications that are fast, secure, and scalable."
      features={[
        'Custom software tailored to your business needs',
        'Scalable architecture for growing businesses',
        'Agile development methodology',
        'Full-stack development expertise',
        'API development & third-party integrations',
        'Ongoing maintenance & support',
      ]}
      rightHeading="Our Tech Stack"
      rightItems={[
        'React / Next.js',
        'Node.js',
        'Python / Django',
        'TypeScript',
        'PostgreSQL',
        'MongoDB',
        'AWS / Azure',
        'Docker',
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
