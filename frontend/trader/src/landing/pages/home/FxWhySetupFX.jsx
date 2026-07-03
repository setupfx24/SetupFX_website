'use client'

import { Link } from 'react-router-dom'
import {
  ShieldCheck, Zap, Layers, HeadphonesIcon,
  ArrowRight,
} from 'lucide-react'
import ScrollReveal from '@/landing/components/animations/ScrollReveal'

/**
 * Home "why us" — 4 trust pillars.
 *
 * Each pillar covers one objection a serious trader has before they
 * fund an account at a broker they've never used:
 *   1. "Are my funds safe?"         — segregated accounts, audit trail
 *   2. "Will my orders actually fill?" — execution venue + speed
 *   3. "Am I getting fair pricing?"    — spreads, no last-look, no markup
 *   4. "Can I get help when I need it?" — 24/5 multilingual support
 *
 * All four blurbs are operational claims (not regulatory, not licence-
 * specific) so the section reads consistently regardless of which
 * jurisdiction's badge ends up in the footer.
 */

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Funds held separately',
    body: 'Client balances are held in segregated bank accounts, never mixed with operating capital. Every transaction posts to an immutable internal ledger.',
  },
  {
    icon: Zap,
    title: 'Execution built for speed',
    body: 'Aggregated liquidity, sub-second routing, no dealing-desk intervention on the FX core. Designed for traders who size in size.',
  },
  {
    icon: Layers,
    title: 'Transparent pricing',
    body: 'Spreads from 0.1 pips on majors with no last-look, no requotes, no synthetic markup buried in the fill. The price you see is the price you trade.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support that actually answers',
    body: '24/5 multilingual desk staffed by people who trade — not a chatbot. Median first-response under 90 seconds during market hours.',
  },
]

export default function HomeWhyUs() {
  return (
    <section
      className="relative"
      style={{ background: 'var(--fx-bg-elev)' }}
    >
      <div className="fx-container py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — section heading */}
          <ScrollReveal variant="fadeRight" className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p
                className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] mb-3"
                style={{ color: '#A5B4FC' }}
              >
                Why SetupFX
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white leading-[1.1] mb-6">
                Built like a Swiss bank.
                <br />
                <span className="fx-gold-text">Priced like an ECN.</span>
              </h2>
              <p
                className="text-base md:text-lg leading-relaxed mb-6"
                style={{ color: 'var(--fx-text-2)' }}
              >
                Most brokers force a trade-off between low cost and
                operational rigour. SetupFX is engineered to give you
                both: institutional-grade safety on the back-end, tight
                spreads and direct execution on the front.
              </p>
              <Link
                to="/company/why-setupfx"
                className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                style={{ color: '#A5B4FC' }}
              >
                Read the full positioning
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>

          {/* Right — pillars list */}
          <div className="lg:col-span-7 space-y-4">
            {PILLARS.map(({ icon: Icon, title, body }, i) => (
              <ScrollReveal key={title} variant="fadeUp" delay={i * 0.08}>
                <div
                  className="group relative p-6 md:p-7 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'var(--fx-bg)',
                    border: '1px solid var(--fx-line)',
                  }}
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <div
                      className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl mt-0.5 transition-colors"
                      style={{
                        background: 'rgba(16,116,254,0.10)',
                        border: '1px solid rgba(16,116,254,0.25)',
                      }}
                    >
                      <Icon size={20} style={{ color: '#A5B4FC' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1.5">
                        {title}
                      </h3>
                      <p
                        className="text-[13.5px] md:text-sm leading-relaxed"
                        style={{ color: 'var(--fx-text-2)' }}
                      >
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
