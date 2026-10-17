import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer, Upload } from 'lucide-react'
import type { ModelSpec } from '../../types/models'
import { formatRupees } from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'
import Product3DViewer from '../product/Product3DViewer'

const paperStack: ModelSpec = { kind: 'paper', color: 'cat-pens', count: 5 }

export default function XeroxBanner() {
  const { t } = useTranslation()
  const { normalRate, bulkRate, bulkLimit, doubleSideRate, cardCopyRate, colorRate, laminationOnly, laminationWithCopy } =
    useSettings()

  return (
    <section aria-labelledby="xerox-title" className="bg-paper pb-10 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div
          data-hover-root
          className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-cream p-6 shadow-soft lg:flex-row lg:p-10"
        >
          <div className="flex max-w-xl flex-col">
            <p className="mb-3 inline-flex items-center gap-2 self-start rounded-full bg-paper px-3 py-1 text-[13px] font-semibold text-saffron-text shadow-soft">
              <Printer aria-hidden className="size-4" />
              {t('xerox.chip')}
            </p>

            <h2 id="xerox-title" className="mb-2 text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
              {t('xerox.title')}
            </h2>

            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[28px] leading-9 font-bold text-saffron-text lg:text-[32px]">
                {t('xerox.rate', { price: formatRupees(normalRate) })}
              </span>
              <span className="text-base font-semibold text-muted-strong">
                {t('xerox.bulk', { price: formatRupees(bulkRate), count: bulkLimit })}
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-base text-ink">
              <li>{t('xerox.doubleSide', { price: formatRupees(doubleSideRate) })}</li>
              <li>{t('xerox.cardCopy', { price: formatRupees(cardCopyRate) })}</li>
              <li>
                {t('xerox.lamination', {
                  only: formatRupees(laminationOnly),
                  withCopy: formatRupees(laminationWithCopy),
                })}
              </li>
              <li>{t('xerox.colour', { price: formatRupees(colorRate) })}</li>
            </ul>

            <p className="mt-2 mb-6 text-base text-muted-strong">{t('xerox.body')}</p>

            <Link
              to="/xerox"
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-navy px-7 text-base font-semibold text-paper shadow-lift transition-colors hover:bg-ink"
            >
              <Upload aria-hidden className="size-5" />
              {t('xerox.cta')}
            </Link>
          </div>

          <div className="relative h-64 w-full max-w-md lg:h-72">
            <div aria-hidden className="absolute inset-8 rounded-full bg-soft-saffron/40 blur-2xl" />
            <Product3DViewer model={paperStack} label={t('common.model3d', { name: t('xerox.modelLabel') })} />
          </div>
        </div>
      </div>
    </section>
  )
}
