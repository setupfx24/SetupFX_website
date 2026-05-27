'use client'

import Button from './ui/Button'
import { HEADING_SECTION } from './ui/headings'
import { useLang } from '@/landing/i18n/LangProvider'

const STEP_IDS = ['s1', 's2', 's3'] as const

export default function Steps() {
  const { t } = useLang()
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={HEADING_SECTION}>
            {t('steps.titleA')} <span className="text-[#E94E1B]">{t('steps.titleB')}</span>
          </h2>
        </div>

        <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEP_IDS.map((id, i) => (
            <li
              key={id}
              className="relative bg-gray-50 rounded-2xl p-7 md:p-8 border border-gray-200/60 hover:border-[#E94E1B]/40 hover:shadow-lg transition-all"
            >
              <div className="text-5xl font-extrabold text-[#E94E1B]/30 leading-none">
                0{i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{t(`steps.${id}.t`)}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(`steps.${id}.d`)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button variant="primary" href="/auth/register">
            {t('steps.cta')}
          </Button>
        </div>
      </div>
    </section>
  )
}
