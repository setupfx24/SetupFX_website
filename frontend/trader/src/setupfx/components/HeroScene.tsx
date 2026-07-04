'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import '../hero-scene.css';

/* 3D Earth (vanilla three.js, no R3F).
   • ssr:false because three.js touches window on import.
   • Lazy-loaded so the bundle hit only happens on desktop, post-paint.
   • Renders only when desktop + no-reduced-motion (decision in
     HeroScene below); mobile falls back to the CSS planet. */
const EarthScene3D = dynamic(() => import('./EarthScene3D'), {
  ssr: false,
  loading: () => null,
});

/* ─────────────────────────────────────────────────────────────────────
   HeroScene — dark cinematic hero (theme: white+blue+black).
   CSS-only background: 4 layered radial-gradient stars + 2 drifting
   nebula clouds + planet-horizon hint. No fragment shader, no rAF,
   no canvas. Brand-blue accents throughout (#1074FE → #4D95FF gradient).

   Mobile: smaller stars + slower drift.
   Reduced motion: animations frozen, layout intact.
   ───────────────────────────────────────────────────────────────────── */

export default function HeroScene() {
  /* Decide once on mount whether to spin up the real 3D Earth.
     Reduced-motion users always get the CSS fallback. Everyone else —
     phone + tablet + desktop — gets the realistic textured Earth so
     the visual identity stays consistent across devices. The Three.js
     scene auto-pauses off-screen and uses a low-power WebGL context
     so the battery / GPU cost on phones stays modest. */
  const [show3D, setShow3D] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setShow3D(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050B1F] hero-scene-root font-jakarta">
      {/* Background layers — all pointer-events:none so scroll passes through */}
      <div className="absolute inset-0 hero-nebula-a pointer-events-none" aria-hidden />
      <div className="absolute inset-0 hero-nebula-b pointer-events-none" aria-hidden />
      <div className="absolute inset-0 hero-stars pointer-events-none" aria-hidden />
      <div className="absolute inset-0 hero-stars-twinkle pointer-events-none" aria-hidden />

      {/* Hero centerpiece: real 3D Earth (desktop) OR CSS fallback. */}
      {show3D ? (
        <div className="hero-earth-3d-wrap" aria-hidden>
          <EarthScene3D />
        </div>
      ) : (
        <div className="hero-planet-wrap pointer-events-none" aria-hidden>
          <div className="hero-planet-orbit-outer" />
          <div className="hero-planet-orbit-inner" />
          <div className="hero-planet-atmosphere" />
          <div className="hero-planet-body">
            <div className="hero-planet-surface" />
            <div className="hero-planet-clouds" />
            <div className="hero-planet-terminator" />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-[40vh] hero-horizon pointer-events-none" aria-hidden />
      <div className="absolute inset-0 hero-vignette pointer-events-none" aria-hidden />

      {/* Content overlay — LEFT-aligned on desktop to balance the
          3D Earth which sits on the right. Mobile (<1024px) collapses
          to centered since the Earth is hidden there anyway.
          pt-20/lg:pt-24 reserves space for the fixed h-16 (64px) navbar so the
          trust pill clears the header and stays clearly visible below it. */}
      <div className="relative z-10 h-full flex flex-col items-center lg:items-start justify-center pt-20 lg:pt-24 px-6 lg:px-16 xl:px-24 text-white max-w-[1600px] mx-auto w-full text-center lg:text-left">
        {/* Trust pill */}
        <div className="mb-8 hero-fade-in">
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[12px] backdrop-blur-md"
            style={{
              background: 'rgba(16, 116, 254, 0.08)',
              border: '1px solid rgba(77, 149, 255, 0.35)',
            }}
          >
            <span className="relative inline-flex w-2 h-2">
              <span
                className="absolute inset-0 rounded-full opacity-75"
                style={{
                  background: '#4D95FF',
                  animation: 'ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                className="relative inline-block w-2 h-2 rounded-full"
                style={{
                  background: '#4D95FF',
                  boxShadow: '0 0 8px rgba(77, 149, 255, 0.95)',
                }}
              />
            </span>
            <span className="font-medium tracking-wide" style={{ color: '#C6DCFF' }}>
              Regulated · 50,000+ traders · Tier-1 liquidity
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="hero-fade-in-up font-display font-extrabold uppercase tracking-tight text-transparent bg-clip-text max-w-2xl"
          style={{
            backgroundImage:
              'linear-gradient(180deg, #FFFFFF 0%, #DCE7FF 60%, #ABCBFF 100%)',
            fontSize: 'clamp(2.5rem, 6.8vw, 6rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            animationDelay: '120ms',
          }}
        >
          Trade With
          <br />
          <span
            style={{
              backgroundImage:
                'linear-gradient(135deg, #4D95FF 0%, #1074FE 50%, #0856C5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Precision.
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="hero-fade-in-up mt-6 max-w-xl text-base sm:text-lg font-light leading-relaxed text-white/70"
          style={{ animationDelay: '260ms' }}
        >
          Sub-millisecond execution. 500+ instruments. Infrastructure
          trusted by professionals worldwide.
        </p>

        {/* CTAs */}
        <div
          className="hero-fade-in-up mt-9 flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-4"
          style={{ animationDelay: '380ms' }}
        >
          <Link href="/auth/register" className="hero-cta-primary group">
            <span>Open Account</span>
            <svg
              className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <a href="#markets" className="hero-cta-ghost">
            Explore Markets
          </a>
        </div>

        {/* Telemetry chips — sit in flow below CTAs on desktop,
            small gap. On mobile we hide them; the ticker band below
            the hero already shows the relevant data. */}
        <div
          className="hero-fade-in-up mt-10 hidden md:flex items-center gap-3 flex-wrap"
          style={{ animationDelay: '520ms' }}
        >
          <TelemetryChip label="Execution" value="< 50ms" />
          <TelemetryChip label="Uptime" value="99.99%" />
          <TelemetryChip label="Instruments" value="500+" />
        </div>
      </div>

      {/* Mobile scroll cue */}
      <div
        className="hero-fade-in absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden"
        style={{ animationDelay: '640ms' }}
      >
        <div className="hero-scroll-cue" aria-hidden />
      </div>
    </div>
  );
}

function TelemetryChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-xl backdrop-blur-md px-4 py-2"
      style={{
        background: 'rgba(8, 22, 56, 0.6)',
        border: '1px solid rgba(77, 149, 255, 0.25)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: '#4D95FF',
          boxShadow: '0 0 6px rgba(77, 149, 255, 0.9)',
        }}
      />
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-[0.18em] text-white/45">{label}</span>
        <span
          className="telemetry-num text-sm font-bold"
          style={{ color: '#ABCBFF' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
