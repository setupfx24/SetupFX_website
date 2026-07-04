import { SolutionTemplate } from '@/setupfx/components/SolutionTemplate';

export const metadata = { title: 'Advanced Order Exchange — SetupFX' };

export default function AdvanceOrderExchangePage() {
  return (
    <SolutionTemplate
      badge="Advance Order Exchange"
      headline="Advanced Order Types & Matching Engine"
      subheadline="Institutional-grade order management with advanced order types, smart routing, and ultra-low latency execution for your trading platform."
      description="Our Advance Order Exchange solution brings institutional-level order management to your brokerage. Support complex order types beyond basic market and limit orders — including OCO, trailing stops, iceberg orders, and time-weighted execution. The built-in matching engine handles high-frequency order flow with microsecond latency, while smart order routing ensures best execution across multiple liquidity providers."
      ctaPrimary={{ label: 'Get Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'See Trading View Advanced', href: '/solutions/trading-view-advance' }}
      featuresHeading="Engine Capabilities"
      features={[
        { title: 'Advanced Order Types', description: 'OCO, trailing stop, iceberg, bracket, TWAP, and custom algorithmic order types.' },
        { title: 'Smart Order Routing',  description: 'Automatic routing to the best liquidity source based on price, depth, and latency.' },
        { title: 'Matching Engine',      description: 'Ultra-low latency order matching with price-time priority and configurable rules.' },
        { title: 'Risk Pre-Trade Checks', description: 'Real-time margin validation, position limits, and exposure checks before execution.' },
        { title: 'Order Book Depth',     description: 'Full Level 2 market depth display with aggregated liquidity from multiple sources.' },
        { title: 'Execution Reports',    description: 'Detailed fill reports, slippage analysis, and execution quality metrics.' },
      ]}
      benefitsHeading="Why It Matters"
      benefits={[
        'Support professional traders with institutional-grade order types',
        'Ultra-low latency execution with microsecond order processing',
        'Smart routing ensures best execution across liquidity providers',
        'Pre-trade risk checks protect both the broker and the client',
        'Full audit trail for regulatory compliance and dispute resolution',
        'Configurable matching rules for different asset classes',
        'Scalable architecture handles thousands of orders per second',
        'FIX protocol support for institutional connectivity',
      ]}
      bottomCta={{
        heading: 'Upgrade Your Order Management',
        subheading: 'Give your traders the order types and execution quality they expect from a top-tier broker.',
        button: { label: 'Talk to Sales', href: '/company/contact' },
      }}
    />
  );
}
