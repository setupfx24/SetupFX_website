/**
 * Marketing-site fonts — set up via `next/font/google` so Next.js
 * self-hosts the files (no runtime fetch to fonts.gstatic.com), subsets
 * to Latin only, and exposes them as CSS variables the rest of the app
 * binds to via Tailwind.
 *
 * Each font exports a `variable` token; we apply all three to the
 * <html> element in `src/app/layout.tsx` so any descendant component
 * (marketing landing, trader app chrome, etc.) can pick them up.
 *
 * Weights match the design-system type scale:
 *   - Fraunces        300 / 400 / 600  — display / serif headlines
 *   - Inter Tight     400 / 500 / 600  — body + UI text
 *   - JetBrains Mono  400 / 500        — prices, spreads, tickers
 *
 * Trader app's existing Inter (loaded via CDN @import in globals.css)
 * is unchanged — the marketing fonts ride alongside it. When the
 * trader-app fonts get migrated to next/font, drop the CDN line and
 * everything else still works.
 */
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google';

// Fraunces — display serif. Explicit weights, NO `axes` (next/font
// only allows the `axes` array when `weight` is omitted or set to
// 'variable'; mixing the two errors at build time:
//   "Axes can only be defined for variable fonts when the weight
//    property is nonexistent or set to `variable`.")
//
// If you ever want Fraunces' optical-size axis (opsz) back, switch
// the whole config to variable mode:
//   weight: undefined → loads the variable font file
//   then add axes: ['opsz']
// Tradeoff: variable file is ~250KB vs ~80KB for our 3 fixed weights.
export const fontDisplay = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal'],
  variable: '--font-display',
  display: 'swap',
});

export const fontBody = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal'],
  variable: '--font-body',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal'],
  variable: '--font-mono',
  display: 'swap',
});

/** Joined `className` to drop straight onto <html>. */
export const fontVariableClass = [
  fontDisplay.variable,
  fontBody.variable,
  fontMono.variable,
].join(' ');
