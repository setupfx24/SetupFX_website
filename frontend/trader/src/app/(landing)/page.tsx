'use client'

/**
 * SwissCresta home — Swiss-broker style.
 *
 * Section order mirrors what serious multi-asset brokers (Dukascopy,
 * Saxo, Interactive Brokers) put on their home page: hero → product
 * grid → trust pillars → account tiers → platforms → social trading →
 * final CTA. Original copy throughout — no verbatim text from any
 * competitor.
 *
 * Previous DeFi-flavoured sections (Problem/Solution, HowItWorks,
 * TradingModes/fully-funded, Insurance, Gamification, Staking,
 * Referral, plus three inline banner-image blocks pointing at
 * hero_banner{1,2,3}.png) were removed in the broker-repositioning
 * pass. The trader app still serves staking / gamification / insurance
 * routes if you navigate to them directly — they're just no longer
 * surfaced from the marketing home.
 */

import HeroSection from '@/landing/pages/home/HeroSection'
import FxProducts from '@/landing/pages/home/FxProducts'
import FxWhySwissCresta from '@/landing/pages/home/FxWhySwissCresta'
import FxAccountTypes from '@/landing/pages/home/FxAccountTypes'
import FxPlatforms from '@/landing/pages/home/FxPlatforms'
import FxCopyTrading from '@/landing/pages/home/FxCopyTrading'
import FxFinalCTA from '@/landing/pages/home/FxFinalCTA'

export default function LandingHomePage() {
  return (
    <>
      <HeroSection />
      <FxProducts />
      <FxWhySwissCresta />
      <FxAccountTypes />
      <FxPlatforms />
      <FxCopyTrading />
      <FxFinalCTA />
    </>
  )
}
