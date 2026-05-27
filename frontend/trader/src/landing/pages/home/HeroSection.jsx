'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import TickerTape from '@/landing/components/TickerTape'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

/**
 * SwissCresta home hero.
 *
 * Layout follows a conventional institutional-broker home: big product
 * list as the headline, leverage / execution spec as the subheading,
 * two parallel CTAs (Open Demo, Open Live Account). Swiss-flag mark
 * sits above the headline as the brand anchor.
 *
 * All on-chain / smart-contract / "decentralized custody" language
 * was removed when the wallet integration was retired — the messaging
 * is now positioned like a traditional licensed broker. Numeric
 * claims (e.g. 1:500 max leverage) are SwissCresta's actual product
 * values; update in this file if marketing changes the spec sheet.
 */
export default function HeroSection() {
  const router = useRouter()
  const demoLogin = useAuthStore((s) => s.demoLogin)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemo = async () => {
    setDemoLoading(true)
    try {
      await demoLogin()
      toast.success('Welcome — demo account')
      router.push('/accounts')
    } catch (err) {
      toast.error(err?.message || 'Demo sign-in failed')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18), transparent 60%), ' +
          'linear-gradient(180deg, #0B0F1A 0%, #0B0F1A 60%, #0F1530 100%)',
      }}
    >
      {/* Decorative grid + spotlight — pure CSS, no asset. Same mask
          as before so the corners fade out rather than show grid lines
          crashing against the section edges. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)',
        }}
      />

      <div className="fx-container relative z-10 pt-28 md:pt-32 lg:pt-40 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Swiss-flag brand mark + "Swiss-built" eyebrow */}
          <div className="inline-flex items-center gap-2.5 fx-fade-up">
            {/* Inline Swiss-flag SVG — public-domain national symbol,
                not a logo trademark. Same mark as SwissCrestaWordmark
                but slightly larger here to act as the hero anchor. */}
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
            >
              <rect width="32" height="32" rx="4" fill="#DC2626" />
              <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
              <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
            </svg>
            <span
              className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: '#A5B4FC' }}
            >
              Swiss-built · Precision-engineered
            </span>
          </div>

          {/* Headline — product list, kept short enough to read on one
              line at md+ and wrap cleanly on mobile. Matches the
              "tell them what you trade" hero pattern. */}
          <h1
            className="mt-6 fx-headline text-[40px] sm:text-[56px] md:text-[68px] lg:text-[80px] fx-fade-up fx-fade-up-d1"
          >
            Trade FX, Stocks,
            <br />
            <span className="fx-gold-text">Crypto, Indices, Gold.</span>
          </h1>

          {/* Spec subheading — leverage + spreads spec sheet. Numbers
              are SwissCresta's, not borrowed. Update here if marketing
              re-specs the tiers. */}
          <p
            className="mt-6 mx-auto max-w-2xl text-base md:text-lg leading-relaxed fx-fade-up fx-fade-up-d2"
            style={{ color: 'var(--fx-text-2)' }}
          >
            Tight spreads from{' '}
            <strong className="text-white font-semibold">0.1 pips</strong>,
            leverage up to{' '}
            <strong className="text-white font-semibold">1:500</strong>,
            and order routing built for serious traders.
          </p>

          {/* CTAs — Open Demo (instant, no signup) on the left,
              Open Live Account (registration) on the right. Demo is
              primary because it converts curiosity to a hands-on
              trial in one click; live account is the considered next
              step. */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center fx-fade-up fx-fade-up-d3">
            <button
              type="button"
              onClick={handleDemo}
              disabled={demoLoading}
              className="fx-btn-primary justify-center disabled:opacity-60"
            >
              {demoLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Spinning up demo…
                </>
              ) : (
                <>
                  Open Demo
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <Link to="/auth/register" className="fx-btn-ghost justify-center">
              Open Live Account
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Trust strip — repositioned for a traditional Swiss-broker
              audience. The previous on-chain / BSC-vault / USDT
              language went away with the wallet integration; replaced
              with the kind of trust signals a regulated multi-asset
              broker actually leads with. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs fx-fade-up fx-fade-up-d4"
               style={{ color: 'var(--fx-text-3)' }}>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} style={{ color: '#A5B4FC' }} />
              Segregated client funds
            </span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>•</span>
            <span>Sub-second execution</span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>•</span>
            <span>24/5 multilingual support</span>
            <span className="hidden sm:inline" style={{ opacity: 0.4 }}>•</span>
            <span>No hidden fees</span>
          </div>
        </div>
      </div>

      {/* Live ticker — sits flush at the bottom of the hero, gives the
          page immediate "this is a real broker" texture. */}
      <div className="relative z-10">
        <TickerTape />
      </div>
    </section>
  )
}
