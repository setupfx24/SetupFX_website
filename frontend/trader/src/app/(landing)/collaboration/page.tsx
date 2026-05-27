import CollabHero from '@/landing/marketing/collaboration/CollabHero'
import AddedValue from '@/landing/marketing/collaboration/AddedValue'
import Strategy from '@/landing/marketing/collaboration/Strategy'
import CollabContact from '@/landing/marketing/collaboration/CollabContact'
import FollowUs from '@/landing/marketing/FollowUs'
import FooterLinks, { type FooterColumn } from '@/landing/marketing/FooterLinks'
import Sponsors from '@/landing/marketing/Sponsors'
import Disclaimer from '@/landing/marketing/Disclaimer'

const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: 'Trading', links: ['Multi-Asset Brokerage', 'Global Custody', 'Structured Products', 'Depositary Services'] },
  { heading: 'Forex & Treasury', links: ['Deliverable Forex', 'Swaps & Forwards', 'Precious Metals', 'Leveraged Forex'] },
  { heading: 'Digital Assets', links: ['Trading', 'Custody'] },
  { heading: 'Technology', links: ['Trading Platform', 'SQX', 'Trading APIs', 'Forex APIs'] },
]

export const metadata = {
  title: 'Collaboration — SwissCresta',
  description: 'Closeness. Bespoke services for institutional clients.',
}

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main>
        <CollabHero />
        <AddedValue />
        <Strategy />
        <CollabContact />
        <FollowUs />
        <FooterLinks columns={FOOTER_COLUMNS} align="left" />
        <Sponsors />
      </main>
      <Disclaimer minimal />
    </div>
  )
}
