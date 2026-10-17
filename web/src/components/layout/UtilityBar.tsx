import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from 'lucide-react'
import { formatPhone, formatTime, whatsappHref } from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'
import OpenBadge from '../common/OpenBadge'

export default function UtilityBar() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const settings = useSettings()

  return (
    <div className="bg-navy text-paper">
      <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-3 px-4 lg:px-10">
        <a
          href={whatsappHref(settings.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-soft-saffron"
        >
          <MessageCircle aria-hidden className="size-4 text-soft-saffron" />
          <span className="sr-only">{t('utility.whatsapp')}: </span>
          {formatPhone(settings.whatsapp)}
          <span className="sr-only"> {t('common.newTab')}</span>
        </a>

        <div className="hidden items-center gap-3 text-sm md:flex">
          <OpenBadge />
          <span>
            {t('shop.hoursDaily', {
              open: formatTime(settings.openTime, lang),
              close: formatTime(settings.closeTime, lang),
            })}
          </span>
          <span aria-hidden className="text-sand">
            ·
          </span>
          <Link
            to="/xerox"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-soft-saffron hover:underline"
          >
            {t('utility.uploadXerox')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
