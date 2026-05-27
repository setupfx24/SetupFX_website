'use client'

import { Link } from 'react-router-dom'
import {
  Monitor, Smartphone, Code2,
  ArrowRight, Check,
} from 'lucide-react'
import ScrollReveal from '@/landing/components/animations/ScrollReveal'

/**
 * Home platforms section — 3 distribution surfaces.
 *
 * Web terminal is foreground (it's the one users land on first); the
 * mobile app and the developer API anchor either side. Each card is a
 * one-page-down summary — features as a tight list, single CTA. No
 * marketing screenshots because the brand wordmark + indigo accents
 * carry the visual identity without leaning on bitmap mockups.
 */

const PLATFORMS = [
  {
    icon: Monitor,
    title: 'Web Terminal',
    body: 'Full-featured chart, order panel and depth-of-market in any modern browser. No download, no install, no waiting for an update.',
    features: [
      'Advanced charting with 80+ indicators',
      'One-click trading with depth ladder',
      'Multi-monitor layouts, saved per device',
    ],
    cta: 'Launch terminal',
    href: '/trading/terminal',
    accent: true,
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    body: 'iOS and Android with full execution parity — the same order types, the same risk controls, the same alerts as the web.',
    features: [
      'Face ID / Touch ID at the brokerage layer',
      'Push alerts on margin call + SL/TP hits',
      'Background quote streaming',
    ],
    cta: 'Mobile downloads',
    href: '/platforms',
    accent: false,
  },
  {
    icon: Code2,
    title: 'API + Algo',
    body: 'REST + WebSocket for everything the web does — placing orders, streaming ticks, managing positions. FIX gateway available for Elite tier.',
    features: [
      'OAuth-issued API keys (per-IP scoped)',
      'WebSocket for tick + order updates',
      'Sandbox environment with mock fills',
    ],
    cta: 'API documentation',
    href: '/platforms',
    accent: false,
  },
]

export default function HomePlatforms() {
  return (
    <section
      className="relative"
      style={{ background: 'var(--fx-bg-elev)' }}
    >
      <div className="fx-container py-20 md:py-28">
        <ScrollReveal variant="fadeUp">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <p
              className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] mb-3"
              style={{ color: '#A5B4FC' }}
            >
              Platforms
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Trade from anywhere.{' '}
              <span className="fx-gold-text">Same engine everywhere.</span>
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed"
              style={{ color: 'var(--fx-text-2)' }}
            >
              One account, one balance, one order book — accessed from
              the browser, your phone or your own code. Switch surfaces
              mid-trade without losing state.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {PLATFORMS.map(({ icon: Icon, title, body, features, cta, href, accent }, i) => (
            <ScrollReveal key={title} variant="fadeUp" delay={i * 0.08}>
              <div
                className="group relative h-full p-6 md:p-7 rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: accent ? 'var(--fx-bg-elev-2)' : 'var(--fx-bg)',
                  border: accent
                    ? '1px solid rgba(233,78,27,0.35)'
                    : '1px solid var(--fx-line)',
                  boxShadow: accent
                    ? '0 24px 60px -40px rgba(233,78,27,0.4)'
                    : 'none',
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                  style={{
                    background: 'rgba(233,78,27,0.12)',
                    border: '1px solid rgba(233,78,27,0.30)',
                  }}
                >
                  <Icon size={22} style={{ color: '#A5B4FC' }} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {title}
                </h3>

                <p
                  className="text-[13.5px] leading-relaxed mb-5"
                  style={{ color: 'var(--fx-text-2)' }}
                >
                  {body}
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px]">
                      <Check
                        size={13}
                        className="shrink-0 mt-0.5"
                        style={{ color: '#A5B4FC' }}
                      />
                      <span style={{ color: 'var(--fx-text-2)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={href}
                  className={
                    accent
                      ? 'fx-btn-primary justify-center w-full'
                      : 'fx-btn-ghost justify-center w-full'
                  }
                >
                  {cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
