import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'IB Management — SetupFX' };

export default function IbManagementPage() {
  return (
    <MarketingTemplate
      eyebrow="Solutions"
      title="IB Management"
      subtitle="A complete Introducing Broker management system to grow your partner network and automate commissions."
      leftHeading="Grow Your Partner Network"
      leftBody="Our IB Management system empowers you to build and manage a multi-tier introducing broker network with ease. Automate commission calculations, track referrals in real time, and give your IBs a branded portal to monitor their performance and earnings."
      features={[
        'Multi-tier IB commission structures',
        'Real-time commission tracking & payouts',
        'IB dashboard with client overview',
        'Automated rebate calculations',
        'Sub-IB management & hierarchy',
        'Custom referral link generation',
        'Performance analytics & reports',
        'White-label IB portal option',
      ]}
      rightHeading="IB System Highlights"
      rightItems={[
        { title: 'Multi-Tier Commissions', description: 'Support unlimited IB levels with flexible commission structures.' },
        { title: 'Real-Time Tracking', description: 'Live dashboards showing referrals, trades, and earnings.' },
        { title: 'Automated Payouts', description: 'Schedule automatic commission payments to your IBs.' },
        { title: 'IB Portal', description: 'Branded self-service portal for your introducing brokers.' },
      ]}
      ctaPrimary={{ label: 'Get a Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'See IB Admin Panel', href: '/solutions/ib-admin' }}
    />
  );
}
