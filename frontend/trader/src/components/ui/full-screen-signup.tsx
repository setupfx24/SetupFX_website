'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { SwissCrestaWordmark } from '@/components/layout/SwissCrestaWordmark';

type Mode = 'login' | 'signup';

interface FullScreenSignupProps {
  /** 'signup' renders the create-account form, 'login' renders the sign-in
   *  form against the same chrome. Defaults to 'signup'. */
  mode?: Mode;
}

const COPY: Record<Mode, {
  hero: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  switchPrompt: string;
  switchLink: string;
  switchHref: string;
}> = {
  signup: {
    hero: 'A Swiss-precision trading platform for serious investors.',
    eyebrow: 'Welcome to SwissCresta',
    title: 'Create your account',
    subtitle: 'Trade FX, indices, metals and crypto with bank-grade execution.',
    cta: 'Create account',
    switchPrompt: 'Already have an account?',
    switchLink: 'Sign in',
    switchHref: '/auth/login',
  },
  login: {
    hero: 'A Swiss-precision trading platform for serious investors.',
    eyebrow: 'Welcome back',
    title: 'Sign in to SwissCresta',
    subtitle: 'Access your portfolio, positions and watchlists.',
    cta: 'Sign in',
    switchPrompt: "Don't have an account yet?",
    switchLink: 'Create one',
    switchHref: '/auth/register',
  },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const FullScreenSignup = ({ mode = 'signup' }: FullScreenSignupProps) => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[mode];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (mode === 'signup' && password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    } else if (mode === 'login' && password.length === 0) {
      setPasswordError('Enter your password.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    try {
      setSubmitting(true);
      if (mode === 'login') {
        await login(email.trim().toLowerCase(), password);
      } else {
        // Profile fields (first_name / last_name / phone) are collected
        // by the ProfileCompleteGate right after first sign-in. We pass
        // safe placeholders here so the API accepts the create call.
        await register({
          email: email.trim().toLowerCase(),
          password,
          first_name: 'New',
          last_name: 'Trader',
        });
        toast.success('Account created. Welcome to SwissCresta.');
      }
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA] p-4">
      <div className="w-full relative max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl ring-1 ring-black/5">
        {/* Decorative orange ball + blurred bands behind the left panel */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/60" />
          <div className="absolute -bottom-12 -left-8 w-60 h-60 bg-[#E94E1B] rounded-full opacity-90" />
          <div className="absolute -bottom-6 left-32 w-32 h-20 bg-white rounded-full opacity-90 blur-2xl" />
          <div className="absolute bottom-2 left-12 w-32 h-20 bg-white rounded-full opacity-70 blur-xl" />
          <div className="absolute inset-y-0 left-0 hidden md:flex backdrop-blur-2xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[40rem] w-16 bg-gradient-to-r from-transparent via-black to-white/20 opacity-30"
              />
            ))}
          </div>
        </div>

        {/* Left dark hero panel */}
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative overflow-hidden z-10 flex flex-col justify-between min-h-[20rem] md:min-h-[36rem]">
          <SwissCrestaWordmark
            href="/"
            className="flex items-center gap-2"
            textClassName="text-xl font-bold tracking-tight text-white"
          />
          <h1 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight relative z-10">
            {copy.hero}
          </h1>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white text-[#0A0A0A] relative z-20">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-wider text-[#E94E1B] font-semibold mb-3">
              {copy.eyebrow}
            </p>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">{copy.title}</h2>
            <p className="text-[#5B5B5B]">{copy.subtitle}</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-[#0A0A0A]">
                Email
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`text-sm w-full py-2.5 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E94E1B]/20 bg-white text-black transition-colors ${
                  emailError ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#E94E1B]'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm text-[#0A0A0A]">
                  {mode === 'signup' ? 'Create password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-[#5B5B5B] hover:text-[#E94E1B] transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                id="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
                className={`text-sm w-full py-2.5 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E94E1B]/20 bg-white text-black transition-colors ${
                  passwordError ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#E94E1B]'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E94E1B] hover:bg-[#C73E11] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Please wait…' : copy.cta}
            </button>

            <div className="text-center text-[#5B5B5B] text-sm">
              {copy.switchPrompt}{' '}
              <Link
                href={copy.switchHref}
                className="text-[#0A0A0A] font-medium underline underline-offset-2 hover:text-[#E94E1B]"
              >
                {copy.switchLink}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FullScreenSignup;
