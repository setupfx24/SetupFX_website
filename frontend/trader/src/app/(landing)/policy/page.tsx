import Link from 'next/link'
import { Shield, FileText, AlertTriangle, BugPlay, ArrowRight, Scale } from 'lucide-react'

export const metadata = {
  title: 'Policies & Legal — SwissCresta',
  description:
    'Privacy, terms of service, risk disclosure, and vulnerability reporting policies for SwissCresta clients and partners.',
}

const DOCS = [
  {
    icon: Shield,
    title: 'Privacy Policy',
    body: 'How we collect, store, and process your personal data — and the rights you have under Swiss and EU/UK data-protection law.',
    href: '/privacy',
  },
  {
    icon: FileText,
    title: 'Terms of Service',
    body: 'The agreement that governs your use of the SwissCresta platform, the trading account, and our public marketing site.',
    href: '/terms',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Disclosure',
    body: 'Full disclosure of the risks associated with leveraged trading, margin requirements, and CFD-specific considerations.',
    href: '/risk',
  },
  {
    icon: BugPlay,
    title: 'Vulnerability Disclosure',
    body: 'How to report a security issue responsibly. We answer every legitimate report and credit researchers when appropriate.',
    href: '/privacy#vulnerability',
  },
]

const REGULATORY = [
  {
    label: 'Client funds segregation',
    body: 'Client money is held in segregated accounts at our banking partners, separated from corporate funds.',
  },
  {
    label: 'AML / KYC',
    body: 'Onboarding, transaction monitoring, and politically-exposed-person screening aligned with industry standards.',
  },
]

export default function PolicyPage() {
  return (
    <div className="bg-white text-gray-900">
      <section className="bg-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="w-full px-3 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E94E1B]">
            Policies & Legal
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.05]">
            Clear rules.<br />
            <span className="text-[#E94E1B]">No fine-print games.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Every document below is the actual contract you’re entering into. Read them in
            full before opening an account — and reach out to{' '}
            <Link href="/contact" className="text-[#E94E1B] font-semibold underline-offset-4 hover:underline">
              legal@swisscresta.com
            </Link>{' '}
            if anything is unclear.
          </p>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DOCS.map(({ icon: Icon, title, body, href }) => (
              <Link
                key={title}
                href={href}
                className="group bg-gray-50 hover:bg-white rounded-2xl p-7 md:p-8 border border-gray-200/60 hover:border-[#E94E1B]/40 hover:shadow-lg transition-all flex flex-col gap-4"
              >
                <span className="w-12 h-12 rounded-xl bg-[#E94E1B]/10 text-[#E94E1B] flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </span>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[#E94E1B] group-hover:gap-2 transition-all">
                  Read the document <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Scale className="w-10 h-10 text-[#E94E1B] mx-auto" strokeWidth={1.5} />
            <h2 className="mt-4 text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
              Regulatory framework
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-600">
              SwissCresta operates under a multi-jurisdictional licensing structure designed for
              both retail and professional clients.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {REGULATORY.map((row) => (
              <div key={row.label} className="bg-white rounded-2xl p-7 border border-gray-200/60">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#E94E1B]">
                  {row.label}
                </h3>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{row.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
            Something not clear?
          </h2>
          <p className="mt-4 text-base text-gray-700">
            We&apos;d rather you ask first than be surprised later. Compliance and legal teams
            both respond within two business days.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#E94E1B] hover:bg-[#C73E11] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Contact compliance
            </Link>
            <Link
              href="/risk"
              className="inline-flex items-center gap-2 border border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Read the risk disclosure
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
