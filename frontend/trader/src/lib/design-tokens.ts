/**
 * Marketing design tokens — typed TS exports.
 *
 * These are the SAME hex values defined as CSS variables in
 * `src/styles/marketing.css`. They're duplicated here in TS because:
 *
 *   1. Inline SVG attributes (`fill`, `stroke`) can't reference CSS
 *      variables in a static React/JSX context — `fill="var(--x)"`
 *      works on light DOM elements but not when an SVG is serialised
 *      into a data URI (e.g. the favicon, or a generated chart that
 *      gets cached as a string).
 *
 *   2. Framer Motion variants need raw colours when interpolating
 *      between two states (`animate={{ backgroundColor: TOKENS.deep }}`).
 *      CSS-var strings inside motion values silently break the tween.
 *
 *   3. Charting code (the hand-drawn OHLC SVG in the hero) needs to
 *      pick `positive` / `negative` per candle programmatically.
 *
 * CRITICAL: keep these in sync with `marketing.css`. If marketing
 * ever re-tints the palette, change BOTH files. We don't auto-generate
 * one from the other because the CSS file is the source of truth at
 * runtime (the browser reads CSS vars on `[data-mkt]`) while the TS
 * file is the source of truth at build time for SVG fills. A small
 * snapshot test in CI could verify the two match — TODO.
 */

/** Marketing palette — hex values matching `--mkt-*` CSS vars. */
export const mktColors = {
  // ── Surfaces ───────────────────────────────────────────────
  bgCanvas:   '#FFFFFF',
  bgSurface:  '#FFFFFF',
  bgDeep:     '#0A0A0A',
  bgDeep2:    '#1A1A1A',

  // ── Ink ────────────────────────────────────────────────────
  inkPrimary:   '#0A0A0A',
  inkSecondary: '#5B5B5B',
  inkTertiary:  '#9A9A9A',
  inkInverse:   '#FFFFFF',

  // ── Hairlines ──────────────────────────────────────────────
  line:     '#E5E5E5',
  lineDark: '#0A0A0A',

  // ── Accent + signal ────────────────────────────────────────
  accent:    '#1074FE',  // Vantage orange — primary CTA/brand accent
  positive:  '#10B981',  // up-moves on quote tables
  negative:  '#DC2626',  // down-moves on quote tables
} as const;

/** Typography scale (in px) — matches the brief's responsive type
 *  scale. The CSS variables in marketing.css use `clamp()` so these
 *  values are the rendered min/max bounds, not the literal output. */
export const mktType = {
  h1: { min: 40, max: 72, weight: 400, leading: 1.02, tracking: '-0.03em' },
  h2: { min: 32, max: 52, weight: 400, leading: 1.05, tracking: '-0.025em' },
  h3: { min: 22, max: 28, weight: 500, leading: 1.2,  tracking: '-0.015em' },
  bodyLg: { size: 17, leading: 1.55 },
  body:   { size: 15, leading: 1.6 },
  caption: { size: 12, leading: 1.4, tracking: '0.08em', upperCase: true },
} as const;

/** Spacing rhythm. Section vertical padding follows mobile/desktop
 *  split per brief; container is fixed-width 1280. */
export const mktSpacing = {
  base: 4,                      // 4px grid
  sectionYMobile: 64,
  sectionYDesktop: 96,
  containerMax: 1280,
  gutter: 24,
} as const;

/** Animation durations / easings — keep ALL motion in the marketing
 *  scope through these constants so the brief's "subtle only" rule
 *  is enforceable. Anything that imports from here is auditable;
 *  inline `transition={{ duration: ... }}` calls are not.
 *
 *  Per brief:
 *   - Section entry: opacity 0→1, y: 12→0, duration 0.5s easeOut,
 *     stagger 0.06s.
 *   - Hover: 150ms ease.
 *   - No springs.  No parallax.  No typewriter.  No bounce. */
export const mktMotion = {
  ease: 'easeOut' as const,
  durationEnter: 0.5,
  durationHover: 0.15,
  stagger: 0.06,
  enterY: 12,
} as const;

/** Type helper — narrow the colour token names so callers get
 *  autocomplete + a compile error on typos. */
export type MktColorToken = keyof typeof mktColors;

/**
 * Convenience: resolve a colour token to a hex string.
 *
 *   color(token) ⇒ '#0B1B33'
 *
 * Equivalent to `mktColors[token]` but reads cleaner inside JSX
 * (`fill={color('accent')}`) and survives a future palette refactor
 * if we ever swap hex for HSL.
 */
export function color(token: MktColorToken): string {
  return mktColors[token];
}
