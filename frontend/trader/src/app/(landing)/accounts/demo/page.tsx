'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

/**
 * /accounts/demo — single-purpose launcher for the trading terminal demo.
 *
 * On mount:
 *   1. If the user already has a session, push them straight to
 *      /trading/terminal (no demo signup needed).
 *   2. Otherwise create a fresh demo account via authStore.demoLogin()
 *      and redirect on success.
 *
 * A manual "Launch demo" fallback shows up after 1.5s in case the auto
 * trigger hasn't fired (autoplay blockers / hydration race).
 */
export default function DemoAccountPage() {
  const router = useRouter()
  const { demoLogin, user } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const [busy, setBusy] = useState(false)

  const launchDemo = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      // Already authenticated — skip straight to the terminal.
      if (user) {
        router.replace('/trading/terminal')
        return
      }
      await demoLogin()
      toast.success('Demo account ready — opening terminal')
      router.replace('/trading/terminal')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not start demo'
      setError(msg)
      toast.error(msg)
      setBusy(false)
    }
  }

  useEffect(() => {
    void launchDemo()
    const t = setTimeout(() => setShowFallback(true), 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary, #ffffff)' }}
    >
      <div className="text-center max-w-md">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#1074FE] to-[#4D95FF] flex items-center justify-center shadow-lg shadow-[#1074FE]/30">
          {error ? (
            <Play className="w-6 h-6 text-white" />
          ) : (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
          {error ? 'Could not start demo' : 'Launching demo terminal…'}
        </h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {error
            ? error
            : 'Setting up a $100,000 virtual account so you can practise on real market data — no signup required.'}
        </p>

        {(showFallback || error) && (
          <button
            type="button"
            onClick={launchDemo}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0856C5] to-[#4D95FF] text-white text-sm font-semibold shadow-md shadow-[#1074FE]/30 hover:shadow-lg hover:shadow-[#1074FE]/40 transition-shadow disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {busy ? 'Starting…' : 'Launch demo terminal'}
          </button>
        )}
      </div>
    </div>
  )
}
