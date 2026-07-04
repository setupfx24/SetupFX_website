'use client';

/* ─────────────────────────────────────────────────────────────────────
   TradingToolsArt — three SVG mockup illustrations for the
   TradingTools section. Replaces the empty placeholder boxes that
   only showed a sparkles icon + 3 colored bars.

   Each variant is a clean, brand-blue, light-section-friendly mock
   of the actual product surface:

   • ChartArt        — candlestick chart with grid + EMA line + RSI
   • CopyTradeArt    — master trader card + 3 follower nodes + profit line
   • IbArt           — referral tree (1 → 4 → 12) + commission chip

   All pure SVG. No JS, no images, no animations — they render once
   and feel like dashboard previews. Scroll-safe by construction.
   ───────────────────────────────────────────────────────────────────── */

const BLUE = '#1074FE';
const BLUE_LIGHT = '#4D95FF';
const BLUE_VLIGHT = '#A8C7FF';
const GREEN = '#10B981';
const RED = '#EF4444';
const TEXT = '#0F172A';
const TEXT_MUTED = '#64748B';
const LINE = '#E2E8F0';

/* ── 1. Advanced Charting ───────────────────────────────────────── */
export function ChartArt() {
  /* Candles: x positions across the canvas, with realistic OHLC and
     trending data. Each is body + wick. */
  type Candle = { x: number; open: number; close: number; high: number; low: number };
  const candles: Candle[] = [
    { x:  35, open: 180, close: 165, high: 158, low: 188 },
    { x:  60, open: 165, close: 172, high: 160, low: 178 },
    { x:  85, open: 172, close: 158, high: 152, low: 178 },
    { x: 110, open: 158, close: 148, high: 142, low: 162 },
    { x: 135, open: 148, close: 138, high: 132, low: 154 },
    { x: 160, open: 138, close: 145, high: 132, low: 152 },
    { x: 185, open: 145, close: 130, high: 124, low: 152 },
    { x: 210, open: 130, close: 122, high: 116, low: 136 },
    { x: 235, open: 122, close: 132, high: 116, low: 138 },
    { x: 260, open: 132, close: 120, high: 114, low: 138 },
    { x: 285, open: 120, close: 108, high: 102, low: 126 },
    { x: 310, open: 108, close: 116, high: 102, low: 122 },
    { x: 335, open: 116, close: 100, high:  94, low: 122 },
    { x: 360, open: 100, close:  90, high:  84, low: 106 },
    { x: 385, open:  90, close:  98, high:  84, low: 104 },
    { x: 410, open:  98, close:  82, high:  76, low: 104 },
  ];
  /* EMA = simple moving average of close prices for the smooth line. */
  const closes = candles.map((c) => c.close);
  const ema = closes.map((_, i) => {
    const win = closes.slice(Math.max(0, i - 3), i + 1);
    return win.reduce((a, b) => a + b, 0) / win.length;
  });

  return (
    <svg viewBox="0 0 480 300" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={BLUE} stopOpacity="0.18" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card surface */}
      <rect x="0" y="0" width="480" height="300" rx="14" fill="#FFFFFF" stroke={LINE} strokeWidth="1" />

      {/* Header row */}
      <text x="16" y="24" fill={TEXT} fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="700">EUR/USD</text>
      <text x="78" y="24" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="10">1.0876</text>
      <text x="120" y="24" fill={GREEN} fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="700">▲ 0.21%</text>
      <text x="425" y="24" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9" textAnchor="end">M5</text>

      {/* Grid lines */}
      {[80, 130, 180, 230].map((y) => (
        <line key={y} x1="16" y1={y} x2="464" y2={y} stroke={LINE} strokeWidth="0.5" />
      ))}
      {/* Price axis labels */}
      {[
        { y: 80,  v: '1.090' },
        { y: 130, v: '1.085' },
        { y: 180, v: '1.080' },
        { y: 230, v: '1.075' },
      ].map((g) => (
        <text key={g.v} x="460" y={g.y - 3} fill={TEXT_MUTED} fontFamily="ui-monospace" fontSize="8" textAnchor="end">
          {g.v}
        </text>
      ))}

      {/* Area under EMA */}
      <path
        d={`M ${candles[0].x},${ema[0] + 80} ${candles
          .map((c, i) => `L ${c.x},${ema[i] + 80}`)
          .join(' ')} L ${candles[candles.length - 1].x},250 L ${candles[0].x},250 Z`}
        fill="url(#chartFill)"
      />

      {/* EMA line */}
      <path
        d={`M ${candles[0].x},${ema[0] + 80} ${candles
          .map((c, i) => `L ${c.x},${ema[i] + 80}`)
          .join(' ')}`}
        fill="none"
        stroke={BLUE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Candles */}
      {candles.map((c, i) => {
        const isUp = c.close < c.open;
        const color = isUp ? GREEN : RED;
        const bodyTop = Math.min(c.open, c.close) + 80;
        const bodyHeight = Math.abs(c.open - c.close);
        return (
          <g key={i}>
            <line x1={c.x} y1={c.high + 80} x2={c.x} y2={c.low + 80} stroke={color} strokeWidth="0.8" />
            <rect
              x={c.x - 4}
              y={bodyTop}
              width="8"
              height={Math.max(bodyHeight, 2)}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}

      {/* RSI sub-panel */}
      <line x1="16" y1="255" x2="464" y2="255" stroke={LINE} strokeWidth="0.5" />
      <text x="16" y="270" fill={TEXT_MUTED} fontFamily="ui-monospace" fontSize="8">RSI(14)</text>
      <text x="60" y="270" fill={BLUE_LIGHT} fontFamily="ui-monospace" fontSize="8" fontWeight="700">62.4</text>
      <path
        d="M 16,278 Q 80,270 140,275 T 260,272 T 380,278 T 464,275"
        fill="none"
        stroke={BLUE_LIGHT}
        strokeWidth="1.2"
      />

      {/* Bottom toolbar pill */}
      <rect x="16" y="288" width="60" height="6" rx="3" fill={BLUE} />
      <rect x="80" y="288" width="30" height="6" rx="3" fill={LINE} />
      <rect x="114" y="288" width="42" height="6" rx="3" fill={LINE} />
    </svg>
  );
}

/* ── 2. Copy Trading & PAMM ─────────────────────────────────────── */
export function CopyTradeArt() {
  /* Performance curve for the master, with 4 connected follower
     avatars. Each follower line connects to master with a subtle arc. */
  return (
    <svg viewBox="0 0 480 300" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={BLUE} stopOpacity="0.22" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card surface */}
      <rect x="0" y="0" width="480" height="300" rx="14" fill="#FFFFFF" stroke={LINE} strokeWidth="1" />

      {/* Master trader header card */}
      <rect x="14" y="14" width="200" height="64" rx="10" fill="#F4F8FF" stroke={BLUE_VLIGHT} strokeWidth="1" />
      <circle cx="40" cy="46" r="18" fill={BLUE} />
      <text x="40" y="50" fill="#FFFFFF" fontFamily="ui-sans-serif" fontSize="12" fontWeight="800" textAnchor="middle">AK</text>
      <text x="68" y="38" fill={TEXT} fontFamily="ui-sans-serif" fontSize="11" fontWeight="700">Anand K.</text>
      <text x="68" y="52" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9">Master Trader · Verified</text>
      <text x="68" y="68" fill={GREEN} fontFamily="ui-monospace" fontSize="10" fontWeight="700">+247.8% (12 mo)</text>

      {/* KPI chip cluster */}
      <g transform="translate(228, 14)">
        {[
          { label: 'Followers', value: '1,284', y: 0 },
          { label: 'AUM',       value: '$2.4M', y: 22 },
          { label: 'Drawdown',  value: '6.8%',  y: 44 },
        ].map((k) => (
          <g key={k.label}>
            <rect x="0" y={k.y} width="120" height="18" rx="9" fill="#F4F8FF" stroke={LINE} strokeWidth="0.5" />
            <text x="10" y={k.y + 12} fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="8">{k.label}</text>
            <text x="110" y={k.y + 12} fill={BLUE} fontFamily="ui-monospace" fontSize="9" fontWeight="700" textAnchor="end">{k.value}</text>
          </g>
        ))}
      </g>

      {/* Performance section title */}
      <text x="16" y="98" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9" letterSpacing="1.2">EQUITY · 90 DAYS</text>

      {/* Equity curve */}
      <path
        d="M 16,180 C 60,170 100,182 140,160 S 220,135 260,148 S 340,90 380,75 L 464,55 L 464,200 L 16,200 Z"
        fill="url(#perfFill)"
      />
      <path
        d="M 16,180 C 60,170 100,182 140,160 S 220,135 260,148 S 340,90 380,75 L 464,55"
        fill="none"
        stroke={BLUE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* End marker */}
      <circle cx="464" cy="55" r="3.5" fill={BLUE} stroke="#FFFFFF" strokeWidth="1" />

      {/* Follower row title */}
      <text x="16" y="226" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9" letterSpacing="1.2">RECENT FOLLOWERS</text>

      {/* Follower avatars + allocation */}
      {[
        { x: 16,  initials: 'RS', alloc: '$2,400', color: '#7C3AED' },
        { x: 130, initials: 'MK', alloc: '$1,800', color: '#0EA5E9' },
        { x: 244, initials: 'JT', alloc: '$5,200', color: '#F59E0B' },
        { x: 358, initials: 'PV', alloc: '$ 980',   color: '#10B981' },
      ].map((f, i) => (
        <g key={i} transform={`translate(${f.x}, 238)`}>
          <circle cx="14" cy="20" r="13" fill={f.color} />
          <text x="14" y="24" fill="#FFFFFF" fontFamily="ui-sans-serif" fontSize="10" fontWeight="800" textAnchor="middle">
            {f.initials}
          </text>
          <text x="36" y="18" fill={TEXT} fontFamily="ui-sans-serif" fontSize="10" fontWeight="700">Follower {i + 1}</text>
          <text x="36" y="30" fill={BLUE} fontFamily="ui-monospace" fontSize="9" fontWeight="700">{f.alloc}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── 3. IB Partner Program ──────────────────────────────────────── */
export function IbArt() {
  return (
    <svg viewBox="0 0 480 300" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ibEarnFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={BLUE} stopOpacity="0.20" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card surface */}
      <rect x="0" y="0" width="480" height="300" rx="14" fill="#FFFFFF" stroke={LINE} strokeWidth="1" />

      {/* Header — total earned */}
      <text x="16" y="26" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9" letterSpacing="1.2">TOTAL EARNED</text>
      <text x="16" y="52" fill={TEXT} fontFamily="ui-sans-serif" fontSize="22" fontWeight="800">$ 18,432</text>
      <text x="124" y="52" fill={GREEN} fontFamily="ui-monospace" fontSize="11" fontWeight="700">▲ 12.4%</text>

      {/* Pending payout chip */}
      <g transform="translate(316, 14)">
        <rect x="0" y="0" width="148" height="44" rx="10" fill="#F4F8FF" stroke={BLUE_VLIGHT} strokeWidth="1" />
        <circle cx="20" cy="22" r="9" fill={BLUE} />
        <text x="20" y="26" fill="#FFFFFF" fontFamily="ui-sans-serif" fontSize="9" fontWeight="800" textAnchor="middle">$</text>
        <text x="36" y="18" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="8">Pending payout</text>
        <text x="36" y="34" fill={TEXT} fontFamily="ui-monospace" fontSize="11" fontWeight="700">$ 1,240</text>
      </g>

      {/* Earnings sparkline */}
      <path
        d="M 16,150 C 50,140 80,148 120,128 S 200,110 240,118 S 340,80 400,68 L 464,62 L 464,170 L 16,170 Z"
        fill="url(#ibEarnFill)"
      />
      <path
        d="M 16,150 C 50,140 80,148 120,128 S 200,110 240,118 S 340,80 400,68 L 464,62"
        fill="none"
        stroke={BLUE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* MLM tree title */}
      <text x="16" y="194" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9" letterSpacing="1.2">YOUR DOWNLINE</text>

      {/* Tree — you → L1 → L2 */}
      {/* You (root) */}
      <g transform="translate(216, 210)">
        <circle cx="24" cy="14" r="13" fill={BLUE} />
        <text x="24" y="18" fill="#FFFFFF" fontFamily="ui-sans-serif" fontSize="9" fontWeight="800" textAnchor="middle">YOU</text>
      </g>

      {/* Connectors to L1 — 3 children */}
      <path d="M 240,238 C 240,254 120,254 120,266" fill="none" stroke={BLUE_VLIGHT} strokeWidth="1.2" />
      <path d="M 240,238 L 240,266" fill="none" stroke={BLUE_VLIGHT} strokeWidth="1.2" />
      <path d="M 240,238 C 240,254 360,254 360,266" fill="none" stroke={BLUE_VLIGHT} strokeWidth="1.2" />

      {/* L1 nodes — 3 referrals */}
      {[
        { cx: 120, label: '12' },
        { cx: 240, label: '8'  },
        { cx: 360, label: '5'  },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy="276" r="10" fill="#F4F8FF" stroke={BLUE} strokeWidth="1.5" />
          <text x={n.cx} y="280" fill={BLUE} fontFamily="ui-monospace" fontSize="9" fontWeight="700" textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}

      {/* Level labels */}
      <text x="16" y="280" fill={TEXT_MUTED} fontFamily="ui-sans-serif" fontSize="9">L1 active referrals</text>
    </svg>
  );
}
