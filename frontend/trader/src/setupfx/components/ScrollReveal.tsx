'use client';

import { useEffect, useRef, ReactNode, HTMLAttributes } from 'react';

/* ─────────────────────────────────────────────────────────────────────
   ScrollReveal — opacity + translateY reveal on scroll-into-view.

   SCROLL-SAFE GUARANTEES:
   • No wheel/scroll event listeners (would block native scroll).
   • No preventDefault anywhere.
   • IntersectionObserver only — fires when element enters viewport,
     then unobserves itself. One-shot per element, zero cost forever
     after reveal.
   • Honors prefers-reduced-motion → no animation, element visible from
     mount so screen-reader users don't see jarring jumps.
   • Cleans up will-change after animation finishes (frees GPU memory).

   Usage:
     <ScrollReveal>           <- block element, fade + slide up
       <YourContent />
     </ScrollReveal>

     <ScrollReveal as="span" delay={120}>
       Inline reveal with stagger.
     </ScrollReveal>
   ───────────────────────────────────────────────────────────────────── */

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** ms delay before fading in. Use for stagger inside a row. */
  delay?: number;
  /** Vertical offset distance for the slide. Default 24px. */
  y?: number;
};

export default function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  className,
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Reveal immediately, no animation.
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0, 0, 0)';
          }, delay);
          // Drop will-change after the transition completes.
          window.setTimeout(() => {
            el.style.willChange = 'auto';
          }, delay + 800);
          io.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: `translate3d(0, ${y}px, 0)`,
        transition:
          'opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        willChange: 'opacity, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
