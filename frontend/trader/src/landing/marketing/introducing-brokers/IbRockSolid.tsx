interface Pillar {
  title: string
  body: string
}

const PILLARS: Pillar[] = [
  {
    title: 'Strength',
    body: "SwissCresta Group boasts a Tier 1 Capital Ratio among the highest in the industry, ensuring its financial strength and resilience. View SwissCresta's latest financial reports.",
  },
  {
    title: 'Security',
    body: 'SwissCresta Bank Ltd holds a banking and securities trading license since 2001, is supervised by FINMA and applies the highest Swiss banking standards of security and service quality. For more information, see the section About Us.',
  },
  {
    title: 'Transparency',
    body: 'SwissCresta Group (SQN) is listed on the SIX Swiss Exchange since May 2000. This means that we hold to higher standards of transparency than most of our FX competitors, not publicly listed.',
  },
]

function LogoChip({ label }: { label: string }) {
  return (
    <div className="px-6 py-3 flex items-center justify-center">
      <span className="text-gray-600 text-sm font-semibold tracking-wider lowercase">{label}</span>
    </div>
  )
}

export default function IbRockSolid() {
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#E94E1B] text-center max-w-3xl mx-auto leading-tight">
          Rely on a rock-solid partner
        </h2>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <LogoChip label="SwissCresta" />
          <LogoChip label="finma" />
          <LogoChip label="SIX" />
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-gray-900">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
