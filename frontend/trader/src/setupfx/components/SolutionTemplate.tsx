'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Richer template used by the five flagship solution pages
 * (white-label, grey-label, advance-order-exchange, trading-view-advance,
 * ib-admin) — each has a hero with badge + headline + dual CTAs, a feature
 * card grid, a benefits checklist, and a bottom CTA banner. Some also
 * include a 2-column comparison table.
 */

export type SolutionFeature = {
  title: string;
  description: string;
};

export type SolutionTemplateProps = {
  /** Hero pill above the headline. */
  badge: string;
  /** Big H1. */
  headline: string;
  /** Lead paragraph under H1. */
  subheadline: string;
  /** Long-form intro paragraph rendered below the hero (optional). */
  description?: string;
  /** Hero CTAs. Primary required. */
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };

  /** Feature-card grid heading + items. */
  featuresHeading?: string;
  featuresSubheading?: string;
  features?: SolutionFeature[];

  /** Optional process steps (e.g. how-it-works numbered list). */
  processHeading?: string;
  processSubheading?: string;
  processSteps?: SolutionFeature[];

  /** Optional comparison table (e.g. Grey vs White Label). */
  comparison?: {
    heading: string;
    subheading?: string;
    columns: [string, string];   // ["Grey Label", "White Label"]
    rows: Array<{ label: string; left: string; right: string }>;
  };

  /** Benefits / checklist section. */
  benefitsHeading?: string;
  benefitsSubheading?: string;
  benefits?: string[];

  /** Bottom CTA banner. */
  bottomCta: { heading: string; subheading: string; button: { label: string; href: string } };
};

export function SolutionTemplate(props: SolutionTemplateProps) {
  const {
    badge,
    headline,
    subheadline,
    description,
    ctaPrimary,
    ctaSecondary,
    featuresHeading,
    featuresSubheading,
    features,
    processHeading,
    processSubheading,
    processSteps,
    comparison,
    benefitsHeading,
    benefitsSubheading,
    benefits,
    bottomCta,
  } = props;

  return (
    <div className="setupfx-home min-h-screen pt-32 pb-24 px-6">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl text-center mb-20">
        <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-primary mb-6">
          {badge}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
          {headline}
        </h1>
        <p className="text-base sm:text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed mb-8">
          {subheadline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ctaPrimary.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            {ctaPrimary.label}
            <ArrowRight className="size-4" />
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
        {description && (
          <p className="text-foreground/70 leading-relaxed max-w-3xl mx-auto mt-10 text-left">
            {description}
          </p>
        )}
      </section>

      {/* ── FEATURE CARDS ──────────────────────────────────── */}
      {features && features.length > 0 && (
        <section className="mx-auto max-w-6xl mb-20">
          {featuresHeading && (
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {featuresHeading}
              </h2>
              {featuresSubheading && (
                <p className="text-foreground/65 max-w-2xl mx-auto">{featuresSubheading}</p>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="liquid-glass rounded-2xl p-6 hover:border-primary/35 transition-colors"
              >
                <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PROCESS STEPS ──────────────────────────────────── */}
      {processSteps && processSteps.length > 0 && (
        <section className="mx-auto max-w-6xl mb-20">
          {processHeading && (
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {processHeading}
              </h2>
              {processSubheading && (
                <p className="text-foreground/65 max-w-2xl mx-auto">{processSubheading}</p>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((s, i) => (
              <div key={s.title} className="liquid-glass rounded-2xl p-6 relative">
                <span className="block text-3xl font-display font-bold text-primary/70 mb-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── COMPARISON TABLE ───────────────────────────────── */}
      {comparison && (
        <section className="mx-auto max-w-4xl mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {comparison.heading}
            </h2>
            {comparison.subheading && (
              <p className="text-foreground/65 max-w-2xl mx-auto">{comparison.subheading}</p>
            )}
          </div>
          <div className="liquid-glass rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-foreground/5">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-foreground/70"></th>
                  <th className="px-5 py-4 text-sm font-semibold text-foreground text-center">{comparison.columns[0]}</th>
                  <th className="px-5 py-4 text-sm font-semibold text-primary text-center">{comparison.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? 'bg-foreground/2' : ''}
                  >
                    <td className="px-5 py-3.5 text-sm text-foreground/85 font-medium">{row.label}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground/70 text-center">{row.left}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground/90 text-center">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── BENEFITS ───────────────────────────────────────── */}
      {benefits && benefits.length > 0 && (
        <section className="mx-auto max-w-5xl mb-20">
          {benefitsHeading && (
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {benefitsHeading}
              </h2>
              {benefitsSubheading && (
                <p className="text-foreground/65 max-w-2xl mx-auto">{benefitsSubheading}</p>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3.5">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 liquid-glass rounded-xl p-4">
                <Check className="size-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/85 text-sm leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ─────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl">
        <div className="liquid-glass-strong rounded-3xl p-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {bottomCta.heading}
          </h2>
          <p className="text-foreground/70 mb-6">{bottomCta.subheading}</p>
          <Link
            href={bottomCta.button.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
          >
            {bottomCta.button.label}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
