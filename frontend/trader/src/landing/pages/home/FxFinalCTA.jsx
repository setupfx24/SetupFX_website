import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import ScrollReveal from '@/landing/components/animations/ScrollReveal'

/**
 * SwissCresta — Final CTA.
 *
 * Closing conversion block at the bottom of the marketing home.
 * Two parallel actions: open a live account (the funnel target) and
 * try the demo (the no-commitment path for visitors who aren't quite
 * ready to KYC).
 *
 * Previous version closed with smart-contract / "structured trading
 * system" / "Connect Wallet" copy that doesn't match the
 * repositioned Swiss-broker brand. Replaced with broker-standard
 * conversion language; closing line is original, not borrowed.
 */
export default function FxFinalCTA() {
  return (
    <section className="relative" style={{ background: 'var(--fx-bg)' }}>
      <div className="fx-container py-20 md:py-28">
        <ScrollReveal variant="fadeUp">
          <div
            className="relative rounded-3xl p-8 md:p-12 lg:p-14 overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, var(--fx-bg-elev-2) 60%), var(--fx-bg-elev)',
              border: '1px solid rgba(99,102,241,0.35)',
              boxShadow: '0 40px 80px -30px rgba(99,102,241,0.35)',
            }}
          >
            <div
              className="absolute -top-px left-[8%] right-[8%] h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(99,102,241,0.85), transparent)',
              }}
            />
            <div className="absolute inset-0 fx-grid-bg pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-7">
                <span
                  className="badge mb-5"
                  style={{ display: 'inline-flex' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--fx-gold)', boxShadow: '0 0 8px rgba(99,102,241,0.7)' }}
                  />
                  Get started
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-white leading-tight mb-4">
                  Open an account in <span className="gradient-text">under five minutes.</span>
                </h2>
                <p
                  className="text-base md:text-lg max-w-xl"
                  style={{ color: 'var(--fx-text-2)' }}
                >
                  Standard signup, online ID verification, and your first
                  trade ticket open before lunch. No paperwork by post.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:items-end lg:justify-end">
                <Link to="/auth/register" className="fx-btn-primary justify-center">
                  Open Live Account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/auth/login" className="fx-btn-ghost justify-center">
                  <PlayCircle size={16} />
                  Try Demo
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.2}>
          <p
            className="mt-12 text-center text-[12.5px] max-w-3xl mx-auto"
            style={{ color: 'var(--fx-text-3)' }}
          >
            Trading leveraged products carries significant risk and may not
            be suitable for all investors. You can lose more than your
            initial deposit. Read the full{' '}
            <Link to="/risk" className="underline hover:text-white">risk disclosure</Link>{' '}
            before opening an account.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
