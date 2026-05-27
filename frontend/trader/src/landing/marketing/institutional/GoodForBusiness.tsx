import Eyebrow from '../ui/Eyebrow'
import ExploreLink from '../ui/ExploreLink'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import { HEADING_SECTION } from '../ui/headings'

interface LogoChipProps {
  label: string
}

function LogoChip({ label }: LogoChipProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center h-32">
      <span className="text-gray-600 text-sm font-semibold tracking-wider">{label}</span>
    </div>
  )
}

export default function GoodForBusiness() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24">
        <Eyebrow>A Solid Partner</Eyebrow>
        <h2 className={`${HEADING_SECTION} mt-3 max-w-3xl`}>
          A bank that is good for your business is good for you
        </h2>
        <p className="mt-5 max-w-2xl text-gray-600 leading-relaxed">
          Since 1996, FINMA-regulated and a partner of the OpenWealth, SwissCresta offers
          solutions and corporations the guarantee of a prime bank that boasts strength, security
          and transparency.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl overflow-hidden bg-gray-50 flex flex-col">
            <ImagePlaceholder
              label="Architecture"
              className="w-full aspect-[16/9]"
              rounded="rounded-none"
            />
            <div className="p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900">Strength</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                SwissCresta Group boasts a Tier 1 Capital Ratio among the highest in the industry,
                ensuring its financial strength and resilience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <LogoChip label="openwealth" />
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900">Partnership</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The partnership with OpenWealthAssistant is to develop our API management
                solutions for client communication systems within financial services providers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <LogoChip label="SIX" />
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900">Transparency</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                SwissCresta Group (SQN) is listed on the SIX Swiss Exchange since May 2000. This
                means that we hold to higher standards of transparency than most Forex
                competitors not publicly listed.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-gray-50 flex flex-col md:flex-row">
            <div className="p-6 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-bold text-gray-900">Security</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                SwissCresta Bank Ltd holds a banking and securities trading license since 2001,
                is supervised by FINMA and applies to the highest Swiss banking standards of
                security and service quality.
              </p>
              <ExploreLink>See the website</ExploreLink>
            </div>
            <div className="md:w-1/3 bg-white border-l border-gray-200 flex items-center justify-center p-6">
              <span className="text-gray-600 text-sm font-semibold tracking-wider">finma</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
