import Eyebrow from './ui/Eyebrow'
import ExploreLink from './ui/ExploreLink'
import ImagePlaceholder from './ui/ImagePlaceholder'
import { HEADING_SECTION } from './ui/headings'

export default function AboutUs() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <Eyebrow>About us</Eyebrow>
            <h2 className={`mt-4 ${HEADING_SECTION}`}>Swiss bank. But not dusty.</h2>
            <p className="mt-6 text-base text-gray-600 leading-relaxed">
              By reverse-engineering the banking system and providing the stability of a bank
              listed on the Swiss stock exchange, we empower you by taking control of your
              finances and achieve your goals.
            </p>
            <div className="mt-6">
              <ExploreLink>Learn more</ExploreLink>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <ImagePlaceholder
              className="w-full max-w-lg aspect-[5/4]"
              rounded="rounded-2xl"
              label="Building"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
