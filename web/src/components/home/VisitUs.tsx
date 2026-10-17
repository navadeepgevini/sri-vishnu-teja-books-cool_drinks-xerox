import { useTranslation } from 'react-i18next'
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Navigation, Phone, Store, UserRound } from 'lucide-react'
import {
  SHOP_LOCATION,
  directionsUrl,
  formatPhone,
  formatTime,
  mapEmbedUrl,
  telHref,
  whatsappHref,
} from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'
import OpenBadge from '../common/OpenBadge'

const secondaryButton =
  'inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-navy bg-paper px-5 text-base font-semibold text-navy transition-colors hover:bg-cream'

export default function VisitUs() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const settings = useSettings()

  return (
    <section id="visit" aria-labelledby="visit-title" className="scroll-mt-24 bg-paper pb-10 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="grid gap-6 rounded-3xl border border-border bg-soft-paper p-6 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-7">
            <p className="text-[13px] font-semibold tracking-wider text-saffron-text uppercase">{t('visit.eyebrow')}</p>
            <h2 id="visit-title" className="mt-1 mb-6 text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
              {t('visit.title')}
            </h2>

            <div className="flex gap-3">
              <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-saffron-text" />
              <dl>
                <dt className="text-[13px] font-semibold tracking-wider text-muted-strong uppercase">
                  {t('visit.addressLabel')}
                </dt>
                <dd className="text-base text-ink">
                  <span className="font-semibold">{t('shop.fullName')}</span>
                  <br />
                  {t('shop.address')}
                </dd>
              </dl>
            </div>

            <div className="mt-4 flex gap-3">
              <UserRound aria-hidden className="mt-1 size-5 shrink-0 text-saffron-text" />
              <dl>
                <dt className="text-[13px] font-semibold tracking-wider text-muted-strong uppercase">
                  {t('visit.ownerLabel')}
                </dt>
                <dd className="text-base text-ink">{t('shop.owner')}</dd>
              </dl>
            </div>

            <div className="mt-4 flex gap-3">
              <Mail aria-hidden className="mt-1 size-5 shrink-0 text-saffron-text" />
              <dl>
                <dt className="text-[13px] font-semibold tracking-wider text-muted-strong uppercase">
                  {t('visit.emailLabel')}
                </dt>
                <dd className="text-base">
                  <a href={`mailto:${t('shop.email')}`} className="break-all text-navy underline underline-offset-2">
                    {t('shop.email')}
                  </a>
                </dd>
              </dl>
            </div>

            <div className="mt-4 flex gap-3">
              <Clock aria-hidden className="mt-1 size-5 shrink-0 text-saffron-text" />
              <dl>
                <dt className="text-[13px] font-semibold tracking-wider text-muted-strong uppercase">
                  {t('visit.hoursLabel')}
                </dt>
                <dd className="flex flex-wrap items-center gap-2 text-base text-ink">
                  {t('shop.hoursDaily', {
                    open: formatTime(settings.openTime, lang),
                    close: formatTime(settings.closeTime, lang),
                  })}
                  <OpenBadge />
                </dd>
              </dl>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telHref(settings.phone)} className={secondaryButton}>
                <Phone aria-hidden className="size-[18px] text-saffron-text" />
                {t('visit.call', { phone: formatPhone(settings.phone) })}
              </a>
              <a
                href={whatsappHref(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 text-base font-semibold text-paper transition-colors hover:bg-ink"
              >
                <MessageCircle aria-hidden className="size-[18px]" />
                {t('visit.whatsapp')}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
              <a href={directionsUrl()} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                <Navigation aria-hidden className="size-[18px] text-saffron-text" />
                {t('visit.directions')}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
              <a href={SHOP_LOCATION.placeUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                <ExternalLink aria-hidden className="size-[18px] text-saffron-text" />
                {t('visit.maps')}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Interactive Google map (free embed, no API key). Loads only when scrolled near. */}
            <div className="relative h-72 overflow-hidden rounded-2xl border border-border bg-powder sm:h-80 lg:h-full lg:min-h-80">
              <iframe
                src={mapEmbedUrl()}
                title={t('visit.mapTitle')}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>
            <div className="flex gap-3 rounded-2xl border border-border bg-cream p-4">
              <Store aria-hidden className="size-7 shrink-0 text-saffron-text" />
              <div>
                <h3 className="text-lg font-semibold text-navy">{t('visit.pickupTitle')}</h3>
                <p className="text-base text-muted-strong">{t('visit.pickupBody')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
