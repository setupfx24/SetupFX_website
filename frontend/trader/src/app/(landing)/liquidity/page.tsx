import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Liquidity Solutions — SetupFX' };

const CLIENT_INTEGRATION = [
  'Connect your liquidity to Web & Mobile platforms',
  'Configure pricing, symbols, and spreads',
  'Ensure fast execution and stability',
  'Full compatibility with your CRM & admin panel',
];

const SETUPFX_LIQUIDITY = [
  'Forex, Crypto, Commodities, Indices & CFDs',
  'Tight spreads & deep market depth',
  'High-speed execution with low latency',
  'Stable performance during high volatility',
];

const A_B_BOOK = [
  { title: 'A-Book',           description: 'Pass orders directly to liquidity providers.' },
  { title: 'B-Book',           description: 'Internalize orders with risk controls.' },
  { title: 'Smart Routing',    description: 'Automatic order routing logic.' },
  { title: 'Risk Management',  description: 'Real-time exposure monitoring.' },
];

const COMPATIBILITY = [
  'Web Trading Platforms',
  'Mobile Trading Apps (Android & iOS)',
  'White-Label Trading Systems',
  'Copy Trading, PAM & MAM',
  'CRM & Admin Dashboards',
];

const WHY = [
  'Use your own liquidity or ours',
  'Fast and secure integrations',
  'Scalable infrastructure',
  'Transparent setup',
  'Dedicated technical support',
];

export default function LiquidityPage() {
  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      {/* HERO */}
      <section className="mx-auto max-w-5xl text-center mb-20">
        <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-primary mb-6">
          Liquidity by SetupFX
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
          End-to-End Liquidity Solutions
        </h1>
        <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed mb-8">
          SetupFX offers end-to-end liquidity solutions for brokers and trading firms. We integrate your existing liquidity providers or supply our own deep liquidity, based on your business needs.
        </p>
        <Link
          href="/company/contact"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
        >
          Discuss Your Liquidity Setup
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* TWO WAYS */}
      <section className="mx-auto max-w-6xl mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Two Ways We Handle Liquidity
          </h2>
          <p className="text-foreground/65 max-w-2xl mx-auto">
            Choose the model that fits your business — or combine both for maximum flexibility.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="liquid-glass rounded-3xl p-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Client Liquidity Integration</h3>
            <p className="text-sm text-primary font-semibold mb-3">Already working with a liquidity provider?</p>
            <p className="text-foreground/70 leading-relaxed mb-6">
              No problem. SetupFX can connect and configure your existing liquidity with your platform. You stay in control of your liquidity relationships — we handle the technology.
            </p>
            <ul className="space-y-3">
              {CLIENT_INTEGRATION.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/85 text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="liquid-glass rounded-3xl p-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">SetupFX Liquidity Provider</h3>
            <p className="text-sm text-primary font-semibold mb-3">Don&apos;t have a liquidity provider?</p>
            <p className="text-foreground/70 leading-relaxed mb-6">
              SetupFX can provide reliable, multi-asset liquidity. Get access to deep markets with tight spreads and high-speed execution across all major asset classes.
            </p>
            <ul className="space-y-3">
              {SETUPFX_LIQUIDITY.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/85 text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* A-BOOK / B-BOOK */}
      <section className="mx-auto max-w-6xl mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            A-Book &amp; B-Book Support
          </h2>
          <p className="text-foreground/65 max-w-3xl mx-auto leading-relaxed">
            Our liquidity infrastructure supports both A-Book and B-Book execution models with smart order routing and full risk management flexibility. Configure your setup based on your broker strategy.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {A_B_BOOK.map((c) => (
            <div key={c.title} className="liquid-glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-1.5">{c.title}</h3>
              <p className="text-sm text-foreground/65 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section className="mx-auto max-w-5xl mb-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Platform Compatibility
          </h2>
          <p className="text-foreground/65 max-w-2xl mx-auto">
            Our liquidity works seamlessly with all major trading platforms and systems.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {COMPATIBILITY.map((label) => (
            <span
              key={label}
              className="inline-block rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-foreground/90"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-5xl mb-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Why Choose SetupFX?
          </h2>
          <p className="text-foreground/65 max-w-2xl mx-auto">
            Built for brokers who need reliable, flexible liquidity infrastructure.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {WHY.map((b) => (
            <div key={b} className="flex items-start gap-3 liquid-glass rounded-xl p-4">
              <Check className="size-5 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground/85 text-sm leading-relaxed">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-3xl">
        <div className="liquid-glass-strong rounded-3xl p-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Get Started with SetupFX Liquidity
          </h2>
          <p className="text-foreground/70 mb-6">
            Whether you bring your own liquidity provider or need SetupFX to supply liquidity, we ensure a smooth, secure, and professional trading environment.
          </p>
          <Link
            href="/company/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            Contact Us Today
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
