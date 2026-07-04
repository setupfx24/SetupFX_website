import { SolutionTemplate } from '@/setupfx/components/SolutionTemplate';

export const metadata = { title: 'TradingView Advanced — SetupFX' };

export default function TradingViewAdvancePage() {
  return (
    <SolutionTemplate
      badge="Trading View Advance"
      headline="TradingView-Powered Charting & Analysis"
      subheadline="Integrate the world's most popular charting library into your trading platform. Advanced technical analysis tools your traders already know and love."
      description="Our TradingView Advance solution embeds the full TradingView charting experience directly into your white-label platform. Traders get access to 100+ technical indicators, 50+ drawing tools, multi-timeframe analysis, and real-time data — all within your branded environment. The integration supports custom indicators, Pine Script, alerts, and watchlists. Give your traders the professional-grade charting they expect without building it from scratch."
      ctaPrimary={{ label: 'Get Demo', href: '/company/contact' }}
      ctaSecondary={{ label: 'See Advanced Order Exchange', href: '/solutions/advance-order-exchange' }}
      featuresHeading="Charting Capabilities"
      features={[
        { title: 'Full TradingView Charts',  description: 'Embedded TradingView charting library with all premium features and real-time data.' },
        { title: '100+ Technical Indicators', description: 'Moving averages, oscillators, volume indicators, and custom Pine Script indicators.' },
        { title: '50+ Drawing Tools',         description: 'Trendlines, Fibonacci, Gann, Elliott Wave, and advanced geometric tools.' },
        { title: 'Multi-Timeframe Analysis',  description: 'From 1-second to monthly charts with synchronized multi-chart layouts.' },
        { title: 'Custom Alerts',             description: 'Price alerts, indicator crossovers, and custom condition alerts with push notifications.' },
        { title: 'One-Click Trading',         description: 'Trade directly from the chart with integrated order entry and position management.' },
      ]}
      benefitsHeading="Why It Matters"
      benefits={[
        'Traders get the charting tools they already know and trust',
        'No learning curve — TradingView is the industry standard',
        '100+ built-in indicators plus custom Pine Script support',
        'Multi-chart layouts for professional multi-timeframe analysis',
        'Real-time data streaming with sub-second chart updates',
        'One-click trading directly from chart for faster execution',
        'Fully embedded in your white-label platform — seamless UX',
        'Reduces development cost vs building charting from scratch',
      ]}
      bottomCta={{
        heading: 'Bring TradingView to Your Brokerage',
        subheading: 'See how seamlessly we can integrate professional-grade charting into your platform.',
        button: { label: 'Talk to Sales', href: '/company/contact' },
      }}
    />
  );
}
