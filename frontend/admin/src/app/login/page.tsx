'use client';

/**
 * Admin sign-in (SwissCresta Admin).
 *
 * Visual layer matches the trader sign-in: 3D shader-driven dot-matrix
 * background (CanvasRevealEffect from components/ui), centred card,
 * white-on-black pill inputs, framer-motion fade-up transitions.
 *
 * Functional layer (unchanged): email + password against the admin JWT
 * endpoint (separate from the trader user JWT). Admin has NO Google /
 * wallet / demo paths — operators only.
 *
 * Trust strip from the previous redesign is preserved as small chips
 * beneath the form: separation-of-secret with the user JWT, audit
 * logging, KYC/book/payout ops. Slightly tighter than before to balance
 * with the shader background.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, MotionConfig } from 'framer-motion';
import {
  Lock, Mail, Loader2, AlertCircle, Eye, EyeOff,
  ShieldCheck, KeyRound, Activity, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useAuthRehydrated } from '@/hooks/useAuthRehydrated';
import { BRAND_NAME } from '@/config/brand';

/**
 * CanvasRevealEffect is dynamic-imported with `ssr: false` for two
 * reasons stacked on top of each other:
 *
 *   1. Turbopack breaks @react-three/fiber's module-eval path on the
 *      server side — react-reconciler reads
 *      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner
 *      and Turbopack's strict module resolution leaves that undefined
 *      at import time, crashing the page before render. Loading the
 *      component client-only sidesteps the whole server module graph.
 *
 *   2. Three.js + R3F adds ~600 KB to the bundle. Admin is internal-use,
 *      low-traffic, and the login page is hit at most a few times per
 *      operator per day. Dynamic-importing puts the shader in its own
 *      chunk so the rest of the admin app's pages don't pay for it.
 *
 * The `loading: () => null` keeps the shader area blank during the
 * fetch — the static gradient overlay underneath still renders, so the
 * page never looks empty.
 */
const CanvasRevealEffect = dynamic(
  () =>
    import('@/components/ui/canvas-reveal-effect').then((m) => ({
      default: m.CanvasRevealEffect,
    })),
  { ssr: false, loading: () => null },
);

const fadeUp = (delay: number) => ({
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.4, ease: 'easeOut' as const },
});

/** Compact trust-marker chips — replaced the verbose vertical list from
 *  the previous redesign with a single row of icon-chips so the form
 *  stays the visual hero. */
const TRUST_CHIPS = [
  { icon: ShieldCheck, label: 'Audit-logged' },
  { icon: KeyRound,    label: 'Isolated admin JWT' },
  { icon: Activity,    label: 'IP-fingerprinted' },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const authRehydrated = useAuthRehydrated();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* If a stored token rehydrates and is still valid, skip the form
   * entirely — same redirect behaviour as the previous version. */
  useEffect(() => {
    if (!authRehydrated) return;
    if (isAuthenticated) router.replace('/dashboard');
  }, [authRehydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* Pre-hydration: render only the shader bg + spinner so the form
   * doesn't flash unauthed-then-authenticated when an existing session
   * is still being rehydrated from localStorage. */
  if (!authRehydrated) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
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
        </div>
        <Loader2 size={24} className="relative z-10 animate-spin text-white/70" />
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">

        {/* Shader background — same animation + colours as the trader
            sign-in so an operator who flips between trader/admin tabs
            sees a coherent brand. */}
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

        {/* Brand mark — inline Swiss-flag SVG + wordmark + " Admin"
            suffix. Same lockup as the trader login so an operator who
            opens both consoles side-by-side sees one identity. The
            flag SVG mirrors the one used in the navbar / hero / footer
            on the trader site — single source of visual truth even
            though it's duplicated in code (they're different Next
            apps, no shared import possible). */}
        <div className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8">
          <div className="inline-flex items-center gap-2 select-none">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="w-7 h-7 shrink-0">
              <rect width="32" height="32" rx="4" fill="#DC2626" />
              <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
              <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
            </svg>
            <span className="inline-flex items-baseline font-bold tracking-tight text-xl">
              <span className="text-white">{BRAND_NAME.slice(0, 5)}</span>
              <span className="text-[#6366F1]">{BRAND_NAME.slice(5)}</span>
              <span className="text-white/40 text-sm font-medium ml-2">Admin</span>
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <motion.div {...fadeUp(0.1)} className="space-y-3 flex flex-col items-center">
              <div className="bg-white/95 rounded-lg px-3 py-2 inline-flex">
                <img
                  src="/logo.png"
                  alt="SwissCresta"
                  className="h-9 w-auto"
                />
              </div>
              <h1 className="text-[2.25rem] font-bold leading-[1.1] tracking-tight text-white">
                Operator console
              </h1>
              <p className="text-sm text-white/60 font-light">
                Authorised personnel only.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate className="space-y-3 text-left">

              {/* Email */}
              <motion.div {...fadeUp(0.18)}>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@swisscresta.com"
                    required
                    autoComplete="email"
                    className="w-full backdrop-blur-[1px] bg-white/[0.04] text-white placeholder-white/30
                               border border-white/10 rounded-full py-3 pl-11 pr-4
                               focus:outline-none focus:border-white/40 focus:bg-white/[0.06]
                               transition-colors"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div {...fadeUp(0.24)}>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="w-full backdrop-blur-[1px] bg-white/[0.04] text-white placeholder-white/30
                               border border-white/10 rounded-full py-3 pl-11 pr-12
                               focus:outline-none focus:border-white/40 focus:bg-white/[0.06]
                               transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9
                               flex items-center justify-center rounded-full
                               text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-red-300
                             bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="leading-tight">{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <motion.div {...fadeUp(0.3)} className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-white text-black font-medium py-3
                             hover:bg-white/90 active:bg-white/80
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors inline-flex items-center justify-center gap-2"
                >
                  {loading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <>Sign in <ArrowRight size={16} /></>}
                </button>
              </motion.div>
            </form>

            {/* Trust chips */}
            <motion.div {...fadeUp(0.36)} className="flex flex-wrap items-center justify-center gap-2">
              {TRUST_CHIPS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[11px] text-white/55
                             bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5"
                >
                  <Icon size={11} className="text-[#A5B4FC]" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Warning chip — operators only */}
            <motion.div
              {...fadeUp(0.42)}
              className="inline-flex items-center gap-2 text-[11px] text-amber-200/80
                         bg-amber-500/[0.06] border border-amber-500/20 rounded-full px-4 py-2"
            >
              <ShieldCheck size={12} />
              <span>All sign-in attempts logged with IP and device fingerprint.</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
