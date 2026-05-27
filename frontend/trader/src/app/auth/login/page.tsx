'use client';

/**
 * Sign-in page (SwissCresta) — Vantage-style light auth surface.
 *
 * The previous Three.js dot-matrix shader background has been removed
 * for the redesign — it looked muddy on the new white brand palette.
 * The auth flow itself is unchanged.
 */

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { usePlatformStatusStore } from '@/stores/platformStatusStore';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { BRAND_NAME } from '@/config/brand';

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
        <label className="block text-xs text-[#5B5B5B] mb-1.5 pl-3">{props.label}</label>
      )}
      <div className="relative">
        <input
          type={props.type ?? 'text'}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          className={`w-full bg-white text-[#0A0A0A] placeholder-[#9A9A9A]
                      border border-[#E5E5E5] rounded-full py-3 px-5
                      focus:outline-none focus:border-[#E94E1B] focus:ring-2 focus:ring-[#E94E1B]/20
                      transition-colors
                      ${props.centered ? 'text-center' : ''}
                      ${props.rightAdornment ? 'pr-12' : ''}
                      ${props.error ? 'border-[#DC2626]/60' : ''}`}
        />
        {props.rightAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {props.rightAdornment}
          </div>
        )}
      </div>
      {props.error && (
        <span className="block text-[11px] text-[#DC2626] mt-1.5 pl-3">{props.error}</span>
      )}
      {!props.error && props.helper && (
        <span className="block text-[11px] text-[#9A9A9A] mt-1.5 pl-3">{props.helper}</span>
      )}
    </div>
  );
}

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
      <div className="relative flex flex-col min-h-screen bg-white overflow-hidden">

        {maintenance && (
          <div className="fixed top-0 left-0 right-0 z-20 px-4 py-2.5
                          flex items-center justify-center gap-2 text-sm font-medium
                          text-[#92400E] bg-[#FEF3C7] border-b border-[#F59E0B]/40">
            <AlertTriangle size={16} />
            Platform is under maintenance. Sign-in is temporarily disabled.
          </div>
        )}

        <div className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex items-baseline font-bold italic tracking-tight text-xl">
              <span className="text-[#0A0A0A]">{BRAND_NAME.slice(0, 5)}</span>
              <span className="text-[#E94E1B]">{BRAND_NAME.slice(5)}</span>
            </span>
          </Link>
        </div>

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
                <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-[#0A0A0A]">
                  Welcome back.
                </h1>
                <p className="text-base text-[#5B5B5B] font-light">
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
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#5B5B5B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors"
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
                    className="w-full rounded-full bg-[#E94E1B] text-white font-semibold py-3
                               hover:bg-[#C73E11] active:bg-[#A6320D]
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
                    className="text-xs text-[#5B5B5B] hover:text-[#0A0A0A] transition-colors"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              </form>

              <motion.div {...fadeUp(0.42)} className="flex items-center gap-4">
                <div className="h-px bg-[#E5E5E5] flex-1" />
                <span className="text-[#9A9A9A] text-xs">or continue with</span>
                <div className="h-px bg-[#E5E5E5] flex-1" />
              </motion.div>

              <motion.div {...fadeUp(0.46)} className="space-y-2.5">
                <Suspense fallback={null}>
                  <GoogleAuthButton disabled={loading || isLoading || demoLoading || maintenance} />
                </Suspense>
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={demoLoading || isLoading || maintenance}
                  className="w-full flex items-center justify-center gap-2
                             bg-white hover:bg-[#F5F5F5] text-[#0A0A0A] border border-[#E5E5E5]
                             rounded-full py-3 px-4 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {demoLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : 'Try demo — no sign-up'}
                </button>
              </motion.div>

              <motion.p {...fadeUp(0.52)} className="text-sm text-[#5B5B5B] pt-2">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-[#E94E1B] hover:text-[#C73E11] transition-colors underline-offset-2 hover:underline font-semibold">
                  Create one
                </Link>
              </motion.p>

              <motion.p {...fadeUp(0.58)} className="text-[11px] text-[#9A9A9A] pt-6 leading-relaxed">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#0A0A0A]">Terms</Link>
                {', '}
                <Link href="/privacy" className="underline hover:text-[#0A0A0A]">Privacy Notice</Link>
                {', and '}
                <Link href="/risk" className="underline hover:text-[#0A0A0A]">Risk Disclosure</Link>.
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {errorDialog && (
          <div
            onClick={() => setErrorDialog(null)}
            className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">{errorDialog.title}</h3>
              <p className="text-sm text-[#5B5B5B] mb-6">{errorDialog.message}</p>
              <button
                type="button"
                onClick={() => setErrorDialog(null)}
                className="w-full rounded-full bg-[#0A0A0A] text-white font-medium py-2.5 hover:bg-[#222] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {forgotOpen && (
          <div
            onClick={() => setForgotOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-1">Reset password</h3>
              <p className="text-sm text-[#5B5B5B] mb-5">
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
                    className="flex-1 rounded-full bg-white hover:bg-[#F5F5F5] text-[#0A0A0A] border border-[#E5E5E5] py-2.5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSending}
                    className="flex-1 rounded-full bg-[#E94E1B] text-white font-medium py-2.5
                               hover:bg-[#C73E11] disabled:opacity-50 transition-colors
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
