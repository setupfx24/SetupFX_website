'use client';

/**
 * Sign-up page (SwissCresta) — Vantage-style light auth surface.
 * Mirrors the login page styling. The Three.js shader background was
 * removed for the redesign.
 */

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { BRAND_NAME } from '@/config/brand';

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
          className={`w-full bg-white text-[#0A0A0A] placeholder-[#9A9A9A]
                      border border-[#E5E5E5] rounded-full py-3 px-5
                      focus:outline-none focus:border-[#E94E1B] focus:ring-2 focus:ring-[#E94E1B]/20
                      transition-colors
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

  const strength = form.password.length >= 12 ? 4
                  : form.password.length >= 10 ? 3
                  : form.password.length >= 8 ? 2
                  : form.password.length > 0 ? 1 : 0;
  const strengthColors: readonly [string, string, string, string] = ['#ef4444', '#f59e0b', '#22c55e', '#E94E1B'];
  const strengthLabels: readonly [string, string, string, string] = ['Weak', 'OK', 'Good', 'Strong'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-col min-h-screen bg-white overflow-hidden">

        <div className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex items-baseline font-bold italic tracking-tight text-xl">
              <span className="text-[#0A0A0A]">{BRAND_NAME.slice(0, 5)}</span>
              <span className="text-[#E94E1B]">{BRAND_NAME.slice(5)}</span>
            </span>
          </Link>
        </div>

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
                <h1 className="text-[2.25rem] font-bold leading-[1.1] tracking-tight text-[#0A0A0A]">
                  Create your account
                </h1>
                <p className="text-sm text-[#5B5B5B] font-light">
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
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#5B5B5B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors"
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
                            background: i <= strength ? strengthColors[strength - 1] : 'rgba(0,0,0,0.08)',
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
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#5B5B5B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors"
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
                    className="w-full rounded-full bg-[#E94E1B] text-white font-semibold py-3
                               hover:bg-[#C73E11] active:bg-[#A6320D]
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
                <div className="h-px bg-[#E5E5E5] flex-1" />
                <span className="text-[#9A9A9A] text-xs">or continue with</span>
                <div className="h-px bg-[#E5E5E5] flex-1" />
              </motion.div>

              <motion.div {...fadeUp(0.5)} className="space-y-2.5">
                <Suspense fallback={null}>
                  <GoogleAuthButton disabled={loading || isLoading || demoLoading} />
                </Suspense>
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={demoLoading || isLoading}
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

              <motion.p {...fadeUp(0.56)} className="text-sm text-[#5B5B5B] pt-2">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#E94E1B] hover:text-[#C73E11] transition-colors underline-offset-2 hover:underline font-semibold">
                  Sign in
                </Link>
              </motion.p>

              <motion.p {...fadeUp(0.62)} className="text-[11px] text-[#9A9A9A] pt-4 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#0A0A0A]">Terms</Link>
                {', '}
                <Link href="/privacy" className="underline hover:text-[#0A0A0A]">Privacy Notice</Link>
                {', and '}
                <Link href="/risk" className="underline hover:text-[#0A0A0A]">Risk Disclosure</Link>.
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
