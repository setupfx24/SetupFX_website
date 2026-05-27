import Button from './ui/Button'
import ImagePlaceholder from './ui/ImagePlaceholder'
import { HEADING_SECTION } from './ui/headings'

interface Step {
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    title: 'Fill in the application form',
    body: 'Make your choice among 4 trading platforms: CFXD/TradingView, MetaTrader 4, MetaTrader 5.',
  },
  {
    title: 'Provide your ID document',
    body: 'Make sure to have an ID document at hand (passport, ID card), as well as a proof of residence no older than 6 months.',
  },
  {
    title: 'Add funds',
    body: 'Transfer the amount of your choice to your new account and start your upgraded financial journey!',
  },
]

export default function Steps() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 className={HEADING_SECTION}>3 steps and a few minutes suffice</h2>

            <ol className="mt-10 space-y-6">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className={`pl-5 ${i === 0 ? 'border-l-2 border-[#E94E1B]' : 'border-l-2 border-gray-200'}`}
                >
                  <h3 className="text-base font-bold text-gray-900">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <Button variant="primary">Open your account</Button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <ImagePlaceholder
              className="w-full max-w-md aspect-[5/4]"
              rounded="rounded-2xl"
              label="Devices"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
