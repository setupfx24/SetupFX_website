import InstitutionalHero from '@/landing/marketing/institutional/InstitutionalHero'
import InstitutionalClients from '@/landing/marketing/institutional/InstitutionalClients'
import Humanness from '@/landing/marketing/institutional/Humanness'
import Services from '@/landing/marketing/institutional/Services'
import GrowthTools from '@/landing/marketing/institutional/GrowthTools'
import TrustNumbers from '@/landing/marketing/institutional/TrustNumbers'
import GoodForBusiness from '@/landing/marketing/institutional/GoodForBusiness'
import GetInTouch from '@/landing/marketing/institutional/GetInTouch'
import OurOffices from '@/landing/marketing/institutional/OurOffices'
import FollowUs from '@/landing/marketing/FollowUs'
import FooterLinks, { type FooterColumn } from '@/landing/marketing/FooterLinks'
import Sponsors from '@/landing/marketing/Sponsors'
import Disclaimer from '@/landing/marketing/Disclaimer'

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Private & Premium',
    links: ['Multi-Asset Brokerage', 'Global Custody', 'Forex & Treasury', 'Discretionary Services'],
  },
  {
    heading: 'Forex & Treasury',
    links: ['Execution Forex', 'Swaps & Forwards', 'Precious Metals', 'Leveraged Forex'],
  },
  {
    heading: 'Institutional',
    links: ['Trading', 'Custody'],
  },
  {
    heading: 'Technology',
    links: ['Trading Platform', 'Liquidity', 'Trading APIs', 'Forex APIs'],
  },
]

export const metadata = {
  title: 'Institutional — SwissCresta',
  description: 'Institutional solutions for banks, brokers, funds and corporates.',
}

export default function InstitutionalPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main>
        <InstitutionalHero />
        <InstitutionalClients />
        <Humanness />
        <Services />
        <GrowthTools />
        <TrustNumbers />
        <GoodForBusiness />
        <GetInTouch />
        <OurOffices />
        <FollowUs />
        <FooterLinks columns={FOOTER_COLUMNS} align="left" />
        <Sponsors />
      </main>
      <Disclaimer />
    </div>
  )
}
