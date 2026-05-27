'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

/**
 * Trader-app error boundary. Catches uncaught exceptions in any route
 * below this layout. Dark theme matches the trader chrome. The landing
 * route group has its own error.tsx with the light marketing styling.
 *
 * Forwards errors to Sentry (when SENTRY_DSN is set) + console.error.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('[app/error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Error 500</p>
        <h1 className="text-3xl font-bold mb-3">Something broke on our end.</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          A part of the platform failed to load. The error has been logged. You can retry,
          or head back to the dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-6">Reference: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#5558E3] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
