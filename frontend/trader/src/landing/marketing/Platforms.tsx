import Image from 'next/image'
import Eyebrow from './ui/Eyebrow'
import ExploreLink from './ui/ExploreLink'
import { HEADING_SECTION } from './ui/headings'

export default function Platforms() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>Platforms</Eyebrow>
          <h2 className={`mt-4 ${HEADING_SECTION}`}>Your aspirations deserve the best</h2>
        </div>

        <div className="relative mt-12 md:mt-16 max-w-4xl mx-auto">
          <Image
            src="/marketing/banner-1.png"
            alt="Trading platform"
            width={900}
            height={562}
            className="w-full aspect-[16/10] object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, 896px"
          />

          <div className="hidden md:block absolute -top-6 -right-4 lg:-right-10 w-44 bg-white shadow-lg rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">AAPL</span>
              <span className="text-[10px] text-gray-600">Apple Inc.</span>
            </div>
            <div className="mt-2 text-lg font-bold">298.87</div>
            <div className="text-xs font-semibold text-[#E94E1B]">USD +1.28%</div>
            <div className="mt-3 h-8 bg-gray-100 rounded" />
          </div>

          <div className="hidden md:block absolute -bottom-6 -left-4 lg:-left-10 w-44 bg-white shadow-lg rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">EUR/USD</span>
              <span className="text-[10px] text-gray-600">Euro vs USD</span>
            </div>
            <div className="mt-2 text-lg font-bold">1.1719</div>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] px-2 py-1 rounded bg-[#E94E1B] text-white font-semibold">
                Buy
              </span>
              <span className="text-[10px] px-2 py-1 rounded bg-gray-900 text-white font-semibold">
                Sell
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-base text-gray-600">
            World-class innovation. Unwavering execution. Radical intuitiveness.
          </p>
          <div className="mt-4 flex justify-center">
            <ExploreLink>Explore</ExploreLink>
          </div>
        </div>
      </div>
    </section>
  )
}
