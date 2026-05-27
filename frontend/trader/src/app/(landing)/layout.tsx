'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PopupProvider } from '@/landing/components/PopupContext'
import ScrollProgress from '@/landing/components/animations/ScrollProgress'
import Navbar from '@/landing/components/Navbar'
import Footer from '@/landing/components/Footer'
import LandingFooter from '@/components/landing/LandingFooter'
import '@/landing/landing.css'

// Marketing design system — tokens scoped under `[data-mkt]`. The
// wrapper below carries the attribute, so any descendant component
// that uses `bg-mkt-canvas` / `text-mkt-ink-primary` / etc. resolves
// to the new palette. The existing landing.css tokens are still loaded
// above; both coexist until STEP 3 replaces the chrome and STEP 4
// rebuilds the home sections.
import '@/styles/marketing.css'

/* Marketing pages rendered on the light SwissCresta canvas (#FFFFFF).
 * The shared Navbar reads `theme="light"` for these and `theme="dark"`
 * for everything else; LandingFooter swaps in for the legacy dark
 * Footer on these paths. Match is exact — `/platforms` is the light
 * index, but `/platforms/web` stays on the dark chrome because that
 * sub-page hero is still dark-themed. */
const LIGHT_MARKETING_PATHS = new Set<string>([
  '/',
  '/about',
  '/contact',
  '/how-it-works',
  '/platforms',
  '/platforms/insurance',
  '/privacy',
  '/risk',
  '/terms',
  '/white-label',
])

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname()
  /* Strip trailing slash so '/contact/' still matches '/contact', and
   * keep '/' as-is. Falls back to '' (never matches) when usePathname
   * is null during the very first client render. */
  const pathname =
    rawPathname === '/' || rawPathname == null
      ? rawPathname || ''
      : rawPathname.replace(/\/+$/, '')
  const isLight = LIGHT_MARKETING_PATHS.has(pathname)

  /* Force the html background to match the page surface so overscroll
   * doesn't reveal a stale dark/light stripe. Without this, dark home
   * looks fine, but the new light marketing pages get black bleed
   * because the html was previously pinned to #08090b. */
  useEffect(() => {
    const html = document.documentElement
    const prevTheme = html.getAttribute('data-theme') || 'dark'
    const prevBg = html.style.backgroundColor
    const prevColor = html.style.color

    if (isLight) {
      html.setAttribute('data-theme', 'light')
      html.style.backgroundColor = '#ffffff'
      html.style.color = '#111827'
    } else {
      html.setAttribute('data-theme', 'dark')
      html.style.backgroundColor = '#08090b'
      html.style.color = '#f5f5f5'
    }

    return () => {
      html.setAttribute('data-theme', prevTheme)
      html.style.backgroundColor = prevBg
      html.style.color = prevColor
    }
  }, [isLight])

  return (
    <PopupProvider>
      <ScrollProgress />
      {/* Wrapper attributes per mode:
          - `data-mkt`        : dark pages only. Activates marketing.css
                                scope (`[data-mkt]` token bindings). Light
                                pages style with plain Tailwind, so the
                                scope's base bg/font rules are unnecessary.
          - `landing-root`    : dark pages only. Defined in landing.css and
                                pins bg to `var(--fx-bg)` (deep navy), which
                                would override `bg-white` if applied to a
                                light page.
          - `data-page-mode`  : present in both modes for DevTools / CSS
                                hooks that need to react to the current
                                theme without re-checking the URL. */}
      <div
        {...(isLight ? {} : { 'data-mkt': 'true' })}
        data-page-mode={isLight ? 'light' : 'dark'}
        className={
          isLight
            ? 'min-h-screen bg-white text-gray-900'
            : 'landing-root min-h-screen bg-[#08090b] text-[#f5f5f5]'
        }
      >
        <Navbar theme={isLight ? 'light' : 'dark'} />
        {children}
        {isLight ? <LandingFooter /> : <Footer />}
      </div>
    </PopupProvider>
  )
}
