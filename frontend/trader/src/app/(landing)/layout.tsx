'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PopupProvider } from '@/landing/components/PopupContext'
import ScrollProgress from '@/landing/components/animations/ScrollProgress'
import { Footer } from '@/setupfx/components/Footer'
import { Navbar as SetupFXNavbar } from '@/setupfx/components/Navbar'
import { ChatBot } from '@/setupfx/components/ChatBot'
import { ScrollToTopButton } from '@/setupfx/components/ScrollToTopButton'
import '@/setupfx/styles.css'
import '@/landing/landing.css'
import './landing-light.css'

/**
 * Landing layout — wraps every page under (landing). The home page (/)
 * brings its own self-contained chrome (see /setupfx/HomePage), so we
 * skip the legacy Navbar/Footer + scrub the body padding on that exact
 * path. All inner pages (about, contact, how-it-works, etc.) keep the
 * existing landing chrome unchanged.
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  /* Override trader-app theme for landing pages. The scroll unlock is
     done via landing-scroll.css (loaded above) so we don't risk a
     server/client hydration mismatch from mutating inline style here. */
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', 'dark')
    html.style.backgroundColor = '#08090b'
    html.style.color = '#f5f5f5'
    return () => {
      html.setAttribute('data-theme', 'light')
      html.style.backgroundColor = '#F2EFE9'
      html.style.color = '#000000'
    }
  }, [])

  if (isHome) {
    // Bare wrapper — HomePage renders its own Navbar + CtaFooter.
    return (
      <PopupProvider>
        <ScrollProgress />
        {children}
        <ChatBot />
        <ScrollToTopButton />
      </PopupProvider>
    )
  }

  return (
    <PopupProvider>
      <ScrollProgress />
      <div className="setupfx-home landing-root min-h-screen">
        <SetupFXNavbar />
        {children}
        <Footer />
      </div>
      <ChatBot />
      <ScrollToTopButton />
    </PopupProvider>
  )
}
