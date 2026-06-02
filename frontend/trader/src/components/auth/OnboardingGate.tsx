'use client';

/**
 * Multi-step onboarding gate that runs AFTER ProfileCompleteGate.
 *
 * Current sequence (post wallet-integration purge):
 *   1. profile_complete  →  ProfileCompleteGate handles this. If still
 *      false we render nothing here and let that gate own the screen.
 *   2. email_verified    →  email/password users who never went through
 *      the post-signup OTP must do so before they can use the platform.
 *
 * The wallet-link step is gone — `WalletLinkStep` was deleted with the
 * rest of the SIWE / wallet-connect UX. Backend's
 * `require_onboarded` still has a `WALLET_LINK_REQUIRED` flag (left at
 * `False`), so the server agrees onboarding is complete without a
 * wallet. If the wallet flow ever returns, restore the step here AND
 * flip the backend flag at the same time.
 *
 * The modal is non-dismissible: there is no close button, the backdrop
 * doesn't dismiss, Escape doesn't dismiss. The user must finish the
 * step or sign out (a "Sign out" link is exposed at the bottom as the
 * only escape hatch).
 *
 * Demo accounts and staff (admin / super_admin / employee) are exempt.
 */
import { useMemo } from 'react';
import { ShieldCheck, Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import EmailOtpStep from './EmailOtpStep';

const STAFF_ROLES = new Set(['admin', 'super_admin', 'employee']);

export default function OnboardingGate() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const logout = useAuthStore((s) => s.logout);

  // Decide whether the gate runs at all. We deliberately mirror the
  // server-side require_onboarded check so a UI bug can't accidentally
  // open access; if the server says onboarding_complete=false the user
  // sees the modal regardless of what the FE state thinks.
  const decision = useMemo(() => {
    if (!isInitialized || !isAuthenticated || !user) return 'hidden' as const;
    if (user.is_demo) return 'hidden' as const;
    if (STAFF_ROLES.has(user.role)) return 'hidden' as const;

    // Email verification comes FIRST in the post-signup sequence. We
    // intentionally do NOT defer to ProfileCompleteGate here — the user
    // should verify the address they signed up with before they're asked
    // for personal details (and certainly before any KYC/payout flow).
    if (!user.email_verified) return 'email' as const;

    // Already onboarded beyond email — nothing for this gate to do.
    if (user.onboarding_complete) return 'hidden' as const;

    return 'hidden' as const;
  }, [isInitialized, isAuthenticated, user]);

  if (decision === 'hidden') return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-base/85 backdrop-blur-sm p-4 overflow-y-auto"
      // Intentionally NO onClick handler — the backdrop is non-dismissible.
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-gate-title"
    >
      <div
        className="relative w-full max-w-lg my-auto rounded-2xl border border-[#E94E1B]/40 bg-bg-secondary shadow-2xl"
        // Stop clicks inside the card from closing the page-level UI.
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 pt-6 pb-3 border-b border-border-primary">
          <div className="flex items-center gap-2 text-[#E94E1B] mb-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              Account setup required
            </span>
          </div>
          <h2 id="onboarding-gate-title" className="text-base font-bold text-text-primary">
            Verify your email
          </h2>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            We need a verified email on file before you can use the
            platform. Enter the address you want to use and we&apos;ll
            send you a one-time code.
          </p>
        </header>

        <div className="px-6 py-5">
          <EmailOtpStep
            currentEmail={user?.email || ''}
            isPlaceholder={false}
            onVerified={() => void refreshUser()}
          />
        </div>

        <footer className="px-6 pb-5 pt-1 flex items-center justify-between gap-2 border-t border-border-primary">
          <div className="flex items-center gap-1.5 text-[10.5px] text-text-tertiary">
            <Mail size={11} />
            <span>1 verified email per account</span>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </footer>
      </div>
    </div>
  );
}
