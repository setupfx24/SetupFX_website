'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import AppNavbar from './AppNavbar';
import DashboardFooter from './DashboardFooter';

/**
 * DashboardShell — top-navbar layout for the logged-in app pages.
 *
 * The Vantage-inspired redesign replaces the previous sidebar +
 * AppHeader pair with a single sticky horizontal AppNavbar. Content
 * sits in a max-w-[1400px] centered wrapper directly beneath.
 */
export default function DashboardShell({
  children,
  className,
  mainClassName,
}: {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col bg-bg-base text-text-primary',
        className,
      )}
    >
      <AppNavbar />

      <main
        key={pathname}
        className={cn(
          'dashboard-main-scroll flex-1 page-fade-in',
          mainClassName,
        )}
      >
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {children}
        </div>
        <DashboardFooter />
      </main>

      <Link
        href="/support"
        className="fixed bottom-6 right-6 z-[75] w-12 h-12 rounded-full bg-[#E94E1B] hover:bg-[#C73E11] shadow-lg shadow-[#E94E1B]/20 flex items-center justify-center transition-colors"
        aria-label="Support"
      >
        <MessageSquare size={20} className="text-white" />
      </Link>
    </div>
  );
}
