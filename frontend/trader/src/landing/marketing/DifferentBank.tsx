import ExploreLink from './ui/ExploreLink'
import { HEADING_SECTION } from './ui/headings'

const ASSET_CARDS = ['Precious Metals', 'Currency Pairs', 'CFDs'] as const

export default function DifferentBank() {
  return (
    <section className="bg-white">
      <div className="w-full px-6 md:px-10 lg:px-16 py-12 md:py-16">
        <div className="bg-gray-50 rounded-[2rem] px-6 md:px-10 lg:px-20 py-14 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={HEADING_SECTION}>The Bank to do things differently</h2>
            <p className="mt-6 text-base text-gray-600 leading-relaxed">
              Elevate your finances from the comfort and security of a Swiss banking group, without
              overpaying for it. A world of opportunities rounded up by our highly-intuitive
              platforms, ever-flowing educational material and a Customer Care team who accompany
              you every step of the way.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {ASSET_CARDS.map((card) => (
              <div
                key={card}
                className="bg-white rounded-xl p-7 md:p-8 flex flex-col gap-4 border border-gray-200/60"
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{card}</h3>
                <ExploreLink className="text-base">Explore</ExploreLink>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
