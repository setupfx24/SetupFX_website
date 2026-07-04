import SetupFXHomePage from '@/setupfx/HomePage'

/**
 * Public homepage at setupfx24.com/.
 *
 * Renders the cinematic SetupFX marketing site (ported from the
 * standalone setupfx_web Vite project) which brings its own Navbar,
 * footer, fonts and dark-only theme. The (landing) layout detects the
 * `/` path and suppresses its legacy chrome so the two don't stack.
 */
export default function LandingHomePage() {
  return <SetupFXHomePage />
}
