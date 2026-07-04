import { SolutionTemplate } from '@/setupfx/components/SolutionTemplate';

export const metadata = { title: 'Grey-Label Platform — SetupFX' };

export default function GreyLabelPage() {
  return (
    <SolutionTemplate
      badge="Grey-Label Platform"
      headline="Launch Your Brokerage In Days, Not Months."
      subheadline="Get a semi-branded trading platform with your logo and colors at a fraction of the cost of a full white-label. Ideal for startups and new brokers who want to test the market quickly."
      ctaPrimary={{ label: 'Get Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'Compare with White-Label', href: '/solutions/white-label' }}
      featuresHeading="What You Get"
      featuresSubheading="Everything you need to start your brokerage — without the complexity."
      features={[
        { title: 'Partial Branding',       description: 'Customize logos, colors, and key UI elements while leveraging our proven platform design.' },
        { title: 'Web Trading Platform',   description: 'Pre-built web trader with your branding applied — ready to go in days, not weeks.' },
        { title: 'Mobile App Access',      description: 'Branded mobile trading experience on iOS and Android with your logo and colors.' },
        { title: 'Pre-Configured Setup',   description: 'Platform comes pre-configured with symbols, spreads, and trading rules — just customize and launch.' },
        { title: 'Shared Infrastructure',  description: 'Benefit from enterprise-grade hosting, security, and uptime without managing your own servers.' },
        { title: 'Admin Dashboard',        description: 'Access a back-office panel to manage clients, view reports, and monitor trading activity.' },
      ]}
      comparison={{
        heading: 'Grey-Label vs White-Label',
        subheading: 'See how the two options compare — choose what fits your stage.',
        columns: ['Grey-Label', 'White-Label'],
        rows: [
          { label: 'Custom Logo & Colors',     left: '✓',     right: '✓' },
          { label: 'Custom Domain',            left: '—',     right: '✓' },
          { label: 'Full UI Customization',    left: '—',     right: '✓' },
          { label: 'Own App Store Listing',    left: '—',     right: '✓' },
          { label: 'Web & Mobile Trading',     left: '✓',     right: '✓' },
          { label: 'Admin Dashboard',          left: '✓',     right: '✓' },
          { label: 'Source Code Access',       left: '—',     right: '✓' },
          { label: 'Setup Time',               left: 'Days',  right: '2–4 Weeks' },
          { label: 'Cost',                     left: 'Lower', right: 'Higher' },
        ],
      }}
      benefitsHeading="Why Grey-Label?"
      benefitsSubheading="The smart way to enter the brokerage market."
      benefits={[
        'Lower upfront cost compared to full white-label',
        'Faster time to market — launch in days',
        'No server management or infrastructure overhead',
        'Ideal for new brokers and startups',
        'Upgrade path to full white-label when ready',
        'Ongoing updates and maintenance included',
        'Shared liquidity and execution infrastructure',
        'Dedicated support and onboarding assistance',
      ]}
      bottomCta={{
        heading: 'Ready to Get Started?',
        subheading: 'See the grey-label platform in action. Schedule a free demo and launch your brokerage in days.',
        button: { label: 'Get Demo', href: '/company/contact' },
      }}
    />
  );
}
