'use client';

/**
 * Sign-up page (SwissCresta).
 *
 * Visual layer mirrors the sign-in page (shader background, pill inputs,
 * white-on-black). Functional layer hits the existing /auth/register
 * endpoint with first_name / last_name / email / phone / password +
 * optional referral_code; on success the user lands on /accounts where
 * the OnboardingGate takes over (email verify only — wallet linking
 * was removed in the wallet-integration purge).
 *
 * Google + Demo are surfaced too so a first-time visitor who realises
 * they'd rather social-login can do that without leaving the page.
 */

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { BRAND_NAME } from '@/config/brand';

/**
 * CanvasRevealEffect is dynamic-imported with `ssr: false` — Turbopack
 * breaks @react-three/fiber on the server module-eval path (the inner
 * react-reconciler reads
 * `React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`
 * which Turbopack's strict resolution leaves undefined). Loading
 * client-only sidesteps the issue and also code-splits the ~600 KB
 * Three.js bundle into its own chunk. See the trader sign-in page for
 * the same comment + same import shape.
 */
const CanvasRevealEffect = dynamic(
  () =>
    import('@/components/ui/canvas-reveal-effect').then((m) => ({
      default: m.CanvasRevealEffect,
    })),
  { ssr: false, loading: () => null },
);

/* ────────────────────────────────────────────────────────────────────
 * Helpers (kept inline so login + register can stay self-contained
 * without forcing a shared file just yet — if a third auth surface
 * shows up, lift PillInput into components/ui).
 * ──────────────────────────────────────────────────────────────────── */

const fadeUp = (delay: number) => ({
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.4, ease: 'easeOut' as const },
});

function PillInput(props: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  helper?: string;
  rightAdornment?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="w-full">
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
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, demoLogin, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', phone: '', referral_code: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  /* Honour ?ref=CODE from referral links — IB partners share URLs like
   * https://trade.swisscresta.com/auth/register?ref=NXJ4Z9. */
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm((prev) => ({ ...prev, referral_code: ref }));
  }, [searchParams]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      toast.success('Welcome — demo account');
      router.push('/accounts');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo sign-in failed';
      toast.error(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required.';
    if (!form.last_name.trim()) e.last_name = 'Last name is required.';
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Please enter a valid email address.';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9 \-()]{6,20}$/.test(form.phone.trim())) {
      e.phone = 'Please enter a valid phone number.';
    }
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone.trim(),
        referral_code: form.referral_code || undefined,
      });
      toast.success('Account created successfully!');
      router.push('/accounts');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* Cheap strength meter — char-count buckets are enough for a UX hint;
   * server enforces real policy on /auth/register. */
  const strength = form.password.length >= 12 ? 4
                  : form.password.length >= 10 ? 3
                  : form.password.length >= 8 ? 2
                  : form.password.length > 0 ? 1 : 0;
  const strengthColors = ['#ef4444', '#f59e0b', '#22c55e', '#6366F1'];
  const strengthLabels = ['Weak', 'OK', 'Good', 'Strong'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">

        {/* Shader background — matches login. Same animation, same speed
            so a user toggling between login ↔ register doesn't see the
            dots restart and feel jarring. */}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,1)_100%)]" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
        </div>

        {/* Brand mark — inline Swiss-flag SVG + wordmark. Matches the
            login page lockup so a user toggling between sign-in and
            register sees the brand identity stay still. */}
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

        {/* Form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-sm space-y-5 text-center"
            >
              <motion.div {...fadeUp(0.1)} className="space-y-1">
                <h1 className="text-[2.25rem] font-bold leading-[1.1] tracking-tight text-white">
                  Create your account
                </h1>
                <p className="text-sm text-white/60 font-light">
                  Trade FX, crypto and CFDs in minutes.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3 text-left">
                <motion.div {...fadeUp(0.16)} className="grid grid-cols-2 gap-3">
                  <PillInput
                    placeholder="First name"
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    error={errors.first_name}
                  />
                  <PillInput
                    placeholder="Last name"
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={(e) => update('last_name', e.target.value)}
                    error={errors.last_name}
                  />
                </motion.div>

                <motion.div {...fadeUp(0.2)}>
                  <PillInput
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    error={errors.email}
                  />
                </motion.div>

                <motion.div {...fadeUp(0.24)}>
                  <PillInput
                    type="tel"
                    placeholder="Phone (e.g. +91 9876543210)"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone}
                  />
                </motion.div>

                <motion.div {...fadeUp(0.28)}>
                  <PillInput
                    placeholder="Referral code (optional)"
                    value={form.referral_code}
                    onChange={(e) => update('referral_code', e.target.value)}
                  />
                </motion.div>

                <motion.div {...fadeUp(0.32)}>
                  <PillInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    error={errors.password}
                    helper={strength === 0 ? 'Minimum 8 characters' : undefined}
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
                  {strength > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 px-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            background: i <= strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                      <span
                        className="text-[10px] ml-1 font-medium"
                        style={{ color: strengthColors[strength - 1] }}
                      >
                        {strengthLabels[strength - 1]}
                      </span>
                    </div>
                  )}
                </motion.div>

                <motion.div {...fadeUp(0.36)}>
                  <PillInput
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    rightAdornment={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </motion.div>

                <motion.div {...fadeUp(0.4)} className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || isLoading}
                    className="w-full rounded-full bg-white text-black font-medium py-3
                               hover:bg-white/90 active:bg-white/80
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {(loading || isLoading)
                      ? <Loader2 size={18} className="animate-spin" />
                      : <>Create account <ArrowRight size={16} /></>}
                  </button>
                </motion.div>
              </form>

              <motion.div {...fadeUp(0.46)} className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-xs">or continue with</span>
                <div className="h-px bg-white/10 flex-1" />
              </motion.div>

              <motion.div {...fadeUp(0.5)} className="space-y-2.5">
                <Suspense fallback={null}>
                  <GoogleAuthButton disabled={loading || isLoading || demoLoading} />
                </Suspense>
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={demoLoading || isLoading}
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

              <motion.p {...fadeUp(0.56)} className="text-sm text-white/50 pt-2">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-white hover:text-[#A5B4FC] transition-colors underline-offset-2 hover:underline">
                  Sign in
                </Link>
              </motion.p>

              <motion.p {...fadeUp(0.62)} className="text-[11px] text-white/30 pt-4 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
                {', '}
                <Link href="/privacy" className="underline hover:text-white/50">Privacy Notice</Link>
                {', and '}
                <Link href="/risk" className="underline hover:text-white/50">Risk Disclosure</Link>.
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
