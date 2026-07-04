'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  Check,
  Globe,
  Clock,
  Sparkles,
  Layers,
  Coins,
  LineChart,
  Bitcoin,
  Award,
  Building2,
  ScrollText,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import WaveDivider from './WaveDivider';
import { ChartArt, CopyTradeArt, IbArt } from './TradingToolsArt';

/* CountUp — IntersectionObserver-triggered numeric ramp.
   Inline so we don't pull in react-countup (smaller bundle). Starts
   counting when the element scrolls into view and only once. */
function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  suffix = '',
  prefix = '',
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setVal(eased * to);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Marketing-home sections — theme: white surfaces + black text +
   brand blue (#1074FE) accents. Cinematic dark hero stays in
   HeroScene.tsx; here we deliver light, premium, fintech-clean.

   Visual rhythm down the page:
     [HeroScene  dark navy]
     [ProofBar   black band — bridge from hero into white sections]
     [WhyTrade   white]
     [AccountTiers   #F6F8FB very-light grey]
     [TradingTools   white]
     [FinalCTA   black — closing emphasis]
     [Footer   dark, existing]
   ───────────────────────────────────────────────────────────────────── */

const BRAND_BLUE = '#1074FE';
const BRAND_BLUE_DARK = '#0856C5';
const BRAND_BLUE_LIGHT = '#4D95FF';

/* ============================================================
   1. ProofBar — dark bridge band straight under the hero.
   ============================================================ */
export function ProofBar() {
  /* Mission-control telemetry — animated count-up on scroll.
     Numeric stats ramp via CountUp; non-numeric ("< 50ms", "99.99%")
     get a soft fade-in via ScrollReveal. */
  const stats: Array<{
    label: string;
    render: React.ReactNode;
  }> = [
    {
      label: 'Active traders',
      render: <CountUp to={50000} suffix="+" />,
    },
    {
      label: 'Instruments',
      render: <CountUp to={500} suffix="+" />,
    },
    {
      label: 'Execution',
      render: <span>&lt; 50ms</span>,
    },
    {
      label: 'Uptime',
      render: <CountUp to={99.99} decimals={2} suffix="%" />,
    },
  ];
  return (
    <section className="relative bg-[#0A0A0A] border-y border-white/[0.06]">
      {/* Decorative wavy current at the top — subtle ocean of light. */}
      <div className="absolute inset-x-0 top-0">
        <WaveDivider variant="current" tone="dark" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-14 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 90} y={16}>
              <div className="text-center">
                <div
                  className="telemetry-num text-2xl sm:text-3xl font-bold"
                  style={{ color: BRAND_BLUE_LIGHT }}
                >
                  {s.render}
                </div>
                <div className="mt-1 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-white/45">
                  {s.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. WhyTrade — white background, 6 feature cards.
   ============================================================ */
export function WhyTrade() {
  const features = [
    {
      icon: Zap,
      title: 'Sub-millisecond execution',
      body: 'Direct routing through tier-1 liquidity providers — no dealing desk, no requotes.',
    },
    {
      icon: Shield,
      title: 'Regulated & insured',
      body: 'Funds segregated in tier-1 banks. Optional trade insurance on every position.',
    },
    {
      icon: Layers,
      title: '500+ instruments',
      body: 'Forex, indices, commodities, crypto, and shares — all from a single account.',
    },
    {
      icon: TrendingUp,
      title: 'Spreads from 0.1 pips',
      body: 'Raw institutional pricing on ECN accounts. Tight bid/ask, all market hours.',
    },
    {
      icon: Users,
      title: 'Copy top traders',
      body: 'Browse verified master strategies. Allocate capital, mirror trades, get notified.',
    },
    {
      icon: Globe,
      title: 'Trade from anywhere',
      body: 'Web, desktop, iOS, Android — your account follows you across every device.',
    },
  ];

  return (
    <section className="relative bg-[#F4F8FF] py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: BRAND_BLUE }}
            >
              Why SetupFX
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A] leading-[1.05] tracking-tight">
              A platform built around the trader.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#475569] leading-relaxed">
              Every detail of the SetupFX engine — from price feed to fill — is engineered for
              traders who can&apos;t afford a slow click or a wide spread.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 80}>
              <div className="group relative h-full p-6 rounded-2xl bg-white border border-[#CFE0FF] hover:border-[#1074FE]/50 hover:shadow-[0_8px_30px_-12px_rgba(16,116,254,0.35)] transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(16, 116, 254, 0.08)',
                    border: '1px solid rgba(16, 116, 254, 0.18)',
                  }}
                >
                  <f.icon size={18} style={{ color: BRAND_BLUE }} />
                </div>
                <h3 className="text-base font-semibold text-[#0A0A0A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{f.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. AccountTiers — very-light grey background, 4 tiers.
   ============================================================ */
export function AccountTiers() {
  type Tier = {
    name: string;
    deposit: string;
    tagline: string;
    features: string[];
    popular?: boolean;
  };
  const tiers: Tier[] = [
    {
      name: 'Standard',
      deposit: '$100',
      tagline: 'For new traders.',
      features: ['Competitive spreads', 'Zero commission', 'Full asset access', 'Mobile + Web'],
    },
    {
      name: 'ECN Raw',
      deposit: '$200',
      tagline: 'For active traders.',
      features: ['Spreads from 0.1 pip', 'Low per-lot fee', 'Direct market access', 'Pro charts'],
      popular: true,
    },
    {
      name: 'Pro',
      deposit: '$500',
      tagline: 'For full-time professionals.',
      features: ['Institutional pricing', 'Priority execution', 'API access', 'Strategy automation'],
    },
    {
      name: 'VIP',
      deposit: '$2,500',
      tagline: 'For high-volume traders.',
      features: ['Dedicated manager', 'Rebates on volume', 'Custom leverage', 'Priority withdrawals'],
    },
  ];

  return (
    <section className="relative bg-[#EAF1FE] py-20 sm:py-28 border-y border-[#CFE0FF]">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: BRAND_BLUE }}
            >
              Accounts
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A] leading-[1.05] tracking-tight">
              Choose how you trade.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#475569] leading-relaxed">
              Four tiers, one platform. Switch or upgrade anytime — your history follows you.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t, idx) => (
            <ScrollReveal key={t.name} delay={idx * 90}>
              <div
                className={`relative h-full p-6 rounded-2xl border transition-shadow bg-white ${
                  t.popular
                    ? 'border-[#1074FE]/50 shadow-[0_12px_36px_-12px_rgba(16,116,254,0.35)]'
                    : 'border-[#CFE0FF] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]'
                }`}
              >
                {t.popular && (
                  <span
                    className="absolute -top-3 left-6 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white"
                    style={{ background: BRAND_BLUE }}
                  >
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-[#0A0A0A]">{t.name}</h3>
                <p className="text-[13px] text-[#64748B] mt-1">{t.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-[#0A0A0A]">{t.deposit}</span>
                  <span className="text-xs text-[#94A3B8]">min</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-[#334155]">
                      <Check size={14} className="shrink-0 mt-0.5" style={{ color: BRAND_BLUE }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`mt-7 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    t.popular
                      ? 'text-white hover:opacity-90'
                      : 'bg-[#0A0A0A] text-white hover:bg-[#1E293B]'
                  }`}
                  style={t.popular ? { background: BRAND_BLUE } : undefined}
                >
                  Open account
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. TradingTools — white background, alternating two-column rows.
   ============================================================ */
export function TradingTools() {
  const tools = [
    {
      title: 'Advanced charting',
      body: 'TradingView-powered charts with 100+ indicators, multi-timeframe analysis, and one-click trading directly from the canvas.',
      bullets: ['100+ indicators', 'Drawing tools', 'Save layouts', 'Custom alerts'],
      Art: ChartArt,
    },
    {
      title: 'Copy trading & PAMM',
      body: 'Browse verified master strategies with audited track records. Allocate any amount, mirror trades automatically, and see live P&L in your dashboard.',
      bullets: ['Verified masters', 'Performance fees', 'Risk caps', 'Auto-distribution'],
      Art: CopyTradeArt,
    },
    {
      title: 'IB partner program',
      body: 'Earn a share of every spread your referrals generate. Multi-level commission, real-time tracking, instant payouts to your main wallet.',
      bullets: ['Multi-level MLM', 'Live dashboard', 'Per-lot rebates', 'Instant payout'],
      Art: IbArt,
    },
  ];

  return (
    <section className="relative bg-[#F4F8FF] py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: BRAND_BLUE }}
            >
              Tools
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A] leading-[1.05] tracking-tight">
              Everything you need, on one screen.
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.title} delay={i * 80}>
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center p-8 lg:p-12 rounded-3xl bg-[#EAF1FE] border border-[#CFE0FF] ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-4">
                  {tool.title}
                </h3>
                <p className="text-base text-[#475569] leading-relaxed mb-6">{tool.body}</p>
                <ul className="grid grid-cols-2 gap-2.5">
                  {tool.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-[13px] text-[#334155]">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: BRAND_BLUE }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="relative aspect-[16/10] rounded-2xl overflow-hidden border bg-white shadow-[0_12px_36px_-18px_rgba(16,116,254,0.30)]"
                style={{ borderColor: 'rgba(16, 116, 254, 0.18)' }}
              >
                <tool.Art />
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   5. FinalCTA — black background, brand-blue CTA. Closing emphasis.
   ============================================================ */
export function FinalCTA() {
  return (
    <section
      className="relative bg-[#030712] py-28 sm:py-40 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top, #050B1F 0%, #030712 55%, #000 100%)',
      }}
    >
      {/* Wavy current riding above — extra margin so the badge below
          doesn't collide with the curves. */}
      <div className="absolute inset-x-0 top-0">
        <WaveDivider variant="current" tone="dark" />
      </div>

      {/* Decorative star pinpoints — same style as hero. */}
      <div className="absolute inset-0 hero-stars pointer-events-none opacity-40" aria-hidden />
      <div className="absolute inset-0 hero-stars-twinkle pointer-events-none opacity-50" aria-hidden />

      {/* Earth horizon glow at bottom — cinematic closing shot. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
        style={{
          background:
            'radial-gradient(80% 100% at 50% 100%, rgba(16,116,254,0.42) 0%, rgba(77,149,255,0.20) 28%, rgba(8,86,197,0.10) 50%, transparent 70%)',
          filter: 'blur(24px)',
        }}
        aria-hidden
      />

      {/* A thin curved arc that suggests the planet horizon edge. */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none"
        aria-hidden
        width="140%"
        height="200"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ filter: 'drop-shadow(0 0 24px rgba(77,149,255,0.5))' }}
      >
        <path
          d="M0,200 Q720,40 1440,200"
          fill="none"
          stroke="rgba(77,149,255,0.55)"
          strokeWidth="1.4"
        />
        <path
          d="M0,200 Q720,80 1440,200"
          fill="none"
          stroke="rgba(16,116,254,0.30)"
          strokeWidth="1"
        />
      </svg>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <ScrollReveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.20em] font-semibold mb-7"
            style={{
              background: 'rgba(16, 116, 254, 0.10)',
              border: '1px solid rgba(77, 149, 255, 0.30)',
              color: '#ABCBFF',
            }}
          >
            <Clock size={12} />
            Account ready in 3 minutes
          </div>
          <h2
            className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #FFFFFF 0%, #DCE7FF 60%, #ABCBFF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Start trading with
            <br />
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${BRAND_BLUE_LIGHT} 0%, ${BRAND_BLUE} 50%, ${BRAND_BLUE_DARK} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              precision.
            </span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            Open a live or demo account in minutes. No paperwork, no chase calls, no hidden fees.
          </p>

          {/* Three quick proof chips above CTA — mission-control feel. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-white/55">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              <Check size={11} style={{ color: BRAND_BLUE_LIGHT }} />
              No paperwork
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              <Check size={11} style={{ color: BRAND_BLUE_LIGHT }} />
              Instant verification
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
              <Check size={11} style={{ color: BRAND_BLUE_LIGHT }} />
              $100 minimum
            </span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" className="hero-cta-primary group">
              <span>Open Account</span>
              <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/accounts/demo" className="hero-cta-ghost">
              Try Demo
            </Link>
          </div>
          <p className="mt-10 text-[11px] text-white/35 max-w-md mx-auto leading-relaxed">
            Trading derivatives carries a high level of risk and may not be suitable for all
            investors. Past performance is not indicative of future results.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ============================================================
   6. Markets — 4 asset classes, light grey background.
   ============================================================ */
export function Markets() {
  const classes = [
    {
      icon: Coins,
      title: 'Forex',
      count: '70+ pairs',
      body: 'Majors, minors, exotics. Live institutional pricing 24/5.',
    },
    {
      icon: LineChart,
      title: 'Indices',
      count: '15+ indices',
      body: 'US30, NAS100, US500, FTSE, DAX — index CFDs at razor spreads.',
    },
    {
      icon: Bitcoin,
      title: 'Crypto',
      count: '25+ coins',
      body: 'BTC, ETH, SOL and majors. Trade 24/7 with USD pairs.',
    },
    {
      icon: Sparkles,
      title: 'Metals & Energy',
      count: 'Gold · Oil · Silver',
      body: 'XAU, XAG, USOIL, UKOIL, NATGAS — full commodities suite.',
    },
  ];

  return (
    <section className="relative bg-[#EAF1FE] py-20 sm:py-28 border-y border-[#CFE0FF]">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: BRAND_BLUE }}
            >
              Markets
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A] leading-[1.05] tracking-tight">
              Trade everything that moves.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#475569] leading-relaxed">
              One regulated account, every major market — switch instruments without leaving
              the platform.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 90}>
              <div className="group relative p-6 rounded-2xl bg-white border border-[#CFE0FF] overflow-hidden h-full transition-all hover:border-[#1074FE]/40 hover:shadow-[0_18px_40px_-18px_rgba(16,116,254,0.40)]">
                {/* Decorative corner pulse on hover */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(16,116,254,0.35) 0%, transparent 70%)',
                    filter: 'blur(12px)',
                  }}
                  aria-hidden
                />
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(16,116,254,0.10) 0%, rgba(77,149,255,0.04) 100%)',
                      border: '1px solid rgba(16,116,254,0.20)',
                    }}
                  >
                    <c.icon size={20} style={{ color: BRAND_BLUE }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A0A0A]">{c.title}</h3>
                  <p
                    className="telemetry-num text-[12px] font-semibold mt-1 mb-3"
                    style={{ color: BRAND_BLUE }}
                  >
                    {c.count}
                  </p>
                  <p className="text-[13px] text-[#475569] leading-relaxed">{c.body}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   7. TrustStrip — dark band with compliance + regulator badges.
   ============================================================ */
export function TrustStrip() {
  const items = [
    { icon: Award, label: 'Tier-1 Regulation' },
    { icon: Shield, label: 'Segregated Funds' },
    { icon: Building2, label: 'Major Bank Custody' },
    { icon: ScrollText, label: 'GDPR Compliant' },
  ];
  return (
    <section className="relative bg-[#0A0A0A] border-y border-white/[0.06]">
      <div className="absolute inset-x-0 top-0">
        <WaveDivider variant="dunes" tone="dark" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <ScrollReveal>
          <p className="text-center text-[11px] uppercase tracking-[0.22em] text-white/40 mb-7">
            Compliance &amp; trust
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <ScrollReveal key={it.label} delay={i * 80}>
              <div className="flex flex-col items-center text-center gap-2.5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(16, 116, 254, 0.10)',
                    border: '1px solid rgba(77, 149, 255, 0.30)',
                  }}
                >
                  <it.icon size={18} style={{ color: BRAND_BLUE_LIGHT }} />
                </div>
                <span className="text-[12px] font-medium text-white/75">{it.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
