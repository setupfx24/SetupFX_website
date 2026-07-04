import { SolutionTemplate } from '@/setupfx/components/SolutionTemplate';

export const metadata = { title: 'White-Label Platform — SetupFX' };

export default function WhiteLabelPage() {
  return (
    <SolutionTemplate
      badge="White-Label Platform"
      headline="Your Brand. Your Platform."
      subheadline="Get a complete, production-ready trading ecosystem that looks and feels 100% yours. From web trader and mobile apps to CRM and client portal — every pixel carries your brand identity."
      ctaPrimary={{ label: 'Get Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
      featuresHeading="What's Included"
      featuresSubheading="Everything you need to launch and run a successful brokerage."
      features={[
        { title: 'Full Brand Customization', description: 'Custom logos, colors, fonts, domains, and email templates across all platforms.' },
        { title: 'Web Trader Platform',     description: 'Browser-based trading with real-time charts, order management, and multi-asset support.' },
        { title: 'Mobile Trading App',      description: 'Flutter-based iOS & Android app published under your own developer account.' },
        { title: 'Client Portal & CRM',     description: 'Self-service dashboard for deposits, withdrawals, KYC, and complete admin panel.' },
        { title: 'Enterprise Security',     description: 'Bank-grade encryption, 2FA, DDoS protection, and full regulatory compliance.' },
        { title: 'Analytics & Reporting',   description: 'Real-time dashboards with trading volume, revenue, and client activity insights.' },
      ]}
      processHeading="How It Works"
      processSubheading="From consultation to go-live in 4 simple steps."
      processSteps={[
        { title: 'Consultation',  description: 'We discuss your brand, requirements, and target market.' },
        { title: 'Customization', description: 'Your platform is branded and configured to your specifications.' },
        { title: 'Testing',       description: 'Full QA, UAT, and performance testing before launch.' },
        { title: 'Go Live',       description: 'Deploy on your domain with ongoing support and updates.' },
      ]}
      benefitsHeading="Why Choose Our White-Label"
      benefitsSubheading="Built for brokers who want full control without the development headache."
      benefits={[
        '100% white-label — zero SetupFX branding visible to your clients',
        'Go live in as little as 2–4 weeks with a fully branded platform',
        'Mobile apps published under your own App Store & Play Store accounts',
        'Continuous updates and new features without any downtime',
        'Dedicated account manager and 24/7 technical support',
        'Scalable infrastructure that grows with your client base',
        'Multi-language and multi-currency support out of the box',
        'Full API access for custom integrations and third-party tools',
      ]}
      bottomCta={{
        heading: 'Ready to Launch Your Platform?',
        subheading: 'Schedule a free demo and see how our white-label solution can power your brokerage business.',
        button: { label: 'Get Demo', href: '/company/contact' },
      }}
    />
  );
}
