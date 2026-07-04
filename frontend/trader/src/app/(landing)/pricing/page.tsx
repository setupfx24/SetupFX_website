import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Pricing — SetupFX' };

type Plan = {
  name: string;
  price: string;
  period: string;
  subPrice?: string;
  description: string;
  highlight?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

const DIGITAL_PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$2,499',
    period: 'starting from',
    description: 'Perfect for startups and small businesses getting started with digital.',
    features: [
      'Custom website or landing page',
      'Basic SEO setup',
      'Mobile responsive design',
      'Contact form integration',
      '3 months support',
      '1 revision round',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/company/contact',
  },
  {
    name: 'Growth',
    price: '$7,999',
    period: 'starting from',
    description: 'For growing businesses that need custom applications and marketing.',
    highlight: 'Most Popular',
    features: [
      'Custom web or mobile application',
      'Full SEO & content strategy',
      'CRM or admin panel',
      'Third-party integrations',
      '6 months support',
      'Unlimited revisions',
      'Dedicated project manager',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/company/contact',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored pricing',
    description: 'For large organizations with complex requirements and scale needs.',
    features: [
      'Enterprise-grade applications',
      'Full digital marketing suite',
      'Custom integrations & APIs',
      'Multi-platform deployment',
      '24/7 dedicated support',
      'SLA guarantee',
      'Dedicated development team',
      'Priority feature requests',
    ],
    ctaLabel: 'Contact Us',
    ctaHref: '/company/contact',
  },
];

const BROKERAGE_PLANS: Plan[] = [
  {
    name: 'Managed System',
    price: '₹10,00,000',
    period: 'One-Time',
    subPrice: '₹25,000 / Month Maintenance',
    description: 'Perfect for managed growth.',
    features: [
      'IB System',
      'Prop Trading Module',
      'Copy Trading',
      'Bot + Human Support System',
      'Company Incorporation (UK, USA, Canada Included)',
      'Mobile & Web Trading Terminals',
      'Managed System (No Source Code Access)',
      'Ongoing Updates & Support',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/company/contact',
  },
  {
    name: 'Premium Plan',
    price: '₹25,00,000',
    period: 'One-Time Payment',
    subPrice: '(With Source Code)',
    description: 'Complete control and ownership.',
    highlight: 'Most Popular',
    features: [
      'IB System',
      'Prop Trading Module',
      'Copy Trading',
      'Bot + Human Support System',
      'Company Incorporation (UK, USA, Canada Included)',
      'Mobile & Web Trading Terminals',
      'Full Source Code Access',
      'Lifetime Ownership',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/company/contact',
    featured: true,
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col ${
        featured
          ? 'liquid-glass-strong border border-primary/40 shadow-xl shadow-primary/15'
          : 'liquid-glass'
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block rounded-full bg-primary px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground">
          {plan.highlight}
        </span>
      )}
      <h3 className="font-display text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
      <p className="text-sm text-foreground/65 mb-5">{plan.description}</p>
      <div className="mb-6">
        <div className="font-display text-4xl font-bold text-foreground">{plan.price}</div>
        <div className="text-sm text-foreground/55 mt-1">{plan.period}</div>
        {plan.subPrice && <div className="text-xs text-primary mt-1">{plan.subPrice}</div>}
      </div>
      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="size-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/85">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.ctaHref}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-shadow ${
          featured
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
            : 'border border-foreground/20 bg-foreground/5 text-foreground/85 hover:bg-foreground/10'
        }`}
      >
        {plan.ctaLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
            Pricing
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Transparent pricing for every stage of your business. Choose the plan that fits your needs.
          </p>
        </div>

        {/* Digital Marketing */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Digital Marketing &amp; Software
            </h2>
            <p className="text-foreground/65 max-w-2xl mx-auto">
              Comprehensive digital marketing packages for businesses of all sizes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DIGITAL_PLANS.map((p) => (
              <PlanCard key={p.name} plan={p} />
            ))}
          </div>
        </section>

        {/* Brokerage Platform */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Brokerage Platform Pricing
            </h2>
            <p className="text-foreground/65 max-w-2xl mx-auto">
              Complete brokerage solutions with trading platforms, IB systems, and more.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {BROKERAGE_PLANS.map((p) => (
              <PlanCard key={p.name} plan={p} />
            ))}
          </div>
        </section>

        <div className="text-center mt-16">
          <p className="text-foreground/65 mb-4">Need a custom solution?</p>
          <Link
            href="/company/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Contact Us for a Tailored Proposal
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
