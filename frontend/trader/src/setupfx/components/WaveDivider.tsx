'use client';

/* ─────────────────────────────────────────────────────────────────────
   WaveDivider — curvy SVG line dividers between sections.

   Inspired by the reference A-Space hero where soft wavy lines
   separate sections and tie space-tech narrative together. Pure SVG,
   no JS, no animation — these are decorative shapes that render in
   the GPU compositor with the rest of the page.

   Three variants:
   • `flow`     — single sweeping curve, brand-blue gradient.
   • `dunes`    — two stacked low-amplitude curves, lighter.
   • `current`  — three thin parallel curves, like ocean current.

   Each variant has a `tone` prop for the underlying band — choose to
   match the section it sits between. `tone="dark"` paints the wave
   stroke light + a dark band; `tone="light"` paints it with mid-tones
   that read on a white/light section.
   ───────────────────────────────────────────────────────────────────── */

type Variant = 'flow' | 'dunes' | 'current';
type Tone = 'dark' | 'light';

type Props = {
  variant?: Variant;
  tone?: Tone;
  flip?: boolean;
  className?: string;
};

const TONE_STROKE: Record<Tone, string> = {
  dark: '#4D95FF',
  light: '#1074FE',
};

export default function WaveDivider({
  variant = 'flow',
  tone = 'dark',
  flip = false,
  className,
}: Props) {
  const stroke = TONE_STROKE[tone];

  return (
    <div
      className={className}
      aria-hidden
      style={{
        position: 'relative',
        width: '100%',
        height: variant === 'current' ? 80 : 120,
        overflow: 'hidden',
        lineHeight: 0,
        transform: flip ? 'scaleY(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`wave-${variant}-${tone}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor={stroke} stopOpacity="0" />
            <stop offset="20%" stopColor={stroke} stopOpacity={tone === 'dark' ? 0.55 : 0.45} />
            <stop offset="50%" stopColor={stroke} stopOpacity={tone === 'dark' ? 0.85 : 0.7} />
            <stop offset="80%" stopColor={stroke} stopOpacity={tone === 'dark' ? 0.55 : 0.45} />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {variant === 'flow' && (
          <path
            d="M0,60 C160,10 360,110 600,55 C840,0 1080,100 1280,50 C1360,30 1410,40 1440,55"
            fill="none"
            stroke={`url(#wave-flow-${tone})`}
            strokeWidth="1.6"
          />
        )}

        {variant === 'dunes' && (
          <>
            <path
              d="M0,80 C200,30 460,110 720,75 C980,40 1240,110 1440,70"
              fill="none"
              stroke={`url(#wave-dunes-${tone})`}
              strokeWidth="1.4"
            />
            <path
              d="M0,100 C200,60 460,130 720,95 C980,60 1240,130 1440,90"
              fill="none"
              stroke={`url(#wave-dunes-${tone})`}
              strokeWidth="1"
              opacity="0.55"
            />
          </>
        )}

        {variant === 'current' && (
          <>
            <path
              d="M0,40 C320,0 720,80 1080,30 C1240,10 1360,30 1440,28"
              fill="none"
              stroke={`url(#wave-current-${tone})`}
              strokeWidth="1.3"
            />
            <path
              d="M0,55 C320,15 720,95 1080,45 C1240,25 1360,45 1440,42"
              fill="none"
              stroke={`url(#wave-current-${tone})`}
              strokeWidth="1.1"
              opacity="0.65"
            />
            <path
              d="M0,72 C320,32 720,112 1080,62 C1240,42 1360,62 1440,58"
              fill="none"
              stroke={`url(#wave-current-${tone})`}
              strokeWidth="0.9"
              opacity="0.4"
            />
          </>
        )}
      </svg>
    </div>
  );
}
