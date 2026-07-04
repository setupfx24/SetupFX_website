'use client';

/* ─────────────────────────────────────────────────────────────────────
   HomeMarketTicker — black band of scrolling market tickers.

   Pure CSS marquee. No interval, no fetch, no JS animation. Two
   identical content rows side-by-side; outer container's transform
   loops via @keyframes. Browser-paced GPU compositing → smooth even
   on integrated graphics. Wheel/scroll events are NOT touched.

   The data is hard-coded sample tickers — replace with live feed
   later by passing the data in as a prop or hydrating from your
   market-data WS. Right now it's purely decorative / first-impression.
   ───────────────────────────────────────────────────────────────────── */

type Tick = { sym: string; price: string; pct: number };

const TICKERS: Tick[] = [
  { sym: 'EUR/USD', price: '1.0876', pct: 0.21 },
  { sym: 'GBP/USD', price: '1.2734', pct: -0.08 },
  { sym: 'USD/JPY', price: '151.42', pct: 0.34 },
  { sym: 'XAU/USD', price: '2,318.40', pct: 0.62 },
  { sym: 'BTC/USD', price: '67,840', pct: 1.85 },
  { sym: 'ETH/USD', price: '3,512.20', pct: 1.12 },
  { sym: 'NAS100', price: '18,420.5', pct: 0.47 },
  { sym: 'US500', price: '5,234.7', pct: 0.29 },
  { sym: 'AUD/USD', price: '0.6584', pct: -0.14 },
  { sym: 'XAG/USD', price: '27.34', pct: 0.91 },
  { sym: 'USOIL', price: '82.15', pct: -0.42 },
  { sym: 'USDCAD', price: '1.3635', pct: 0.18 },
];

function TickerCell({ t }: { t: Tick }) {
  const positive = t.pct >= 0;
  const color = positive ? '#10B981' : '#EF4444';
  const arrow = positive ? '▲' : '▼';
  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-1 shrink-0">
      <span className="text-[12px] font-bold tracking-wide text-white">{t.sym}</span>
      <span
        className="telemetry-num text-[12px] font-semibold"
        style={{ color: '#ABCBFF' }}
      >
        {t.price}
      </span>
      <span
        className="telemetry-num text-[11px] font-bold inline-flex items-center gap-0.5"
        style={{ color }}
      >
        {arrow} {Math.abs(t.pct).toFixed(2)}%
      </span>
    </div>
  );
}

export function HomeMarketTicker() {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#0A0F1F]"
    >
      <div className="ticker-marquee-mask">
        <div className="ticker-marquee flex">
          {TICKERS.map((t, i) => (
            <TickerCell key={`a-${i}`} t={t} />
          ))}
          {TICKERS.map((t, i) => (
            <TickerCell key={`b-${i}`} t={t} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .ticker-marquee-mask {
          padding-block: 10px;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 6%,
            black 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 6%,
            black 94%,
            transparent 100%
          );
        }
        .ticker-marquee {
          width: max-content;
          animation: ticker-marquee 38s linear infinite;
          will-change: transform;
        }
        @keyframes ticker-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}
