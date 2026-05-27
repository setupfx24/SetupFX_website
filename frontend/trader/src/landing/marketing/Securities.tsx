import Eyebrow from './ui/Eyebrow'
import ExploreLink from './ui/ExploreLink'
import ImagePlaceholder from './ui/ImagePlaceholder'
import { HEADING_SECTION } from './ui/headings'

export default function Securities() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <Eyebrow>Securities</Eyebrow>
            <h2 className={`mt-4 ${HEADING_SECTION}`}>The most instrumental of financial instruments</h2>
            <p className="mt-6 text-base text-gray-600 leading-relaxed">
              Stocks, ETFs, funds, bonds, options &amp; futures, derivatives — you name it. Every
              keystone of the trading realm, within your reach for a financially sound portfolio.
            </p>
            <p className="mt-4 text-xs italic text-gray-600">
              *These products are offered by SwissCresta Bank Ltd, regulated by the Swiss Federal
              Financial Market Supervisory Authority (FINMA).
            </p>
            <div className="mt-6">
              <ExploreLink>Explore</ExploreLink>
            </div>
          </div>

          <div className="order-first md:order-last flex justify-center md:justify-end">
            <ImagePlaceholder
              className="w-full max-w-md aspect-[4/5]"
              rounded="rounded-2xl"
              label="Investor portrait"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
