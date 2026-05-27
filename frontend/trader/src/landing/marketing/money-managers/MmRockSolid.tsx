import { type ReactNode } from 'react'
import { HEADING_SECTION } from '../ui/headings'

interface Column {
  title: string
  body: ReactNode
}

const COLUMNS: Column[] = [
  {
    title: 'Strength',
    body: (
      <>
        SwissCresta Group boasts a Tier 1 Capital ratio among the highest in the industry,
        ensuring its financial strength and resilience. View SwissCresta&apos;s latest{' '}
        <a
          href="#"
          className="text-indigo-500 hover:underline underline-offset-2 font-semibold"
        >
          financial reports
        </a>
        .
      </>
    ),
  },
  {
    title: 'Security',
    body: (
      <>
        SwissCresta Bank Ltd has held a banking and securities trading license since 2001, is
        supervised by FINMA and applies the highest Swiss banking standards of security and
        service quality. For more information, see the section{' '}
        <a
          href="#"
          className="text-indigo-500 hover:underline underline-offset-2 font-semibold"
        >
          About Us
        </a>
        .
      </>
    ),
  },
  {
    title: 'Transparency',
    body: (
      <>
        SwissCresta Group (SQN) has been listed on the SIX Swiss Exchange since May 2000. This
        means that we are held to higher standards of transparency than most of our FX
        competitors, which aren&apos;t publicly listed.
      </>
    ),
  },
]

interface LogoChipProps {
  label: string
  className?: string
}

function LogoChip({ label, className = '' }: LogoChipProps) {
  return (
    <span className={`text-gray-600 text-sm md:text-base font-semibold tracking-wider ${className}`}>
      {label}
    </span>
  )
}

export default function MmRockSolid() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <h2 className={`${HEADING_SECTION} text-indigo-500 max-w-2xl`}>
          Rely on a rock solid partner
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-sm bg-indigo-500 inline-block" />
            <LogoChip label="SwissCresta" className="text-gray-900 font-bold" />
          </div>
          <LogoChip label="finma" />
          <LogoChip label="/IX" />
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900">{col.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{col.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
