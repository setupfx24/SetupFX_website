import Link from 'next/link';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { BRAND, COPYRIGHT, RISK_DISCLAIMER, FOOTER_QUICK_LINKS, FOOTER_SERVICES, FOOTER_LINKS } from '../data';

const SOLUTIONS_LINKS = [
  { label: 'White-Label',          href: '/solutions/white-label' },
  { label: 'Grey-Label',           href: '/solutions/grey-label' },
  { label: 'Liquidity Provider',   href: '/liquidity' },
  { label: 'IB Management',        href: '/solutions/ib-management' },
  { label: 'TradingView Advanced', href: '/solutions/trading-view-advance' },
];

const COMPANY_LINKS = [
  { label: 'About Us',     href: '/company/about' },
  { label: 'Contact',      href: '/company/contact' },
  { label: 'Pricing',      href: '/pricing' },
  { label: 'Case Studies', href: '/resources/case-studies' },
  { label: 'Blog',         href: '/resources/blog' },
  { label: 'FAQs',         href: '/resources/faqs' },
];

export function Footer() {
  /* Footer is always dark across home and sub-landing pages — keep
     identity even when the section above is white/light. */
  return (
    <footer
      className="setupfx-footer-dark border-t font-jakarta"
      style={{
        background: '#070C1C',
        borderColor: 'rgba(16, 116, 254, 0.20)',
        color: '#E2E8F0',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        {/* ── Top grid: brand + 4 link columns ────────────── */}
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          {/* Brand + description + contact */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-5" aria-label={`${BRAND.name} home`}>
              <img src={BRAND.logo} alt={BRAND.name} className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-sm text-foreground/65 leading-relaxed mb-6 max-w-xs">
              A complete trading and digital growth ecosystem — Forex access, capital funding, IB partnership, copy trading, and end-to-end software &amp; marketing services, all under one trusted brand.
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              <li className="flex items-start gap-2.5">
                <Mail className="size-4 text-primary shrink-0 mt-0.5" />
                <a href="mailto:setupfx24@gmail.com" className="hover:text-primary transition-colors">
                  setupfx24@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <a href="https://wa.me/19082280305" className="hover:text-primary transition-colors">
                  WhatsApp: +1 (908) 228-0305
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Office 9364hn 3 Fitzroy Place, Sauchiehall Street, Glasgow City Centre, G3 7RH, United Kingdom</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/55 mb-4">Trading</h3>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              {FOOTER_QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/55 mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              {FOOTER_SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/55 mb-4">Solutions</h3>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              {SOLUTIONS_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/55 mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Risk + regulatory text ──────────────────────── */}
        <div className="border-t border-foreground/10 pt-7 mb-7 space-y-3">
          <p className="text-xs text-foreground/55 leading-relaxed">
            <span className="font-semibold text-foreground/70">Risk Warning:</span> {RISK_DISCLAIMER}
          </p>
          <p className="text-xs text-foreground/55 leading-relaxed">
            The information on this website is provided for general informational purposes only and does not take into account your investment objectives or financial situation. Access to this website is at your own initiative. SetupFX makes no representations or warranties as to the accuracy or completeness of the content and accepts no liability for any reliance placed on it.
          </p>
          <p className="text-xs text-foreground/55 leading-relaxed">
            SetupFX Softtech (OPC) Private Limited is a global software development, digital marketing, and brokerage technology provider.
          </p>
        </div>

        {/* ── Bottom row: copyright + legal links ─────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-foreground/10">
          <p className="text-xs text-foreground/55">{COPYRIGHT}</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground/55">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
