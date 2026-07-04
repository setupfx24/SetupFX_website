import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'Web Application Development — SetupFX' };

export default function WebApplicationDevelopmentPage() {
  return (
    <MarketingTemplate
      eyebrow="Services"
      title="Web Application Development"
      subtitle="Scalable, responsive web apps built with modern stacks. We create fast, reliable web applications that deliver exceptional user experiences."
      leftHeading="Modern Web Applications"
      leftBody="We build high-performance web applications using cutting-edge frameworks and technologies. From simple landing pages to complex enterprise platforms, our solutions are designed to scale with your business."
      features={[
        'Responsive, mobile-first web applications',
        'Progressive Web Apps (PWA)',
        'Single Page Applications (SPA)',
        'E-commerce platforms & marketplaces',
        'Real-time dashboards & analytics',
        'Performance optimization & SEO-ready',
      ]}
      rightHeading="What We Build"
      rightItems={[
        { title: 'SaaS Platforms', description: 'Multi-tenant cloud applications with subscription management.' },
        { title: 'E-Commerce', description: 'Custom online stores with payment integration.' },
        { title: 'Dashboards', description: 'Real-time data visualization and analytics.' },
        { title: 'Portals', description: 'Client & admin portals with role-based access.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Case Studies', href: '/resources/case-studies' }}
    />
  );
}
