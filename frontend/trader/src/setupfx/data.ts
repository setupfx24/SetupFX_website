/**
 * Static content for the SetupFX marketing home page.
 *
 * The single CTA target across the page is `/auth/register` so every
 * "Get Started" / "Create Account" / "Start Investing" link drops the
 * user onto the trader signup flow regardless of which CTA they click.
 */

export const SIGNUP_HREF = '/auth/register';

export const BRAND = {
  name: 'SetupFX',
  tagline: 'Trade Smarter. Fund Faster. Grow Globally.',
  logo: '/images/setupfx-white-logo.png',
};

// Nav targets all resolve to public landing routes. /markets and
// /account-types are explicit pages with their own content; AuthProvider
// allow-lists them so unauthenticated visitors are not bounced to login.
// Items with `children` render as a dropdown.
export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Trading',
    href: '/markets',
    children: [
      { label: 'Markets Overview',  href: '/markets' },
      { label: 'Forex',             href: '/trading/forex' },
      { label: 'Crypto',            href: '/trading/crypto' },
      { label: 'Commodities',       href: '/trading/commodities' },
      { label: 'Indices',           href: '/trading/indices' },
      { label: 'Account Types',     href: '/account-types' },
      { label: 'How It Works',      href: '/how-it-works' },
    ],
  },
  {
    label: 'Platforms',
    href: '/platforms/web',
    children: [
      { label: 'Web Trading',     href: '/platforms/web' },
      { label: 'Copy Trading',    href: '/platforms/copy-trading' },
      { label: 'Prop Trading',    href: '/platforms/prop-trading' },
      { label: 'IB Management',   href: '/platforms/ib-management' },
      { label: 'Super Admin',     href: '/platforms/super-admin' },
    ],
  },
  {
    label: 'IB & Funding',
    href: '/products/ib-referral',
    children: [
      { label: 'IB Referral',     href: '/products/ib-referral' },
      { label: 'Referral Program', href: '/products/referral' },
      { label: 'Fixed Return',    href: '/products/fixed-return-insurance' },
      { label: 'Trade Insurance', href: '/products/insurance' },
      { label: 'Bonus & Rewards', href: '/bonus' },
    ],
  },
  {
    label: 'Services',
    href: '/services/software-development',
    children: [
      { label: 'Software Development',     href: '/services/software-development' },
      { label: 'Web Application Development', href: '/services/web-application-development' },
      { label: 'Mobile App Development',   href: '/services/mobile-app-development' },
      { label: 'CRM & Business Systems',   href: '/services/crm-business-systems' },
      { label: 'UI / UX Design',           href: '/services/ui-ux-design' },
    ],
  },
  {
    label: 'Marketing',
    href: '/marketing/strategy',
    children: [
      { label: 'Marketing Strategy',  href: '/marketing/strategy' },
      { label: 'SEO',                 href: '/marketing/seo' },
      { label: 'Paid Advertising',    href: '/marketing/paid-advertising' },
      { label: 'Social Media',        href: '/marketing/social-media' },
      { label: 'Content Marketing',   href: '/marketing/content-marketing' },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions/white-label',
    children: [
      { label: 'White-Label',             href: '/solutions/white-label' },
      { label: 'Grey-Label',              href: '/solutions/grey-label' },
      { label: 'Liquidity Provider',      href: '/liquidity' },
      { label: 'Custom Software',         href: '/solutions/custom-software' },
      { label: 'Business Automation',     href: '/solutions/business-automation' },
      { label: 'CRM & Admin Panels',      href: '/solutions/crm-admin-panels' },
      { label: 'Enterprise Applications', href: '/solutions/enterprise-applications' },
      { label: 'Advance Order Exchange',  href: '/solutions/advance-order-exchange' },
      { label: 'TradingView Advanced',    href: '/solutions/trading-view-advance' },
      { label: 'IB Admin Panel',          href: '/solutions/ib-admin' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries/startups',
    children: [
      { label: 'Startups',                    href: '/industries/startups' },
      { label: 'Small & Medium Businesses',   href: '/industries/small-medium-businesses' },
      { label: 'Enterprises',                 href: '/industries/enterprises' },
      { label: 'Global Brands',               href: '/industries/global-brands' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources/blog',
    children: [
      { label: 'Blog',                  href: '/resources/blog' },
      { label: 'Case Studies',          href: '/resources/case-studies' },
      { label: 'FAQs',                  href: '/resources/faqs' },
      { label: 'Academy — Videos',      href: '/academy/videos' },
      { label: 'Academy — PDFs',        href: '/academy/pdfs' },
      { label: 'Academy — Blogs',       href: '/academy/blogs' },
      { label: 'Risk Calculator',       href: '/risk-management/calculator' },
      { label: 'Pricing',               href: '/pricing' },
    ],
  },
  { label: 'About',   href: '/company/about' },
  { label: 'Contact', href: '/company/contact' },
];

export const HERO = {
  pill: 'Forex · Funding · IB · Copy Trading',
  pillBadge: 'Live',
  headline: 'Trade Smarter. Fund Faster. Grow Globally.',
  sub: 'A complete trading ecosystem offering Forex access, capital funding, IB partnership, and advanced copy trading — all under one trusted platform.',
  ctaPrimary: 'Start Trading',
  ctaSecondary: 'Apply For Funding',
  ctaHref: SIGNUP_HREF,
  ctaSecondaryHref: '/products/ib-referral',
};

/**
 * Three trust pills rendered above the hero CTAs — the first words a
 * first-time visitor reads. Communicates "what we do" before any scroll:
 * fast execution, deep liquidity, regulated infrastructure.
 *
 * Icon names are lucide-react component names — resolved in Hero.tsx via
 * an iconMap so we don't ship the entire icon catalog client-side.
 */
export const HERO_TRUST_PILLS = [
  { icon: 'Zap',         label: 'Ultra-Fast Execution', sub: 'Under 50ms order routing.' },
  { icon: 'ShieldCheck', label: 'Segregated Funds',     sub: 'Held with tier-1 banks.' },
  { icon: 'BadgeCheck',  label: 'Regulated Broker',     sub: 'Institutional-grade compliance.' },
] as const;

export const LIVE_TICKER = [
  { pair: 'BTC/USD',   price: '67,420',  change: '+1.82%', up: true },
  { pair: 'ETH/USD',   price: '3,580',   change: '+0.94%', up: true },
  { pair: 'EUR/USD',   price: '1.0842',  change: '+0.12%', up: true },
  { pair: 'XAU/USD',   price: '2318.50', change: '+0.45%', up: true },
  { pair: 'SOL/USD',   price: '168.20',  change: '+2.31%', up: true },
  { pair: 'GBP/USD',   price: '1.2654',  change: '-0.08%', up: false },
  { pair: 'USD/JPY',   price: '149.82',  change: '+0.23%', up: true },
  { pair: 'XRP/USD',   price: '0.5423',  change: '-0.15%', up: false },
  { pair: 'ADA/USD',   price: '0.4612',  change: '+0.72%', up: true },
  { pair: 'AUD/USD',   price: '0.6512',  change: '+0.08%', up: true },
  { pair: 'MATIC/USD', price: '0.8120',  change: '+1.05%', up: true },
  { pair: 'DOT/USD',   price: '7.42',    change: '-0.21%', up: false },
];

/**
 * Platform-feature bento cards — what makes SetupFX's infrastructure stand out.
 * Each card has icon, title, badge stat, body, and link to a deeper page.
 */
export const INSTRUMENTS = [
  { icon: 'Zap',          title: 'Ultra-Fast Execution',     badge: '<50ms',     body: 'Execute trades in under 50 milliseconds with our low-latency infrastructure and direct market access. No requotes, no dealer intervention.',                  href: '/services/ai-auto-trading' },
  { icon: 'Layers',       title: 'Deep Liquidity',           badge: '$50B+',     body: 'Access deep liquidity pools from tier-1 banks and institutions for seamless order execution with minimal slippage on every size.',                            href: '/services/portfolio-management' },
  { icon: 'TrendingUp',   title: 'Competitive Spreads',      badge: '0.0 pips',  body: 'Trade with spreads starting from 0.0 pips on major pairs with our RAW pricing model — no hidden fees, transparent costs.',                                   href: '/services/market-research' },
  { icon: 'ShieldCheck',  title: 'Advanced Risk Management', badge: '100%',      body: 'Protect your capital with negative balance protection, stop-loss guarantees, and real-time margin alerts. Trade with confidence.',                          href: '/services/education' },
  { icon: 'Gem',          title: 'Capital Funding',          badge: 'Up to $200K', body: 'Get funded and trade with company capital through our performance-based programs. Prove your edge — keep your profits.',                                 href: '/products/ib-referral' },
  { icon: 'Building',     title: 'Multi-Device Trading',     badge: '24/7 Sync', body: 'Trade seamlessly across Web, Desktop, and Mobile platforms with synchronized accounts. WebTrader, MT4/MT5, native iOS & Android apps.',                       href: '/services/automated-profit' },
] as const;

/**
 * Why SetupFX — the six reasons traders pick us over the next broker.
 */
export const WHY_US = [
  { icon: 'Zap',          title: 'High-Speed Trade Execution',    body: 'Ultra-low latency infrastructure for lightning-fast order execution. Direct market access with no dealer intervention, no requotes — your orders fill where they should.' },
  { icon: 'Gem',          title: 'Funding Support',               body: 'Capital funding programs for serious and disciplined traders. Pass the evaluation, get funded with company capital, and scale your account as you perform.' },
  { icon: 'Gift',         title: 'Profitable IB Structure',       body: 'Competitive commission model to maximise your earnings as an IB. Earn up to $7 per lot at Platinum tier on every trade your referrals place — for life.' },
  { icon: 'Brain',        title: 'Advanced Copy Trading',         body: 'Cutting-edge technology to replicate top trader strategies automatically. Browse verified track records, set your risk, and let proven traders trade for you.' },
  { icon: 'ShieldPlus',   title: 'Dedicated Client Support',      body: 'A professional support team available 24/7 in multiple languages. Real traders on the other end — not chatbots — who understand your strategy and execution needs.' },
  { icon: 'BadgeCheck',   title: 'Transparent Policies',          body: 'Clear, honest terms with no hidden conditions. Segregated client funds at tier-1 banks, audited trade records, and regulated under CySEC oversight.' },
  { icon: 'Gauge',        title: 'Risk Management',               body: 'Advanced risk controls including adjustable leverage (up to 1:500), stop-loss automation, margin-call alerts, and real-time exposure monitoring built into every account.' },
  { icon: 'TrendingDown', title: 'Negative Balance Protection',   body: 'You can never lose more than you deposit. Smart stop-out logic and built-in negative balance protection ensure unexpected market gaps never push your account below zero.' },
] as const;

/**
 * How it works — the four steps from sign-up to live trading.
 */
export const HOW_IT_WORKS = [
  { n: '1', title: 'Create Free Account',  body: 'Sign up in under three minutes with email or wallet. Verification is fully digital — most accounts approved within 24 hours.' },
  { n: '2', title: 'Choose Your Account',  body: 'Pick the account that matches your edge — Standard for newcomers, Pro for active traders, or VIP for institutional-grade pricing from 0.0 pips.' },
  { n: '3', title: 'Fund Your Wallet',     body: 'Deposit via bank wire, card, e-wallet (Skrill, Neteller), or crypto. Most deposits clear instantly; bank wires settle within one business day.' },
  { n: '4', title: 'Trade or Get Funded',  body: 'Trade live across forex, indices, commodities, crypto, and stocks — or apply for a funded account and trade company capital with profit-share.' },
] as const;

export const STATS = [
  { value: '500K+',  label: 'Active Traders Worldwide' },
  { value: '$50B+',  label: 'Monthly Trading Volume' },
  { value: '<50ms',  label: 'Average Execution Speed' },
  { value: '24/7',   label: 'Multilingual Support' },
] as const;

/**
 * Trader testimonials sourced from real customer reviews — names, roles,
 * and countries reflect the actual community. Avatars from randomuser.me
 * are placeholders until real branded portraits are produced. Drop them
 * at /public/images/testimonials/<slug>.webp and swap the URL —
 * Testimonials.tsx falls back to initials if the image fails to load.
 */
export const TESTIMONIALS = [
  { name: 'Sarah Mitchell',  role: 'Professional Forex Trader, UK',    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', quote: "SetupFX's execution speed is unmatched. I've seen my win rate improve significantly since switching. The tight spreads and reliable platform make all the difference in my scalping strategy." },
  { name: 'Marcus Chen',     role: 'Day Trader, Singapore',            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',   quote: "The customer support team is exceptional. They're available 24/7 and actually understand trading. When I had an issue with a trade, it was resolved within minutes, not hours." },
  { name: 'Elena Rodriguez', role: 'Swing Trader, Spain',              avatar: 'https://randomuser.me/api/portraits/women/22.jpg', quote: 'After trying multiple brokers, SetupFX stands out for transparency. No hidden fees, no requotes — just honest trading conditions. My account manager is always there when I need guidance.' },
  { name: 'David Thompson',  role: 'Algorithmic Trader, United States', avatar: 'https://randomuser.me/api/portraits/men/77.jpg',   quote: 'The API integration is rock-solid. I run multiple EAs on MT4 and MT5 without any issues. The low latency execution is crucial for my automated strategies, and SetupFX delivers.' },
  { name: 'Aarav Sharma',    role: 'Retail Trader, India',             avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   quote: 'The interface is clean and easy to navigate. Funded my account via UPI in under a minute and was placing my first trade within five.' },
  { name: 'Priya Iyer',      role: 'IB Partner, India',                avatar: 'https://randomuser.me/api/portraits/women/63.jpg', quote: "The IB dashboard is genuinely real-time — I can see every trade my network places. Commissions hit my account weekly without fail. Best partnership program I've worked with." },
  { name: 'Hiroshi Tanaka',  role: 'Funded Trader, Japan',             avatar: 'https://randomuser.me/api/portraits/men/45.jpg',   quote: 'Passed the funded-account evaluation in three weeks. Now trading $100K of company capital with an 80/20 profit split. SetupFX actually pays out, on time, every month.' },
  { name: 'Aisha Khan',      role: 'Crypto Trader, UAE',               avatar: 'https://randomuser.me/api/portraits/women/55.jpg', quote: 'Crypto spreads are tighter than the exchanges I used to trade on, and I get leverage on top. Plus 24/7 markets means I can trade whenever an idea hits.' },
] as const;

export const FAQ = [
  {
    q: 'What is the minimum deposit to open an account?',
    a: 'The minimum deposit varies by account type. Our Standard account requires just $100 to get started, while Pro accounts start at $1,000. VIP accounts unlock the lowest spreads and dedicated support from $10,000, and Institutional accounts have custom minimums for API and white-label access. A free Demo account with $100,000 in virtual funds is also available — no commitment, identical execution conditions.',
  },
  {
    q: 'What trading platforms do you offer?',
    a: 'We offer the industry-leading MetaTrader 4 and MetaTrader 5 platforms — available on Web, Desktop (Windows/Mac), and Mobile (iOS/Android). We also provide our proprietary WebTrader for browser-based trading without downloads, plus a full mobile app suite. All platforms sync to a single account, so your positions, alerts, and watchlists stay in sync across every device.',
  },
  {
    q: 'Are my funds safe with SetupFX?',
    a: 'Absolutely. Client funds are held in segregated accounts with tier-1 banks, completely separate from our operational funds. We also participate in investor compensation schemes and maintain comprehensive insurance coverage. SetupFX is regulated by the Cyprus Securities and Exchange Commission (CySEC), with strict compliance and audit requirements applied to every client account.',
  },
  {
    q: 'What are your spreads and commissions?',
    a: 'Spreads start from 0.0 pips on RAW (Pro / VIP) accounts, with commissions as low as $2.5 per lot on VIP. Standard accounts offer commission-free trading with all-in spreads from 1.2 pips. There are no hidden fees, no inactivity charges, and no deposit/withdrawal fees on supported methods. See the Account Types page for the full pricing comparison.',
  },
  {
    q: 'Do you offer demo accounts?',
    a: "Yes — free demo accounts with $100,000 in virtual funds. Practice your strategies risk-free under real market conditions, with the same execution engine, the same prices, and the same platform features as a live account. Demo accounts work on every platform and never expire, so you can keep one alongside your live account for testing.",
  },
  {
    q: 'How can I deposit and withdraw funds?',
    a: 'We support multiple payment methods including bank wire, credit/debit cards (Visa/Mastercard), popular e-wallets (Skrill, Neteller, PayPal), and cryptocurrency. Most card and e-wallet deposits are instant; bank wires settle within one business day; crypto withdrawals are typically processed within an hour. There are no SetupFX deposit fees on any method.',
  },
  {
    q: 'How does the funded-account program work?',
    a: 'Apply for a funded account, prove your edge in our two-stage evaluation (a profit target with strict risk rules), and once verified you trade with company capital — up to $200,000 — and keep up to 80% of the profit. There are no monthly fees once you are funded, just disciplined risk management. Scale your account by 25% every time you hit a profit milestone.',
  },
  {
    q: 'How do I become an IB partner?',
    a: "Visit Products → IB Referral and complete the short partner application (name, country, email, phone, and a brief note about your audience). Our partner team reviews and activates accounts within 24 hours. Once approved you get a unique referral link, a marketing kit, a live dashboard, and weekly per-lot commissions — up to $7 per lot at Platinum tier — on every trade your referrals place, for life.",
  },
] as const;

export const CTA = {
  headline: "Let's Build Your Trading Future",
  sub: 'Join SetupFX today and trade with a broker that puts execution, transparency, and your capital first.',
  primary: 'Start Trading',
  secondary: 'How It Works',
  href: SIGNUP_HREF,
  secondaryHref: '/how-it-works',
};

export const FOOTER_QUICK_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'About Us',     href: '/company/about' },
  { label: 'Markets',      href: '/markets' },
  { label: 'Accounts',     href: '/account-types' },
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'Contact',      href: '/company/contact' },
];

export const FOOTER_SERVICES = [
  { label: 'Forex Trading',         href: '/markets' },
  { label: 'Capital Funding',       href: '/products/ib-referral' },
  { label: 'IB Partnership',        href: '/products/ib-referral' },
  { label: 'Copy Trading',          href: '/services/portfolio-management' },
  { label: 'Fixed Return',          href: '/products/fixed-return-insurance' },
  { label: 'Trade Insurance',       href: '/products/insurance' },
];

export const FOOTER_LINKS = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Risk Disclaimer',  href: '/risk' },
];

export const COPYRIGHT = `© ${new Date().getFullYear()} SetupFX. All Rights Reserved.`;

export const RISK_DISCLAIMER =
  'FX and CFDs are leveraged products and involve a high level of risk. Trading may result in losses exceeding your initial investment and may not be suitable for all investors. Please ensure you fully understand the risks before trading. Past performance is not indicative of future results.';
