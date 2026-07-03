'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Trading', path: '/trading/overview' },
  { label: 'Copy Trading', path: '/platforms/copy-trading' },
  { label: 'Protocol',   path: '/protocol' },
  { label: 'About',      path: '/about' },
  { label: 'Contact',    path: '/contact' },
]

/* Two-mode palette. Layout passes `theme="light"` on the new
 * SetupFX-branded marketing pages (canvas #FFFFFF) and `theme="dark"`
 * on legacy dark sections (canvas #08090b). Keeps a single Navbar
 * component instead of swapping in/out two different chrome systems. */
const THEMES = {
  dark: {
    bgScrolled:  'rgba(8,9,11,0.85)',
    bgMobile:    'rgba(8,9,11,0.97)',
    border:      'var(--fx-line)',
    borderStrong:'var(--fx-line-strong)',
    text:        'var(--fx-text)',
    textMuted:   'var(--fx-text-2)',
    textTertiary:'var(--fx-text-3)',
    accent:      'var(--fx-gold-light)',
    accentSoft:  'var(--fx-gold-soft)',
    brandLeft:   '#FFFFFF',                    // "Swiss"
    brandRight:  '#1074FE',                    // "Cresta"
    dropdownBg:  'rgba(16,17,20,0.96)',
    iconBg:      'rgba(255,255,255,0.04)',
    hoverBg:     'rgba(255,255,255,0.04)',
    ctaGhostText:    '#F5F5F5',
    ctaGhostBorder:  'rgba(255,255,255,0.18)',
    ctaPrimaryBg:    '#1074FE',
    ctaPrimaryText:  '#FFFFFF',
  },
  light: {
    bgScrolled:  'rgba(255,255,255,0.92)',
    bgMobile:    'rgba(255,255,255,0.98)',
    border:      'var(--mkt-line)',
    borderStrong:'#D1D5DB',
    text:        'var(--mkt-ink-primary)',
    textMuted:   'var(--mkt-ink-secondary)',
    textTertiary:'var(--mkt-ink-tertiary)',
    accent:      '#2563EB',                    // blue accent for active state
    accentSoft:  'rgba(37,99,235,0.08)',
    brandLeft:   '#111827',                    // "Swiss" dark gray
    brandRight:  '#2563EB',                    // "Cresta" blue
    dropdownBg:  'rgba(255,255,255,0.98)',
    iconBg:      'rgba(0,0,0,0.04)',
    hoverBg:     'rgba(0,0,0,0.04)',
    ctaGhostText:    '#374151',
    ctaGhostBorder:  '#D1D5DB',
    ctaPrimaryBg:    '#2563EB',
    ctaPrimaryText:  '#FFFFFF',
  },
}

export default function Navbar({ theme = 'dark' }) {
  const t = THEMES[theme] || THEMES.dark
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileDropdown, setMobileDropdown] = useState(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsOpen(false); setMobileDropdown(null) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isActive = (path) => mounted && pathname === path
  const isDropdownActive = (dropdown) => mounted && dropdown?.some(d => pathname?.startsWith(d.path))

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      ref={menuRef}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled || isOpen ? t.bgScrolled : 'transparent',
        backdropFilter: scrolled || isOpen ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled || isOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled || isOpen ? `1px solid ${t.border}` : '1px solid transparent',
      }}
    >
      <div className="fx-container">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="SetupFX home">
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="w-7 h-7 md:w-8 md:h-8 shrink-0 transition-transform duration-300 group-hover:scale-[1.05]"
            >
              <rect width="32" height="32" rx="4" fill="#DC2626" />
              <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
              <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
            </svg>
            <span className="inline-flex items-baseline font-bold tracking-tight text-lg md:text-xl select-none">
              <span style={{ color: t.brandLeft }}>Swiss</span>
              <span style={{ color: t.brandRight }}>Cresta</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
                    style={{
                      color: isDropdownActive(item.dropdown) ? t.accent : t.textMuted,
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      style={{ transform: activeDropdown === item.label ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 w-52 p-1.5 rounded-2xl"
                        style={{
                          background: t.dropdownBg,
                          border: `1px solid ${t.borderStrong}`,
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          boxShadow: theme === 'light'
                            ? '0 20px 50px rgba(0,0,0,0.08)'
                            : '0 20px 50px rgba(0,0,0,0.6)',
                        }}
                      >
                        {item.dropdown.map((sub) => {
                          const active = isActive(sub.path)
                          return (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
                              style={{
                                color: active ? t.accent : t.textMuted,
                                background: active ? t.accentSoft : 'transparent',
                              }}
                              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = t.hoverBg }}
                              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                            >
                              {sub.name}
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className="px-2.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
                  style={{
                    color: isActive(item.path) ? t.accent : t.textMuted,
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center text-sm font-medium py-2 px-4 rounded-full transition-colors"
              style={{
                color: t.ctaGhostText,
                border: `1px solid ${t.ctaGhostBorder}`,
                background: 'transparent',
              }}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full transition-opacity hover:opacity-90"
              style={{
                background: t.ctaPrimaryBg,
                color: t.ctaPrimaryText,
              }}
            >
              Open Account
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              className="lg:hidden relative z-[60] w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{
                background: t.iconBg,
                border: `1px solid ${t.borderStrong}`,
                color: t.text,
              }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden"
            style={{
              background: t.bgMobile,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <div className="fx-container py-4 space-y-1 max-h-[calc(100dvh-72px)] overflow-y-auto">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                >
                  {item.dropdown ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors"
                        style={{
                          color: isDropdownActive(item.dropdown) ? t.accent : t.text,
                          background: mobileDropdown === item.label ? t.hoverBg : 'transparent',
                        }}
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className="transition-transform duration-200"
                          style={{
                            color: t.textTertiary,
                            transform: mobileDropdown === item.label ? 'rotate(180deg)' : 'none',
                          }}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {item.dropdown.map((sub) => {
                              const active = isActive(sub.path)
                              return (
                                <Link
                                  key={sub.path}
                                  href={sub.path}
                                  className="block pl-8 pr-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                  style={{
                                    color: active ? t.accent : t.textMuted,
                                    background: active ? t.accentSoft : 'transparent',
                                  }}
                                >
                                  {sub.name}
                                </Link>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.path}
                      className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        color: isActive(item.path) ? t.accent : t.text,
                        background: isActive(item.path) ? t.accentSoft : 'transparent',
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.25 }}
                className="pt-3 mt-2 border-t flex flex-col gap-2"
                style={{ borderColor: t.border }}
              >
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center text-sm font-medium py-3 rounded-full transition-colors"
                  style={{
                    color: t.ctaGhostText,
                    border: `1px solid ${t.ctaGhostBorder}`,
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-full transition-opacity hover:opacity-90"
                  style={{
                    background: t.ctaPrimaryBg,
                    color: t.ctaPrimaryText,
                  }}
                >
                  Open Live Account
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
