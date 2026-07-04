import { MarketingTemplate } from '@/setupfx/components/MarketingTemplate';

export const metadata = { title: 'CRM & Admin Panels — SetupFX' };

export default function CrmAdminPanelsPage() {
  return (
    <MarketingTemplate
      eyebrow="Solutions"
      title="CRM & Admin Panels"
      subtitle="Centralized management dashboards. We build powerful admin panels and CRM systems that give you complete control over your business operations."
      leftHeading="Powerful Management Tools"
      leftBody="We create intuitive admin panels and CRM systems that centralize your business data and operations. Our dashboards provide real-time insights, enabling faster decision-making and improved team productivity."
      features={[
        'Custom admin dashboards',
        'Role-based access control',
        'Real-time data visualization',
        'Client & partner portals',
        'Multi-tenant architecture',
        'Audit logs & compliance tools',
      ]}
      rightHeading="Dashboard Features"
      rightItems={[
        { title: 'Analytics Dashboard', description: 'Real-time metrics and KPI tracking.' },
        { title: 'User Management', description: 'Roles, permissions, and access control.' },
        { title: 'Data Tables', description: 'Sortable, filterable data with export options.' },
        { title: 'Notifications', description: 'Automated alerts and notification systems.' },
      ]}
      ctaPrimary={{ label: 'Get a Quote', href: '/company/contact' }}
      ctaSecondary={{ label: 'View Pricing', href: '/pricing' }}
    />
  );
}
