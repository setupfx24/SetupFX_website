'use client'

import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import ScrollReveal from '@/landing/components/animations/ScrollReveal'

/**
 * Account-types comparison — 3 tiers side-by-side.
 *
 * The middle card is highlighted with the brand indigo because it's
 * the most-converting tier in this kind of broker comparison: deposit
 * floor low enough to feel approachable, spreads tight enough to feel
 * professional. The flanking tiers anchor it: Standard for first-
 * timers, Elite for size traders who need rebates.
 *
 * Numeric values match what the backend's AccountGroup table seeds
 * (see infra/docker/init-db.sql — Micro / Standard / Pro / VIP /
 * Cent / Islamic / Demo). Update both this file and the seed if
 * marketing re-tiers.
 */

const TIERS = [
  {
    name: 'Standard',
    blurb: 'Open with $100. No commission, all-in spread pricing. Best for new traders.',
    minDeposit: '$100',
    spreads: 'from 1.0 pips',
    commission: '$0 per lot',
    leverage: 'up to 1:200',
    features: [
      'All major asset classes',
      'Trading central research',
      'Email + chat support',
    ],
    cta: 'Open Standard',
    accent: false,
  },
  {
    name: 'Pro',
    blurb: 'Tightest raw spreads + small per-lot commission. Best for active traders.',
    minDeposit: '$1,000',
    spreads: 'from 0.1 pips',
    commission: '$7 per lot',
    leverage: 'up to 1:500',
    features: [
      'Aggregated ECN liquidity',
      'API + algo trading',
      'Priority desk support',
    ],
    cta: 'Open Pro',
    accent: true,
  },
  {
    name: 'Elite',
    blurb: 'Negotiated rebates on volume. Dedicated relationship manager.',
    minDeposit: '$25,000',
    spreads: 'from 0.0 pips',
    commission: 'rebate-eligible',
    leverage: 'up to 1:500',
    features: [
      'Volume-based commission rebates',
      'Dedicated account manager',
      'Free wire transfers',
    ],
    cta: 'Open Elite',
    accent: false,
  },
]

export default function HomeAccountTiers() {
  return (
    <section className="relative" style={{ background: 'var(--fx-bg)' }}>
      <div className="fx-container py-20 md:py-28">
        <ScrollReveal variant="fadeUp">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <p
              className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] mb-3"
              style={{ color: '#A5B4FC' }}
            >
              Account Types
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Pick the tier that{' '}
              <span className="fx-gold-text">matches how you trade.</span>
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed"
              style={{ color: 'var(--fx-text-2)' }}
            >
              Upgrade or downgrade any time — your positions, history
              and balance carry over. No re-KYC, no re-funding.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier, i) => (
            <ScrollReveal key={tier.name} variant="fadeUp" delay={i * 0.08}>
              <div
                className="relative h-full p-6 md:p-8 rounded-2xl flex flex-col"
                style={{
                  background: tier.accent ? 'var(--fx-bg-elev-2)' : 'var(--fx-bg-elev)',
                  border: tier.accent
                    ? '1px solid rgba(233,78,27,0.50)'
                    : '1px solid var(--fx-line)',
                  boxShadow: tier.accent
                    ? '0 30px 80px -40px rgba(233,78,27,0.45)'
                    : 'none',
                }}
              >
                {tier.accent && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #E94E1B, #C73E11)',
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(233,78,27,0.50)',
                    }}
                  >
                    Most chosen
                  </span>
                )}

                <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                <p
                  className="text-sm leading-relaxed mb-6 min-h-[44px]"
                  style={{ color: 'var(--fx-text-2)' }}
                >
                  {tier.blurb}
                </p>

                {/* Spec table */}
                <div className="space-y-2.5 mb-6 pb-6 border-b" style={{ borderColor: 'var(--fx-line)' }}>
                  {[
                    ['Min deposit', tier.minDeposit],
                    ['Spreads', tier.spreads],
                    ['Commission', tier.commission],
                    ['Max leverage', tier.leverage],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[13px]">
                      <span style={{ color: 'var(--fx-text-3)' }}>{k}</span>
                      <span className="font-medium text-white tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <Check
                        size={14}
                        className="shrink-0 mt-0.5"
                        style={{ color: tier.accent ? '#A5B4FC' : 'var(--fx-text-3)' }}
                      />
                      <span style={{ color: 'var(--fx-text-2)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/auth/register"
                  className={
                    tier.accent
                      ? 'fx-btn-primary justify-center w-full'
                      : 'fx-btn-ghost justify-center w-full'
                  }
                >
                  {tier.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="fadeUp" delay={0.3}>
          <p
            className="text-center mt-10 text-sm"
            style={{ color: 'var(--fx-text-3)' }}
          >
            Also available: Islamic (swap-free), Cent and Demo accounts. <Link to="/accounts" className="underline hover:text-white">Compare all account types</Link>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
