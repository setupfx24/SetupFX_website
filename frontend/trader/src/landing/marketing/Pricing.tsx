import { ChevronLeft, ChevronRight } from 'lucide-react'
import Eyebrow from './ui/Eyebrow'
import ExploreLink from './ui/ExploreLink'
import { HEADING_SECTION, TEXT_STAT } from './ui/headings'

const PRICING_CARDS = ['Forex Trading conditions', 'Account types', 'Execution']

export default function Pricing() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="bg-gray-50 rounded-[2rem] px-8 py-14 md:py-20 flex flex-col items-center justify-center text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">Spreads from</div>
            <div className={`${TEXT_STAT} text-[#E94E1B] mt-2 leading-none`}>1.1</div>
            <div className="text-xl md:text-2xl font-extrabold text-gray-900 mt-2">pips</div>
          </div>

          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className={`mt-4 ${HEADING_SECTION}`}>Exasperated by hidden banking fees?</h2>
            <p className="mt-5 text-base text-gray-600">
              Us too. Our prices are trustworthy, little-seen and oh-so-fair.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PRICING_CARDS.map((card) => (
                <div
                  key={card}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
                >
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{card}</h3>
                  <ExploreLink>Explore</ExploreLink>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                aria-label="Previous"
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                aria-label="Next"
                className="w-9 h-9 rounded-full bg-[#E94E1B] text-white flex items-center justify-center hover:bg-[#E94E1B] transition-colors"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
