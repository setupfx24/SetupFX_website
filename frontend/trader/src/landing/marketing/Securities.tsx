'use client'

import Eyebrow from './ui/Eyebrow'
import ExploreLink from './ui/ExploreLink'
import { HEADING_SECTION } from './ui/headings'
import { useLang } from '@/landing/i18n/LangProvider'

export default function Securities() {
  const { t } = useLang()
  return (
    <section className="bg-white">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow className="text-center">{t('securities.eyebrow')}</Eyebrow>
          <h2 className={`mt-4 ${HEADING_SECTION}`}>
            {t('securities.titleA')}{' '}
            <span className="text-[#E94E1B]">{t('securities.titleB')}</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-gray-700 leading-relaxed">
            {t('securities.lead')}
          </p>
          <p className="mt-4 text-xs italic text-gray-600">{t('securities.regulated')}</p>
          <div className="mt-6 flex justify-center">
            <ExploreLink>{t('securities.explore')}</ExploreLink>
          </div>
        </div>
      </div>
    </section>
  )
}
