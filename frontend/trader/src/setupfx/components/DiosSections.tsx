'use client';

import Link from 'next/link';
import {
  Check,
  CandlestickChart,
  CalendarClock,
  Newspaper,
  ShieldAlert,
  History,
  Bot,
  Lock,
  KeyRound,
  ScrollText,
  Activity,
  MessageCircle,
  Mail,
  BookOpen,
  HelpCircle,
  TriangleAlert,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   Dios-inspired section components, themed in SetupFX blue (#1074FE).
   All scoped within .setupfx-home via parent layout. Each section is
   self-contained and stacks vertically after the WebGL hero + HeroScroll.
   ───────────────────────────────────────────────────────────────────── */

/* ============================================================
   ACCOUNTS — 4-tier glassy pricing cards on dark background.
   ============================================================ */

type Account = {
  name: string;
  description: string;
  price: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
};

const ACCOUNTS: Account[] = [
  {
    name: 'Standard',
    description: 'Built for new traders entering the markets.',
    price: '$100',
    features: [
      'Competitive spreads',
      'Zero commission',
      'Educational resources',
      'Full asset access',
    ],
    cta: 'Open Account',
  },
  {
    name: 'ECN & Raw',
    description: 'Tight raw spreads for active and short-term traders.',
    price: '$200',
    features: [
      'Raw spreads from 0.1 pips',
      'Low per-lot commission',
      'Direct market access',
      'Pro charting suite',
    ],
    cta: 'Open Account',
    isPopular: true,
  },
  {
    name: 'Pro',
    description: 'Institutional pricing for full-time professionals.',
    price: '$500',
    features: [
      'Tight institutional spreads',
      'Priority execution',
      'Advanced API access',
      'Strategy automation',
    ],
    cta: 'Open Account',
  },
  {
    name: 'VIP',
    description: 'White-glove service for institutional clients.',
    price: '$10K',
    features: [
      'Institutional pricing',
      'Dedicated account manager',
      'Custom liquidity routing',
      'White-glove onboarding',
    ],
    cta: 'Talk to Sales',
  },
];

export function AccountsSection() {
  return (
    <section
      id="accounts"
      className="border-t border-white/10 bg-ink-900 px-6 py-24 lg:px-10 font-jakarta"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Accounts
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Accounts Designed for{' '}
            <span className="text-brand-500">Every Trader.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/65 leading-relaxed">
            From your first trade to your thousandth — SetupFX scales with you. Pick the tier that matches your strategy.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACCOUNTS.map((acct) => (
            <div
              key={acct.name}
              className={`relative rounded-3xl border bg-gradient-to-br from-white/10 to-white/5 p-7 backdrop-blur-[14px] transition ${
                acct.isPopular
                  ? 'scale-105 border-brand-500/60 shadow-2xl shadow-brand-500/30'
                  : 'border-white/10 hover:border-brand-500/40'
              }`}
            >
              {acct.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-white">{acct.name}</h3>
              <p className="mt-1.5 text-sm text-white/60">{acct.description}</p>
              <div className="my-6">
                <div className="text-5xl font-extrabold text-white">{acct.price}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/55">
                  minimum deposit
                </div>
              </div>
              <div
                className="my-5 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(16,116,254,0.4), transparent)' }}
              />
              <ul className="space-y-2.5">
                {acct.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <Check className="size-4 text-brand-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wider transition ${
                  acct.isPopular
                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                    : 'border border-brand-500/40 bg-brand-500/10 text-brand-200 hover:bg-brand-500/20'
                }`}
              >
                {acct.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TOOLS — 6 trading-tool cards on darker background.
   ============================================================ */

const TOOLS = [
  { Icon: CandlestickChart, title: 'Advanced Charting',  body: '50+ technical indicators, drawing tools, and multi-timeframe views.' },
  { Icon: CalendarClock,    title: 'Economic Calendar',  body: 'Real-time macro events, central-bank decisions, and earnings.' },
  { Icon: Newspaper,        title: 'Market Analysis',    body: 'Daily research and trade ideas from senior analysts.' },
  { Icon: ShieldAlert,      title: 'Risk Management',    body: 'Stop-loss, take-profit, trailing stops, and margin alerts.' },
  { Icon: History,          title: 'Trade History',      body: 'Detailed analytics, P&L reporting, and tax-ready exports.' },
  { Icon: Bot,              title: 'Automated Trading',  body: 'Build, backtest, and deploy strategies via our open API.' },
];

export function ToolsSection() {
  return (
    <section
      id="tools"
      className="border-t border-white/10 bg-ink-950 px-6 py-24 lg:px-10 text-white font-jakarta"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Tools &amp; Features
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            Everything You Need to{' '}
            <span className="text-brand-500">Trade Smarter.</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/10 bg-ink-800/60 p-7 transition hover:-translate-y-1 hover:border-brand-500 hover:bg-ink-800"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECURITY — 4 pillars in 2x2 grid on dark.
   ============================================================ */

const SECURITY = [
  { Icon: Lock,       text: 'Secure payment gateways' },
  { Icon: KeyRound,   text: 'AES-256 encrypted data' },
  { Icon: ScrollText, text: 'Compliance-ready infrastructure' },
  { Icon: Activity,   text: '24/7 system monitoring' },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="border-t border-white/10 bg-ink-900 px-6 py-24 lg:px-10 font-jakarta"
    >
      <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Security &amp; Trust
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            Security{' '}
            <span className="block">
              You Can <span className="text-brand-500">Rely On.</span>
            </span>
          </h2>
          <p className="text-base text-white/65 leading-relaxed max-w-xl">
            Funds are segregated in tier-1 banking partners. All data is encrypted in transit and at rest. Our infrastructure is audited annually and built to institutional standards.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SECURITY.map(({ Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5 text-white"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500 shrink-0">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-semibold">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   GET STARTED — 4-step onboarding on paper background.
   ============================================================ */

const STEPS = [
  { n: '01', title: 'Register your account', body: 'Sign up in minutes with email or social.' },
  { n: '02', title: 'Verify your identity',  body: 'Quick automated KYC — usually under 10 minutes.' },
  { n: '03', title: 'Deposit funds',         body: 'Bank transfer, cards, e-wallets, or crypto.' },
  { n: '04', title: 'Start trading',         body: 'Access global markets across every device.' },
];

export function GetStartedSection() {
  return (
    <section
      id="get-started"
      className="bg-paper text-ink-900 px-6 py-24 lg:px-10 font-jakarta"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            Get Started
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            Start Trading in{' '}
            <span className="text-brand-600">Minutes.</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-ink-200 bg-white p-7 transition hover:-translate-y-1 hover:border-brand-600"
            >
              <p className="font-mono text-5xl font-extrabold text-brand-600">{s.n}</p>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-ink-900 bg-ink-900 p-8 text-white">
          <p className="text-2xl font-bold md:text-3xl">Open your account in under 5 minutes.</p>
          <Link
            href="/auth/register"
            className="rounded-full bg-brand-600 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-brand-600"
          >
            Open Account
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ABOUT — 4 values + 4 stats grid on darker background.
   ============================================================ */

const VALUES = [
  { title: 'Innovation',   body: 'Cutting-edge technology that compounds over time.' },
  { title: 'Transparency', body: 'Clear pricing. No hidden costs. Ever.' },
  { title: 'Integrity',    body: 'Ethical practices in every decision we make.' },
  { title: 'Excellence',   body: 'Institutional standards held to retail expectations.' },
];

const ABOUT_STATS = [
  { value: '50K+', label: 'Active Traders' },
  { value: '150+', label: 'Countries' },
  { value: '10+',  label: 'Years Experience' },
  { value: '24/7', label: 'Support' },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="border-t border-white/10 bg-ink-950 px-6 py-24 lg:px-10 text-white font-jakarta"
    >
      <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            About SetupFX
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            Next-Generation{' '}
            <span className="text-brand-500">Trading Platform.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base text-white/70 leading-relaxed">
            SetupFX was founded to bring institutional-grade execution and tools to every trader.
            We combine deep liquidity, modern engineering, and a relentless focus on the people
            who actually use the platform.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-white/10 bg-ink-800/50 p-4"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-6">
          {ABOUT_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800/80 to-ink-900 p-7 transition hover:border-brand-500"
            >
              <div className="font-mono text-5xl font-bold text-brand-500 md:text-6xl">
                {s.value}
              </div>
              <div className="mt-3 text-sm font-bold uppercase tracking-wider text-white/70">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SUPPORT — 4 channel cards on dark.
   ============================================================ */

const SUPPORT = [
  { Icon: MessageCircle, title: 'Live Chat',       body: 'Instant support',                  cta: 'Start Chat',  href: '/company/contact' },
  { Icon: Mail,          title: 'Email Support',   body: 'Response within 24 hours',         cta: 'Send Email',  href: 'mailto:setupfx24@gmail.com' },
  { Icon: BookOpen,      title: 'Help Center',     body: 'Browse the knowledge base',        cta: 'Visit Center', href: '/academy/blogs' },
  { Icon: HelpCircle,    title: 'FAQs',            body: 'Find quick answers',               cta: 'View FAQs',    href: '/resources/faqs' },
];

export function SupportSection() {
  return (
    <section
      id="support"
      className="border-t border-white/10 bg-ink-900 px-6 py-24 lg:px-10 text-white font-jakarta"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Support
          </p>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl lg:text-6xl">
            Need Help? We&apos;re Here{' '}
            <span className="text-brand-500">24/7.</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT.map(({ Icon, title, body, cta, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-white/10 bg-ink-800/60 p-7 transition hover:-translate-y-1 hover:border-brand-500 hover:bg-ink-800"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
              <p className="mt-5 text-sm font-bold uppercase tracking-wider text-brand-500 transition group-hover:text-white">
                {cta} →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   RISK DISCLAIMER — bold legal block with crimson border-top.
   ============================================================ */

const RISKS = [
  { title: 'Leverage Risk',                 body: 'Leverage amplifies both profits and losses. A small market move can cause a large loss to your account.' },
  { title: 'Market Volatility',             body: 'Financial markets can be highly volatile and prices can move sharply against you with little warning.' },
  { title: 'No Guaranteed Returns',         body: 'Past performance is not indicative of future results. There are no guarantees of profit when trading.' },
  { title: 'Counterparty & Liquidity Risk', body: 'CFDs are OTC instruments. In thin or fast markets, slippage and gaps may impact your fills and exits.' },
  { title: 'Cryptocurrency Risk',           body: 'Digital assets are extremely volatile, may lose value rapidly, and are not protected by deposit insurance.' },
  { title: 'Not Financial Advice',          body: 'Nothing on this site constitutes investment advice. Seek qualified guidance before trading.' },
];

export function RiskDisclaimer() {
  return (
    <section
      id="risk-disclaimer"
      className="border-t-4 border-brand-600 bg-[#020816] px-6 py-16 lg:px-10 text-white font-jakarta"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand-600 shrink-0">
            <TriangleAlert className="size-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-400">
              Important Legal Notice
            </p>
            <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Risk Warning &amp; Disclaimer
            </h2>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-brand-700/50 bg-brand-950/40 px-8 py-7">
          <p className="text-[15px] font-bold leading-relaxed">
            Trading leveraged financial instruments such as forex, CFDs, and cryptocurrencies involves a{' '}
            <span className="text-brand-300">substantial risk of loss</span> and is not suitable for all investors. You may lose some or all of your invested capital. Do not trade with funds you cannot afford to lose.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RISKS.map((r) => (
            <div key={r.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-400">{r.title}</h3>
              <p className="text-xs leading-relaxed text-white/65">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-6 space-y-3">
          <p className="text-xs leading-relaxed text-white/55">
            SetupFX is a trading name of SetupFX Softtech (OPC) Private Limited. The information on this website
            is provided for general informational purposes only and does not take into account your investment
            objectives or financial situation. Access to this website is at your own initiative.
          </p>
          <p className="text-xs leading-relaxed text-white/55">
            Past performance is not indicative of future results. Before deciding to trade, please consider your
            objectives, level of experience, and risk appetite, and consult an independent financial advisor if
            you have any doubts.
          </p>
        </div>
      </div>
    </section>
  );
}
