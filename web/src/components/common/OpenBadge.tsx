import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatTime, isOpenNow } from '../../data/shop'
import { useSettings } from '../../hooks/useSettings'

export default function OpenBadge({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const settings = useSettings()
  const [, setTick] = useState(0)

  // Re-evaluate every minute so the badge flips at opening and closing time.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const open = isOpenNow(settings)
  const label = open
    ? t('open.now')
    : settings.forceClosed
      ? t('open.closedToday')
      : t('open.closed', { time: formatTime(settings.openTime, i18n.language) })

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-2.5 py-1 text-[13px] font-semibold ${open ? 'text-success-text' : 'text-ink'} ${className}`}
    >
      <span aria-hidden className={`size-2 rounded-full ${open ? 'bg-success' : 'bg-error'}`} />
      {label}
    </span>
  )
}
