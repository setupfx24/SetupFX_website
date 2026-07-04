'use client';

import './styles.css';
import { Navbar } from './components/Navbar';
import HeroScene from './components/HeroScene';
import { HomeMarketTicker } from './components/HomeMarketTicker';
import {
  ProofBar,
  WhyTrade,
  Markets,
  AccountTiers,
  TradingTools,
  TrustStrip,
  FinalCTA,
} from './components/SimpleSections';
import { Footer } from './components/Footer';

/**
 * SetupFX public marketing home — white + blue + black premium theme.
 *
 * Scroll rhythm (top → bottom):
 *   • HeroScene        dark navy cinematic hero
 *   • MarketTicker     thin dark band, scrolling tickers
 *   • ProofBar         pure black, 4 trust stats
 *   • WhyTrade         white, 6 feature cards
 *   • Markets          light grey, 4 asset classes
 *   • AccountTiers     light grey, 4 pricing tiers
 *   • TradingTools     white, 3 product highlights
 *   • TrustStrip       black, compliance badges
 *   • FinalCTA         black, closing call-to-action
 *   • Footer           existing
 *
 * Scroll-safety rules (all preserved):
 *   – No wheel listeners with preventDefault
 *   – No GSAP scrollTrigger pin/scrub
 *   – No fragment shaders or canvas-animated heroes
 *   – Only IntersectionObserver-based reveal (opacity only, one-shot)
 *   – `overflow-x: clip` everywhere instead of `hidden`
 */
export default function SetupFXHomePage() {
  return (
    <div className="setupfx-home min-h-screen bg-[#050B1F] text-white">
      <Navbar />
      <HeroScene />
      <HomeMarketTicker />
      <ProofBar />
      <WhyTrade />
      <Markets />
      <AccountTiers />
      <TradingTools />
      <TrustStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}
