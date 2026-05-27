import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import GoogleAuthProvider from '@/components/providers/GoogleAuthProvider';
import NotificationListener from '@/components/NotificationListener';
import ProfileCompleteGate from '@/components/profile/ProfileCompleteGate';
import OnboardingGate from '@/components/auth/OnboardingGate';
import TopLoader from '@/components/TopLoader';
import { fontVariableClass } from '@/styles/fonts';

/**
 * Favicon comes from `src/app/icon.png` — Next.js App Router auto-
 * registers it. No `metadata.icons` override needed (any override
 * here would beat the file convention).
 */
export const metadata: Metadata = {
  title: 'SwissCresta',
  description: 'SwissCresta — professional forex and CFD trading platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom intentionally allowed for WCAG 2.1.4 compliance.
  // Earlier `maximumScale: 1` + `userScalable: false` blocked
  // low-vision users — dropped per accessibility audit.
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `fontVariableClass` applies the three CSS-var fonts
    // (--font-display = Fraunces, --font-body = Inter Tight,
    //  --font-mono = JetBrains Mono) globally. Tailwind picks them
    // up via the font-family extensions in tailwind.config.ts —
    // `font-display`, `font-body`, `font-mono`.
    <html lang="fr" suppressHydrationWarning className={fontVariableClass}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var N='swisscresta-ui';var LEG=['novafx-ui','fxartha-ui'];if(!localStorage.getItem(N)){for(var i=0;i<LEG.length;i++){var v=localStorage.getItem(LEG[i]);if(v){localStorage.setItem(N,v);break;}}for(var j=0;j<LEG.length;j++){localStorage.removeItem(LEG[j]);}}var s=localStorage.getItem(N);var t='light';if(s){var j2=JSON.parse(s);t=(j2&&j2.state&&j2.state.theme)||(j2&&j2.theme)||'light';}var d=document.documentElement;d.setAttribute('data-theme',t);d.classList.add(t==='light'?'theme-light':'theme-dark');if(t==='light'){d.style.backgroundColor='#ffffff';d.style.color='#0A0A0A';}else{d.style.backgroundColor='#0a0a0a';d.style.color='#ffffff';}}catch(e){document.documentElement.setAttribute('data-theme','light');document.documentElement.style.backgroundColor='#ffffff';document.documentElement.style.color='#0A0A0A';}})();`,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <ThemeProvider>
          <AuthProvider>
            <GoogleAuthProvider>
            <NotificationListener />
            {/* Two-stage onboarding gate. ProfileCompleteGate enforces the
                profile-fields step (always renders first if profile is
                incomplete); OnboardingGate then enforces wallet + email
                verification on top. Order matters: only one of them ever
                shows at a time, and they chain — finish the profile, then
                the wallet/email gate kicks in. Both are non-dismissible. */}
            <ProfileCompleteGate />
            <OnboardingGate />
            {children}
            <Toaster
              position="top-center"
              containerClassName="swisscresta-toaster"
              gutter={10}
              toastOptions={{
                duration: 2500,
                className: 'swisscresta-hot-toast',
                // maxWidth caps the toast at a readable column so long
                // backend error messages (e.g. balance-gate copy) wrap
                // onto a second line instead of stretching across the
                // chart and overlapping other UI. Tested down to 320 px
                // mobile widths — copy still readable.
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-fg)',
                  border: '1px solid var(--toast-border)',
                  maxWidth: '380px',
                  lineHeight: 1.4,
                },
                success: {
                  duration: 2200,
                  className: 'swisscresta-hot-toast',
                  // White check on an amber disc reads as "good" instantly on
                  // dark surface without losing the brand accent.
                  iconTheme: { primary: '#F59E0B', secondary: '#1A140A' },
                },
                error: {
                  duration: 4000,
                  className: 'swisscresta-hot-toast',
                  // White X on a saturated red disc — high contrast on the
                  // dark toast background, no fade-out into the BG colour.
                  iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
                },
                loading: {
                  duration: Infinity,
                  className: 'swisscresta-hot-toast',
                  iconTheme: { primary: '#E94E1B', secondary: 'var(--toast-bg)' },
                },
              }}
            />
            </GoogleAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
