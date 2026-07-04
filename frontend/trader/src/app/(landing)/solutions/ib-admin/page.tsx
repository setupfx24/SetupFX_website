import { SolutionTemplate } from '@/setupfx/components/SolutionTemplate';

export const metadata = { title: 'IB & Admin Management — SetupFX' };

export default function IbAdminPage() {
  return (
    <SolutionTemplate
      badge="IB & Admin"
      headline="Multi-Level IB & Admin Management"
      subheadline="Build and manage a powerful introducing broker network with automated commissions, partner dashboards, and full admin control."
      description="Our IB & Admin system is designed for brokerages that rely on partner networks for client acquisition. Support unlimited IB levels with automatic hierarchy management, flexible commission models, and real-time analytics. Every partner gets their own branded dashboard to track referrals, commissions, and sub-partner performance. Admins get granular role-based access control, audit trails, and comprehensive reporting."
      ctaPrimary={{ label: 'Get Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'See IB Management', href: '/solutions/ib-management' }}
      featuresHeading="System Capabilities"
      features={[
        { title: 'Multi-Level IB Structure',   description: 'Unlimited IB levels with automatic hierarchy and inheritance rules.' },
        { title: 'Flexible Commission Models', description: 'Per-lot, spread-based, CPA, revenue share, or custom hybrid models.' },
        { title: 'Partner Dashboard',          description: 'Branded self-service portal for each IB to track performance and earnings.' },
        { title: 'Role-Based Admin Access',    description: 'Granular permissions for sales, compliance, finance, and operations teams.' },
        { title: 'Automated Payouts',          description: 'Scheduled commission payouts with approval workflows and audit trails.' },
        { title: 'Real-Time Reporting',        description: 'Live dashboards tracking referrals, conversions, volume, and revenue.' },
      ]}
      benefitsHeading="Why Brokers Choose It"
      benefits={[
        'Unlimited IB levels with automatic commission cascading',
        'Each partner gets a branded dashboard under your domain',
        'Flexible commission structures — per lot, CPA, spread, or hybrid',
        'Automated payout scheduling with multi-currency support',
        'Full audit trail for compliance and regulatory requirements',
        'Role-based admin access with granular permission controls',
        'Real-time analytics for partner performance tracking',
        'API access for custom integrations with your existing systems',
      ]}
      bottomCta={{
        heading: 'Power Up Your Partner Network',
        subheading: 'Schedule a walkthrough of the IB & Admin system and see how it can scale your partner program.',
        button: { label: 'Get Demo', href: '/company/contact' },
      }}
    />
  );
}
