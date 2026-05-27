'use client';

/**
 * Sign-in page (SwissCresta).
 *
 * Visual layer: 3D shader-driven dot-matrix background
 * (CanvasRevealEffect from components/ui), centred glass card,
 * white-on-black pill inputs, framer-motion stage transitions.
 *
 * Functional layer (unchanged):
 *   - email + password primary path with optional 2FA TOTP follow-up
 *   - Google OIDC (GoogleAuthButton, GIS-rendered)
 *   - one-tap demo account
 *   - forgot-password modal → POST /auth/forgot-password
 *   - maintenance banner driven by /auth/platform-status poll
 *
 * SIWE wallet sign-in (was: <ConnectWalletButton variant="login" />)
 * removed in the wallet-integration purge — see git history for the
 * shape if you want to re-introduce it later. Backend /auth/wallet/*
 * endpoints still exist server-side but nothing on the client calls
 * them now.
 *
 * The pasted email→OTP→success template was visual reference only —
 * our backend auth is email+password, never been a passwordless flow.
 * Re-using its UX would have broken sign-in entirely.
 */

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { usePlatformStatusStore } from '@/stores/platformStatusStore';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { BRAND_NAME } from '@/config/brand';

/**
 * CanvasRevealEffect is dynamic-imported with `ssr: false` because
 * Turbopack's module-eval path breaks @react-three/fiber on the server:
 * react-reconciler reads
 * `React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`
 * which Turbopack's strict resolution leaves undefined at import time,
 * crashing the route. Loading client-only avoids the server module
 * graph entirely. Bonus: the Three.js bundle (~600 KB) is split into
 * its own chunk that only loads when the auth page mounts.
 */
const CanvasRevealEffect = dynamic(
  () =>
    import('@/components/ui/canvas-reveal-effect').then((m) => ({
      default: m.CanvasRevealEffect,
    })),
  { ssr: false, loading: () => null },
);

/* ────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────── */

const fadeUp = (delay: number) => ({
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.4, ease: 'easeOut' as const },
});

function authErrorMessage(err: unknown, kind: 'login' | 'demo' | 'forgot'): string {
  const raw = err instanceof Error ? err.message.trim() : 'Something went wrong.';
  const lower = raw.toLowerCase();
  if (kind === 'login' && (raw === 'Invalid credentials' || lower === 'invalid credentials'))
    return 'The email or password you entered is incorrect.';
  if (lower.includes('invalid 2fa'))
    return 'The verification code is incorrect or expired.';
  return raw;
}

/* Minimal pill-input matching the shader aesthetic. White on transparent
 * with a frosted border that brightens on focus. */
function PillInput(props: {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  helper?: string;
  rightAdornment?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  centered?: boolean;
}) {
  return (
    <div className="w-full">
      {props.label && (
        <label className="block text-xs text-white/60 mb-1.5 pl-3">{props.label}</label>
      )}
      <div className="relative">
        <input
          type={props.type ?? 'text'}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          className={`w-full backdrop-blur-[1px] bg-white/[0.04] text-white placeholder-white/30
                      border border-white/10 rounded-full py-3 px-5
                      focus:outline-none focus:border-white/40 focus:bg-white/[0.06]
                      transition-colors
                      ${props.centered ? 'text-center' : ''}
                      ${props.rightAdornment ? 'pr-12' : ''}
                      ${props.error ? 'border-red-400/50' : ''}`}
        />
        {props.rightAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {props.rightAdornment}
          </div>
        )}
      </div>
      {props.error && (
        <span className="block text-[11px] text-red-300/80 mt-1.5 pl-3">{props.error}</span>
      )}
      {!props.error && props.helper && (
        <span className="block text-[11px] text-white/40 mt-1.5 pl-3">{props.helper}</span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 * Page
 * ════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const { login, demoLogin, forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [need2FA, setNeed2FA] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [demoLoading, setDemoLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  const [errorDialog, setErrorDialog] = useState<{ title: string; message: string } | null>(null);

  /* Maintenance status — poll every 15s so the page reflects state without reload. */
  const maintenance = usePlatformStatusStore((s) => s.maintenance_mode);
  const fetchStatus = usePlatformStatusStore((s) => s.fetch);
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const handleSignIn = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email address.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await login(email, password, totpCode || undefined);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('2FA') && !msg.includes('Invalid')) {
        setNeed2FA(true);
      } else {
        setErrorDialog({ title: 'Sign-in failed', message: authErrorMessage(err, 'login') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      toast.success('Welcome — demo account');
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorDialog({ title: 'Demo sign-in failed', message: authErrorMessage(err, 'demo') });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleForgot = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSending(true);
    try {
      await forgotPassword(forgotEmail.trim());
      toast.success('Check your email for reset instructions.');
      setForgotOpen(false);
      setForgotEmail('');
    } catch (err: unknown) {
      setErrorDialog({ title: 'Error', message: authErrorMessage(err, 'forgot') });
    } finally {
      setForgotSending(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">

        {/* ── Shader background ─────────────────────────────────────────
            Intro animation runs once on mount; dots fade in from the
            centre. White on black; speed kept low to feel ambient
            rather than busy on an auth page. */}
        <div className="absolute inset-0 z-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[
              [255, 255, 255],
              [255, 255, 255],
            ]}
            dotSize={6}
            reverse={false}
          />
          {/* Vignette + top fade so the form sits cleanly over the dots
              without the corners pulling focus away from the centre. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,1)_100%)]" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        </div>

        {/* ── Maintenance banner ─ */}
        {maintenance && (
          <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md px-4 py-2.5
                          flex items-center justify-center gap-2 text-sm font-medium
                          text-amber-200 bg-amber-500/10 border-b border-amber-500/40">
            <AlertTriangle size={16} />
            Platform is under maintenance. Sign-in is temporarily disabled.
          </div>
        )}

        {/* ── Brand mark (top-left) ─
            Inline Swiss-flag SVG + wordmark. The flag mark is the
            shared brand anchor (matches the navbar, footer, hero, and
            SwissCrestaWordmark component) so a user landing on /login
            from any external entry point sees the same identity. */}
        <div className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="w-7 h-7 shrink-0">
              <rect width="32" height="32" rx="4" fill="#DC2626" />
              <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
              <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
            </svg>
            <span className="inline-flex items-baseline font-bold tracking-tight text-xl">
              <span className="text-white">{BRAND_NAME.slice(0, 5)}</span>
              <span className="text-[#6366F1]">{BRAND_NAME.slice(5)}</span>
            </span>
          </Link>
        </div>

        {/* ── Form ─ */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-sm space-y-6 text-center"
            >
              <motion.div {...fadeUp(0.1)} className="space-y-1">
                <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                  Welcome back.
                </h1>
                <p className="text-base text-white/60 font-light">
                  Sign in to continue trading.
                </p>
              </motion.div>

              <form onSubmit={handleSignIn} noValidate className="space-y-3">
                <motion.div {...fadeUp(0.2)}>
                  <PillInput
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    error={errors.email}
                    centered
                  />
                </motion.div>

                <motion.div {...fadeUp(0.26)}>
                  <PillInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="Your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    error={errors.password}
                    centered
                    rightAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </motion.div>

                <AnimatePresence>
                  {need2FA && (
                    <motion.div
                      key="2fa"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <PillInput
                        type="text"
                        inputMode="numeric"
                        placeholder="2FA code (000000)"
                        autoComplete="one-time-code"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        centered
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div {...fadeUp(0.32)} className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || isLoading || maintenance}
                    className="w-full rounded-full bg-white text-black font-medium py-3
                               hover:bg-white/90 active:bg-white/80
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {(loading || isLoading)
                      ? <Loader2 size={18} className="animate-spin" />
                      : maintenance
                        ? 'Unavailable (Maintenance)'
                        : <>Sign in <ArrowRight size={16} /></>}
                  </button>
                </motion.div>

                <motion.div {...fadeUp(0.36)} className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              </form>

              <motion.div {...fadeUp(0.42)} className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-xs">or continue with</span>
                <div className="h-px bg-white/10 flex-1" />
              </motion.div>

              <motion.div {...fadeUp(0.46)} className="space-y-2.5">
                <Suspense fallback={null}>
                  <GoogleAuthButton disabled={loading || isLoading || demoLoading || maintenance} />
                </Suspense>
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={demoLoading || isLoading || maintenance}
                  className="w-full backdrop-blur-[2px] flex items-center justify-center gap-2
                             bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10
                             rounded-full py-3 px-4 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {demoLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : 'Try demo — no sign-up'}
                </button>
              </motion.div>

              <motion.p {...fadeUp(0.52)} className="text-sm text-white/50 pt-2">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-white hover:text-[#A5B4FC] transition-colors underline-offset-2 hover:underline">
                  Create one
                </Link>
              </motion.p>

              <motion.p {...fadeUp(0.58)} className="text-[11px] text-white/30 pt-6 leading-relaxed">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
                {', '}
                <Link href="/privacy" className="underline hover:text-white/50">Privacy Notice</Link>
                {', and '}
                <Link href="/risk" className="underline hover:text-white/50">Risk Disclosure</Link>.
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Error dialog ─ */}
        {errorDialog && (
          <div
            onClick={() => setErrorDialog(null)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0E1A]/90 backdrop-blur-md p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{errorDialog.title}</h3>
              <p className="text-sm text-white/70 mb-6">{errorDialog.message}</p>
              <button
                type="button"
                onClick={() => setErrorDialog(null)}
                className="w-full rounded-full bg-white text-black font-medium py-2.5 hover:bg-white/90 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* ── Forgot-password modal ─ */}
        {forgotOpen && (
          <div
            onClick={() => setForgotOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0E1A]/90 backdrop-blur-md p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-1">Reset password</h3>
              <p className="text-sm text-white/60 mb-5">
                Enter your email. If an account exists, we&apos;ll send reset instructions.
              </p>
              <form onSubmit={handleForgot} className="space-y-4">
                <PillInput
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  centered
                />
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSending}
                    className="flex-1 rounded-full bg-white text-black font-medium py-2.5
                               hover:bg-white/90 disabled:opacity-50 transition-colors
                               inline-flex items-center justify-center"
                  >
                    {forgotSending ? <Loader2 size={18} className="animate-spin" /> : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
