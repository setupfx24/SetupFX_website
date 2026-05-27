import PartnersHero from '@/landing/marketing/partners/PartnersHero'
import YourAdvantages from '@/landing/marketing/partners/YourAdvantages'
import MoneyManagers from '@/landing/marketing/partners/MoneyManagers'
import IntroducingBrokers from '@/landing/marketing/partners/IntroducingBrokers'
import SolidPartner from '@/landing/marketing/partners/SolidPartner'
import PartnersPlatforms from '@/landing/marketing/partners/PartnersPlatforms'
import BecomePartnerForm from '@/landing/marketing/partners/BecomePartnerForm'
import PartnerGuide from '@/landing/marketing/partners/PartnerGuide'
import FollowUs from '@/landing/marketing/FollowUs'
import FooterLinks from '@/landing/marketing/FooterLinks'
import Sponsors from '@/landing/marketing/Sponsors'
import Disclaimer from '@/landing/marketing/Disclaimer'

export const metadata = {
  title: 'Partners — SwissCresta',
  description: 'Grow your business with SwissCresta. Become a partner today.',
}

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main>
        <PartnersHero />
        <YourAdvantages />
        <MoneyManagers />
        <IntroducingBrokers />
        <SolidPartner />
        <PartnersPlatforms />
        <BecomePartnerForm />
        <PartnerGuide />
        <FollowUs />
        <FooterLinks />
        <Sponsors />
      </main>
      <Disclaimer />
    </div>
  )
}
