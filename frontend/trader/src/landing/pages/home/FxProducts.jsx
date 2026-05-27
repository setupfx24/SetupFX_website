'use client'

import { Link } from 'react-router-dom'
import { TrendingUp, BarChart3, Bitcoin, LineChart, Gem, ArrowRight } from 'lucide-react'
import ScrollReveal from '@/landing/components/animations/ScrollReveal'

/**
 * Home product grid — 5 asset-class cards.
 *
 * Standard institutional-broker home-page pattern: lead with what the
 * user can actually trade, one card per asset class. Each card has an
 * icon, the asset class name, a one-line factual description, a
 * representative spec, and a link into the relevant trading page.
 *
 * Copy is original and generic — uses industry-standard product
 * descriptions that apply to any licensed broker offering these
 * instruments. No claims that aren't backed by SwissCresta's actual
 * product (spreads / leverage / instrument count). Update the chip
 * values in PRODUCTS below if marketing re-specs.
 */

const PRODUCTS = [
  {
    icon: TrendingUp,
    title: 'Forex',
    body: 'Trade 60+ currency pairs — majors, minors and exotics — with deep liquidity around the clock.',
    chip: 'Spreads from 0.1 pips',
    href: '/trading/overview',
  },
  {
    icon: BarChart3,
    title: 'CFDs on Stocks',
    body: 'Long and short on global blue-chips and growth names without owning the underlying share.',
    chip: 'Leverage up to 1:20',
    href: '/trading/overview',
  },
  {
    icon: Bitcoin,
    title: 'Crypto',
    body: 'BTC, ETH and the major altcoin pairs settled in USDT — no wallet management required.',
    chip: 'Leverage up to 1:10',
    href: '/trading/overview',
  },
  {
    icon: LineChart,
    title: 'Indices',
    body: 'S&P 500, NASDAQ, FTSE, DAX and the rest of the world’s benchmark indices on one platform.',
    chip: 'Leverage up to 1:100',
    href: '/trading/overview',
  },
  {
    icon: Gem,
    title: 'Metals & Commodities',
    body: 'Gold, silver, oil and the soft commodities — hedge currency exposure or trade the macro cycle.',
    chip: 'Leverage up to 1:100',
    href: '/trading/overview',
  },
]

export default function HomeProductGrid() {
  return (
    <section
      className="relative"
      style={{ background: 'var(--fx-bg)' }}
    >
      <div className="fx-container py-20 md:py-28">
        <ScrollReveal variant="fadeUp">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <p
              className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] mb-3"
              style={{ color: '#A5B4FC' }}
            >
              Markets
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              One account.{' '}
              <span className="fx-gold-text">Every major market.</span>
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed"
              style={{ color: 'var(--fx-text-2)' }}
            >
              Forex, equity CFDs, crypto, indices and commodities — all
              with the same login, the same balance, and the same
              execution engine.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {PRODUCTS.map(({ icon: Icon, title, body, chip, href }, i) => (
            <ScrollReveal key={title} variant="fadeUp" delay={i * 0.05}>
              <Link
                to={href}
                className="group relative block h-full p-5 md:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--fx-bg-elev)',
                  border: '1px solid var(--fx-line)',
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 transition-colors"
                  style={{
                    background: 'rgba(99,102,241,0.10)',
                    border: '1px solid rgba(99,102,241,0.25)',
                  }}
                >
                  <Icon size={20} style={{ color: '#A5B4FC' }} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {title}
                </h3>

                <p
                  className="text-[13px] leading-relaxed mb-4"
                  style={{ color: 'var(--fx-text-2)' }}
                >
                  {body}
                </p>

                <div className="flex items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--fx-line)' }}>
                  <span
                    className="text-[10.5px] uppercase tracking-wider font-medium"
                    style={{ color: 'var(--fx-text-3)' }}
                  >
                    {chip}
                  </span>
                  <ArrowRight
                    size={14}
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    style={{ color: '#A5B4FC' }}
                  />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
