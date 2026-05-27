import Button from './ui/Button'
import { TEXT_DISPLAY } from './ui/headings'

export default function Hero() {
  return (
    <section className="relative bg-white overflow-x-clip">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 relative pt-4 md:pt-6 lg:pt-8 pb-16 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="md:col-span-7 lg:col-span-7 relative z-10 md:pl-6 lg:pl-12">
            <h1 className={`${TEXT_DISPLAY} text-[#E94E1B]`}>Unlimited.</h1>
            <p className="mt-6 text-lg md:text-xl font-semibold text-gray-900 max-w-xl">
              Trade with Swiss leader in digital banking.
            </p>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-md">
              Unleash your financial potential with Swiss know-how and high-class execution.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary">Open your account</Button>
              <Button variant="outline">Try a demo</Button>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[680px] aspect-[5/4]">
              <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-md">
                <div className="absolute inset-0 marketing-sell-panel" />
                <div className="absolute inset-0 marketing-sell-dots" />
                <div className="absolute inset-x-0 top-0 h-[10%] bg-[#1f1f1f]" />
                <div className="absolute inset-x-0 top-[9%] h-2 marketing-sell-stripes" />
                <span className="marketing-sell-text absolute select-none font-extrabold text-[#1f1f1f] leading-none">
                  SELL
                </span>
              </div>

              <div
                className="absolute z-10"
                style={{ left: '5%', top: '30%', bottom: '-12%', width: '22%' }}
              >
                <div className="relative w-full h-full bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl overflow-hidden">
                  <span
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-900/20"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-3 mt-5 bg-gray-50 rounded-[1.75rem] flex flex-col gap-2 p-3">
                    <span className="h-3 rounded bg-gray-200 w-2/3" />
                    <span className="h-2 rounded bg-gray-200 w-1/2" />
                    <span className="flex-1 rounded-lg bg-white border border-gray-200" />
                    <span className="h-2 rounded bg-gray-200 w-3/4" />
                    <span className="h-2 rounded bg-gray-200 w-2/3" />
                  </div>
                  <span
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full bg-gray-900/20"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marketing-sell-panel {
          background:
            linear-gradient(160deg, #d6d4d2 0%, #b9b6b3 45%, #8f8c89 100%);
        }
        .marketing-sell-dots {
          background-image: radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1.4px);
          background-size: 6px 6px;
          mix-blend-mode: multiply;
          opacity: 0.55;
        }
        .marketing-sell-stripes {
          background-image: repeating-linear-gradient(
            115deg,
            #111 0,
            #111 10px,
            #fff 10px,
            #fff 20px
          );
        }
        .marketing-sell-text {
          font-size: clamp(5rem, 11vw, 9rem);
          letter-spacing: -0.04em;
          transform: rotate(-7deg);
          right: -6%;
          top: 22%;
          text-shadow: 0 2px 0 rgba(0,0,0,0.04);
        }
      `}</style>
    </section>
  )
}
