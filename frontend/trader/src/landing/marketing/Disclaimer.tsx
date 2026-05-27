import Image from 'next/image'

interface DisclaimerProps {
  minimal?: boolean
}

const BOTTOM_LINKS = [
  'Website & App Privacy Policy',
  'Legal Information',
  'Vulnerability Disclosure',
] as const

export default function Disclaimer({ minimal = false }: DisclaimerProps) {
  return (
    <footer className="bg-gray-900 text-[#9A9A9A] text-xs">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16">
        <div className="mb-8">
          <Image
            src="/marketing/logo.png"
            alt="SwissCresta"
            width={176}
            height={40}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        {!minimal && (
          <>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Be aware of the risk
            </h3>
            <p className="mt-4 leading-relaxed max-w-5xl">
              Trading leveraged products on the Forex platform, such as foreign exchange, spot
              precious metals and Contracts for Difference (CFDs), involves significant risk of
              loss due to the leverage and may not be suitable for all investors. Prior to opening
              an account with SwissCresta, consider your level of experience, investment
              objectives, assets, income and risk appetite. Losses are in theory unlimited and may
              be required to make additional payments if your account balance falls below the
              margin required. Open leveraged positions also incur rolling, financing, and other
              fees. The market data on this site is for informational purposes only and is sourced
              from third parties believed reliable; SwissCresta makes no guarantees as to accuracy
              and may delay or interrupt data delivery without notice. The closing of a position
              is treated as a market order at the current bid or ask price. There may be slippage
              on the resulting fill price, especially in volatile market conditions. Past
              performance is not indicative of future results. Before you decide to engage in
              margin trading, you should carefully consider whether such trading is appropriate
              for you given your investment experience, objectives, financial resources and other
              personal circumstances. Please consult an independent financial advisor if you have
              any doubts. For more details, including information on the leverage offered, fees
              and margin requirements, as well as information on cost of trading, please refer to
              our official documentation.
            </p>
          </>
        )}

        <div
          className={`${minimal ? '' : 'mt-10'} pt-6 ${minimal ? '' : 'border-t border-white/10'} flex flex-col md:flex-row md:items-center md:justify-between gap-3`}
        >
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {BOTTOM_LINKS.map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="text-right">© SwissCresta 2026. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
