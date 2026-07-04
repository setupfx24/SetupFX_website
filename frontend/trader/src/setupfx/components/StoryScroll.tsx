'use client';

import React from 'react';

/* GSAP pin+scrub removed — was the dominant source of desktop scroll
 * jank (recomputed layout for every wheel tick, dropped frames on
 * integrated GPUs). Sections now stack normally and rely on the
 * browser's native scroll. Any reveal animation lives in CSS — no
 * scroll listener, no IO, no layout thrash. */

function cx(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(' ');
}

/* ─────────────────────────────────────────────────────────────────────
   Story-scroll FlowArt — ported verbatim from dioswebsite.new.
   Each FlowSection enters with a 30° → 0° rotation tied to scroll
   (scrub) and pins at the viewport bottom until the next section
   pushes it up. Respects prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────────── */

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'aria-label'?: string;
}

export const FlowSection: React.FC<FlowSectionProps> = ({
  className,
  style = {},
  children,
  'aria-label': ariaLabel,
}) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    className={cx('relative min-h-screen w-full overflow-hidden font-jakarta', className)}
  >
    <div
      data-flow-inner
      className={cx(
        'flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]',
      )}
      style={{ ...style }}
    >
      {children}
    </div>
  </section>
);

export interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const FlowArt: React.FC<FlowArtProps> = ({
  children,
  className,
  'aria-label': ariaLabel = 'Story scroll',
}) => {
  return (
    <main
      aria-label={ariaLabel}
      className={cx('w-full overflow-x-hidden', className)}
    >
      {children}
    </main>
  );
};

export default FlowArt;
