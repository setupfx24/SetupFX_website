'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Download } from 'lucide-react';

/* Android APK served from /public/downloads/. The Next.js static
   handler streams it with the right content-disposition when an
   `<a download>` link points to it, so a plain anchor is enough. */
const APK_HREF = '/downloads/setupfx-android.apk';
const APK_FILENAME = 'SetupFX-Android.apk';
import { NAV_ITEMS, BRAND, SIGNUP_HREF, type NavItem } from '../data';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function cn(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Dios-style fixed top bar (white/5 + backdrop-blur + border-b), with our
 * 11-item nav and dropdown support. Logo on left, links centered, Log In
 * + Open Account CTA on the right. Mobile: hamburger that slides down a
 * full-width panel.
 *
 * Desktop dropdowns are portaled to <body> so they aren't clipped by the
 * navbar's own overflow.
 */
function DesktopNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = pathname === item.href || item.children?.some((c) => c.href === pathname);

  useEffect(() => setMounted(true), []);

  useIsomorphicLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const measure = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setCoords({ top: r.bottom + 8, left: r.left + r.width / 2 });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 120); };

  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          className={cn(
            'text-[12px] font-medium transition whitespace-nowrap',
            active ? 'text-white' : 'text-white/60 hover:text-white',
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseEnter={() => { cancelClose(); setOpen(true); }}
        onMouseLeave={scheduleClose}
        onFocus={() => { cancelClose(); setOpen(true); }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-0.5 text-[12px] font-medium transition whitespace-nowrap',
          active ? 'text-white' : 'text-white/60 hover:text-white',
        )}
      >
        {item.label}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>

      {mounted && open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="setupfx-home fixed z-[200] min-w-[240px] rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            style={{ top: coords.top, left: coords.left, transform: 'translateX(-50%)' }}
          >
            {item.children!.map((c) => {
              const isActive = pathname === c.href;
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-lg px-3.5 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-brand-500/20 text-brand-300' : 'text-white/75 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>,
          document.body,
        )}
    </li>
  );
}

function MobileRow({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onClose}
          className="block rounded-md px-2 py-2 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
        >
          {item.label}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
      >
        {item.label}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="ml-3 mt-1 border-l border-white/10 pl-3">
          {item.children.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                onClick={onClose}
                className="block rounded-md px-2 py-1.5 text-[13px] font-medium text-white/65 hover:text-white"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Navbar() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);

  // Solid deep-navy navbar. The .setupfx-navbar-dark class lets the
  // sub-landing light-theme overrides keep this navbar's text TRUE white
  // (the global .text-white -> dark override would otherwise make
  // active links invisible on dark bg).
  return (
    <header
      className="setupfx-navbar-dark fixed inset-x-0 top-0 z-50 font-jakarta"
      style={{
        background: 'rgba(7, 12, 28, 0.94)',
        borderBottom: '1px solid rgba(16, 116, 254, 0.22)',
        boxShadow: '0 6px 24px -8px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-4 lg:px-5 xl:px-8" aria-label="Primary">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label={`${BRAND.name} home`}>
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            className="h-9 lg:h-9 xl:h-10 w-auto object-contain"
          />
        </Link>

        {/* Centered nav links (desktop ≥1024px). The list is flex-1 + min-w-0 so
            it yields space to the always-visible right-side CTAs — that keeps the
            "Open Account" button from being pushed off / clipped on tight widths.
            On very narrow desktops the links scroll horizontally (scrollbar hidden)
            instead of overflowing the CTAs. Tight gaps so 11 items + CTAs fit a laptop. */}
        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-2.5 overflow-x-auto lg:flex xl:gap-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <DesktopNavLink key={item.label} item={item} pathname={pathname} />
          ))}
        </ul>

        {/* Right CTAs (desktop) */}
        <div className="hidden items-center gap-2 xl:gap-2.5 lg:flex shrink-0">
          {/* Download APK — `download` attribute makes the browser save
              the file instead of trying to render it inline. */}
          {/* Desktop: compact icon + "APK" pill to free header width (full
              "Download APK" label stays in the mobile menu). `download` attr
              makes the browser save the file instead of rendering it inline. */}
          <a
            href={APK_HREF}
            download={APK_FILENAME}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur-sm transition hover:border-brand-500/60 hover:bg-brand-500/15 hover:text-white whitespace-nowrap"
            aria-label="Download SetupFX Android APK"
            title="Download Android APK"
          >
            <Download className="size-3.5" aria-hidden />
            APK
          </a>
          <Link
            href="/auth/login"
            className="text-[13px] font-semibold text-white/70 transition hover:text-white whitespace-nowrap"
          >
            Log In
          </Link>
          <Link
            href={SIGNUP_HREF}
            className="rounded-full border border-brand-500/60 bg-brand-500/85 px-3.5 py-1.5 text-[12px] xl:text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,116,254,0.3)] backdrop-blur-sm transition hover:bg-brand-500 hover:shadow-[0_0_28px_rgba(16,116,254,0.5)] whitespace-nowrap"
          >
            Open Account
          </Link>
        </div>

        {/* Mobile hamburger (<1024px) */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md text-white lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile slide-down panel (<1024px) */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/10 bg-ink-900/95 backdrop-blur-md transition-[max-height] duration-300 lg:hidden',
          open ? 'max-h-[80vh] overflow-y-auto' : 'max-h-0',
        )}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {NAV_ITEMS.map((item) => (
            <MobileRow key={item.label} item={item} onClose={() => setOpen(false)} />
          ))}
          <li className="mt-3 px-2">
            <a
              href={APK_HREF}
              download={APK_FILENAME}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white"
              aria-label="Download SetupFX Android APK"
            >
              <Download className="size-4" aria-hidden />
              Download APK
            </a>
          </li>
          <li className="mt-2 flex gap-2 px-2">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full border border-white/30 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Log In
            </Link>
            <Link
              href={SIGNUP_HREF}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full bg-brand-500 px-4 py-2 text-center text-sm font-bold text-white"
            >
              Open Account
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
