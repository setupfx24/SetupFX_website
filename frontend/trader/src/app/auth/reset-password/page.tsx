'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Invalid reset link');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ message: string }>('/auth/reset-password', {
        token: token.trim(),
        new_password: password,
      });
      toast.success(res.message || 'Password reset');
      router.replace('/auth/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen relative overflow-hidden bg-bg-primary flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* Inline Swiss-flag brand mark — no PNG dependency.
              Same mark as the navbar / hero so the user knows they
              haven't been redirected to a different brand mid-reset. */}
          <svg viewBox="0 0 32 32" aria-hidden="true" className="w-14 h-14">
            <rect width="32" height="32" rx="4" fill="#DC2626" />
            <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
            <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
          </svg>
          <span className="inline-flex items-baseline font-bold italic tracking-tight text-lg select-none">
            <span className="text-text-primary">Swiss</span>
            <span className="text-[#E94E1B]">Cresta</span>
          </span>
        </div>
        <div className="glass-panel rounded-3xl p-8 noise-texture overflow-hidden">
          <h1 className="text-xl font-bold text-text-primary mb-2">Reset password</h1>
          <p className="text-xs text-text-tertiary mb-6">Choose a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Update password
            </Button>
          </form>
          <p className="text-center mt-6">
            <Link href="/auth/login" className="text-xxs text-buy hover:text-buy-light transition-fast">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-tertiary text-sm">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
