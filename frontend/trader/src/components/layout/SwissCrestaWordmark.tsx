import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href?: string;
  className?: string;
  /** Applied to the wordmark text (e.g. responsive sizes). */
  textClassName?: string;
  /** Default: sidebar / header. Rail: tiny terminal left bar. */
  variant?: 'default' | 'rail';
  /** Hide the Swiss-flag mark and render the wordmark only. Useful in
   *  contexts where the mark would clash (small badge embeds). */
  hideFlag?: boolean;
};

/**
 * Swiss-flag square mark. Public-domain national symbol, not a logo
 * trademark — safe to use. Rendered inline-SVG so it scales crisply on
 * any DPR and recolours via `currentColor` would be trivial to add
 * later (today both colours are baked because the flag is iconic and
 * shouldn't drift). 4px corner-radius softens the edge into the
 * surrounding text.
 */
function SwissFlagMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect width="32" height="32" rx="4" fill="#DC2626" />
      {/* White cross: vertical bar + horizontal bar, sized to the 5/16
          Swiss flag spec (with a small inset so the cross doesn't kiss
          the rounded corners). */}
      <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
      <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
    </svg>
  );
}

/**
 * Text wordmark for dashboard chrome. Pure typography next to the
 * Swiss-flag mark — no raster dependency — so the brand renders
 * identically across DPRs and any background.
 *
 * Visual split: "Swiss" in primary text colour, "Cresta" in the brand
 * indigo accent. Swap the two `<span>` halves to retheme without
 * touching any call-site. Set `hideFlag` if the surrounding chrome
 * already shows its own brand mark.
 */
export function SwissCrestaWordmark({
  href = '/dashboard',
  className,
  textClassName,
  variant = 'default',
  hideFlag = false,
}: Props) {
  if (variant === 'rail') {
    // Terminal-left-rail variant — only ~36px wide. The flag alone is
    // the most legible mark at this size; the "S" + "C" letter
    // fallback shows when the operator explicitly disables the flag.
    return (
      <Link
        href={href}
        title="Trading home"
        className={cn(
          'flex items-center justify-center rounded-md hover:bg-bg-hover w-9 h-9 transition-colors',
          'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]',
          className,
        )}
      >
        {hideFlag ? (
          <span className="inline-flex items-baseline font-bold tracking-tight text-base select-none">
            <span className="text-text-primary">S</span>
            <span className="text-[#6366F1]">C</span>
          </span>
        ) : (
          <SwissFlagMark className="w-6 h-6" />
        )}
      </Link>
    );
  }

  const mark = (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      {!hideFlag && (
        <SwissFlagMark className="w-7 h-7 sm:w-8 sm:h-8" />
      )}
      <span
        className={cn(
          'inline-flex items-baseline font-bold tracking-tight',
          'text-xl sm:text-2xl drop-shadow-[0_0_24px_rgba(99,102,241,0.18)]',
          textClassName,
        )}
      >
        <span className="text-text-primary">Swiss</span>
        <span className="text-[#6366F1]">Cresta</span>
      </span>
    </span>
  );

  return (
    <Link
      href={href}
      className={cn(
        'min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]/60 focus-visible:rounded-md',
        className,
      )}
    >
      {mark}
    </Link>
  );
}
