import HeroSection from './home/HeroSection'
import TickerTape from '../components/TickerTape'
import AboutSection from './home/AboutSection'
import VisionMissionSection from './home/VisionMissionSection'
import WhySection from './home/WhySection'
import MarketsSection from './home/MarketsSection'
import PlatformSection from './home/PlatformSection'
import AccountsSection from './home/AccountsSection'
import ConditionsSection from './home/ConditionsSection'
import ToolsSection from './home/ToolsSection'
import EducationSection from './home/EducationSection'
import IslamicAccountSection from './home/IslamicAccountSection'
import PaymentsSection from './home/PaymentsSection'
import SecuritySection from './home/SecuritySection'
import StartTradingSection from './home/StartTradingSection'
import BottomSection from './home/BottomSection'

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* 1. Hero */}
      <HeroSection />

      {/* Live Market Ticker */}
      <TickerTape />

      {/* 2. About */}
      <AboutSection />

      {/* 4. Vision Mission Values */}
      <VisionMissionSection />

      {/* 5. Why Choose */}
      <WhySection />

      {/* 6. Markets */}
      <MarketsSection />

      {/* 7. Platform */}
      <PlatformSection />

      {/* 8. Accounts */}
      <AccountsSection />

      {/* 9. Conditions */}
      <ConditionsSection />

      {/* 10. Tools */}
      <ToolsSection />

      {/* 11. Education */}
      <EducationSection />

      {/* 12. Islamic Account */}
      <IslamicAccountSection />

      {/* 13. Payments */}
      <PaymentsSection />

      {/* 14. Security */}
      <SecuritySection />

      {/* 16. Start Trading */}
      <StartTradingSection />

      {/* 17. Bottom (Testimonials + FAQ + CTA) */}
      <BottomSection />
    </div>
  )
}

export default Home
