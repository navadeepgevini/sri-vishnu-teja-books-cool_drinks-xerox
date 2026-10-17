import { useTranslation } from 'react-i18next'
import { BadgeCheck, Mail, MessageCircle, Phone } from 'lucide-react'
import { formatTime, telHref, whatsappHref } from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'

export default function Footer() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const settings = useSettings()

  return (
    <footer className="border-t border-border bg-soft-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="flex flex-col gap-2 md:col-span-5">
            <h2 className="text-lg font-semibold text-navy">{t('shop.fullName')}</h2>
            <p className="max-w-sm text-base text-muted-strong">{t('shop.address')}</p>
            <p className="text-base text-ink">{t('footer.owner', { name: t('shop.owner') })}</p>
            <a
              href={`mailto:${t('shop.email')}`}
              className="inline-flex w-fit items-center gap-2 text-base break-all text-navy underline underline-offset-2"
            >
              <Mail aria-hidden className="size-[18px] shrink-0 text-saffron-text" />
              {t('shop.email')}
            </a>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-success-text">
              <span aria-hidden className="size-2 rounded-full bg-success" />
              {t('footer.hours', {
                open: formatTime(settings.openTime, lang),
                close: formatTime(settings.closeTime, lang),
              })}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 md:col-span-4">
            <h2 className="text-[13px] font-semibold tracking-wider text-muted-strong uppercase">
              {t('footer.contactTitle')}
            </h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={telHref(settings.phone)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-paper px-4 text-base font-semibold text-navy transition-colors hover:bg-cream"
              >
                <Phone aria-hidden className="size-[18px] text-saffron-text" />
                {t('footer.call')}
              </a>
              <a
                href={whatsappHref(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-base font-semibold text-paper transition-colors hover:bg-ink"
              >
                <MessageCircle aria-hidden className="size-[18px]" />
                {t('footer.whatsapp')}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-border bg-cream p-4 md:col-span-3">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-saffron-text">
              <BadgeCheck aria-hidden className="size-[18px]" />
              {t('footer.promiseTitle')}
            </p>
            <p className="text-sm text-muted-strong">{t('footer.promiseBody')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-sm text-muted-strong sm:flex-row">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p>{t('footer.serving')}</p>
        </div>
      </div>
    </footer>
  )
}
