'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Reusable two-column marketing-content template.
 *
 * Used by ~19 service / marketing / industry / simple-solution pages that
 * all share the same shape: title + subtitle, then a left-column heading +
 * paragraph + feature bullets, plus a right-column heading + 4 detail
 * cards. Source: ported from D:\setupfx updated\website\website pages.
 *
 * The HomePage's Navbar + Footer come from the (landing)/layout.tsx
 * wrapper — this template only renders the page body.
 */
export type MarketingDetail = {
  title: string;
  description: string;
};

export type MarketingTemplateProps = {
  /** Top eyebrow chip (optional) e.g. "Services". */
  eyebrow?: string;
  /** Big H1. */
  title: string;
  /** Subhead under H1. */
  subtitle: string;
  /** Left-column section heading (e.g. "End-to-End Software Solutions"). */
  leftHeading: string;
  /** Left-column paragraph under the heading. */
  leftBody: string;
  /** Bullet list under the left paragraph. */
  features: string[];
  /** Right-column section heading (e.g. "Our Tech Stack"). */
  rightHeading: string;
  /**
   * Right-column items. Either a list of plain strings (tech-stack style),
   * or an array of {title, description} for the richer 2x2 detail grid.
   */
  rightItems: string[] | MarketingDetail[];
  /** Primary CTA at the bottom. Defaults to a contact button. */
  ctaPrimary?: { label: string; href: string };
  /** Secondary CTA (optional). */
  ctaSecondary?: { label: string; href: string };
};

function isDetailList(items: MarketingTemplateProps['rightItems']): items is MarketingDetail[] {
  return items.length > 0 && typeof items[0] !== 'string';
}

export function MarketingTemplate(props: MarketingTemplateProps) {
  const {
    eyebrow,
    title,
    subtitle,
    leftHeading,
    leftBody,
    features,
    rightHeading,
    rightItems,
    ctaPrimary = { label: 'Get Started', href: '/company/contact' },
    ctaSecondary,
  } = props;

  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* ── Page header ─────────────────────────────────── */}
        <div className="text-center mb-16">
          {eyebrow && (
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── Two-column main content ─────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: heading + body + bullet features */}
          <section className="liquid-glass rounded-3xl p-8 lg:p-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {leftHeading}
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-7">{leftBody}</p>
            <ul className="space-y-3.5">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/85 leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right: heading + detail grid (or plain pill list) */}
          <section className="liquid-glass rounded-3xl p-8 lg:p-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-7">
              {rightHeading}
            </h2>
            {isDetailList(rightItems) ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {rightItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-foreground/8 bg-foreground/3 p-5 hover:border-primary/35 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-foreground/65 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {rightItems.map((label) => (
                  <span
                    key={label}
                    className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground/90"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Bottom CTAs ─────────────────────────────────── */}
        <div className="text-center mt-16 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ctaPrimary.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            {ctaPrimary.label}
          </Link>
          {ctaSecondary && (
            <Link
              href={ctaSecondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/5 px-6 py-3 text-sm font-semibold text-foreground/85 hover:bg-foreground/10 transition-colors"
            >
              {ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
