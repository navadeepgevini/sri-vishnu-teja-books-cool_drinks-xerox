import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, FileText, Rotate3d, Smartphone, Zap } from 'lucide-react'
import { formatRupees } from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'
import Product3DViewer from '../product/Product3DViewer'

export default function Hero() {
  const { t } = useTranslation()
  const { bulkRate } = useSettings()
  const chips = [
    { icon: Zap, text: t('hero.chipPickup') },
    { icon: FileText, text: t('hero.chipBulk', { price: formatRupees(bulkRate) }) },
    { icon: Smartphone, text: t('hero.chipUpi') },
  ]

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Powder-blue wall over a sand floor, as in the Stitch design. */}
      <div aria-hidden className="absolute inset-0 flex flex-col">
        <div className="h-[62%] bg-powder" />
        <div className="flex-1 bg-sand" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-12 lg:px-10 lg:py-20">
        <div className="flex flex-col lg:col-span-6">
          <p className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-paper px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-navy uppercase shadow-soft">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-saffron" />
            {t('hero.eyebrow')}
          </p>

          <h1
            id="hero-title"
            className="mb-4 text-[30px] leading-[38px] font-bold tracking-tight text-navy lg:text-[44px] lg:leading-[52px]"
          >
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
          </h1>

          <p className="mb-6 max-w-lg text-base text-muted-strong lg:text-lg">{t('hero.subtitle')}</p>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link
              to="/xerox"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-7 text-base font-semibold text-paper shadow-lift transition-colors hover:bg-ink"
            >
              {t('hero.ctaXerox')}
              <ArrowRight aria-hidden className="size-[18px]" />
            </Link>
            <a
              href="#categories"
              className="inline-flex min-h-12 items-center rounded-full bg-paper px-7 text-base font-semibold text-navy shadow-soft transition-colors hover:bg-soft-paper"
            >
              {t('hero.ctaShop')}
            </a>
          </div>

          <ul className="flex flex-wrap gap-2.5">
            {chips.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink shadow-soft"
              >
                <Icon aria-hidden className="size-4 text-saffron-text" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[340px] sm:h-[420px] lg:col-span-6 lg:h-[520px]">
          <p className="pointer-events-none absolute top-2 right-2 z-40 inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-navy shadow-lift lg:top-4 lg:right-4">
            <Rotate3d aria-hidden className="size-[18px] text-saffron-text" />
            {t('hero.stageBadge')}
          </p>
          <Product3DViewer model="hero" label={t('hero.stageLabel')} autoRotate="visible" />
        </div>
      </div>
    </section>
  )
}
