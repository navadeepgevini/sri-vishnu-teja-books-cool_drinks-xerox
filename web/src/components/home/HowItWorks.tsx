import { useTranslation } from 'react-i18next'
import { FileUp, QrCode, Store } from 'lucide-react'

const steps = [
  { id: 'order', icon: FileUp, tile: 'bg-navy text-paper', note: 'text-saffron-text' },
  // Saffron fill: ink icon only.
  { id: 'pay', icon: QrCode, tile: 'bg-saffron text-ink', note: 'text-saffron-text' },
  { id: 'collect', icon: Store, tile: 'bg-success-text text-paper', note: 'text-success-text' },
]

export default function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="how-title" className="bg-paper py-10 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-[13px] font-semibold tracking-wider text-saffron-text uppercase">{t('how.eyebrow')}</p>
          <h2 id="how-title" className="mt-1 text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
            {t('how.title')}
          </h2>
          <p className="mt-2 text-base text-muted-strong">{t('how.subtitle')}</p>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ id, icon: Icon, tile, note }, index) => (
            <li key={id} className="flex flex-col rounded-2xl bg-soft-paper p-6 shadow-soft lg:p-8">
              <span className={`mb-4 inline-flex size-14 items-center justify-center rounded-2xl ${tile}`}>
                <Icon aria-hidden className="size-7" />
              </span>
              <span aria-hidden className="mb-1 text-[22px] leading-7 font-bold tracking-wider text-saffron-text">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mb-2 text-2xl font-semibold text-navy">{t(`how.${id}.title`)}</h3>
              <p className="text-base text-muted-strong">{t(`how.${id}.body`)}</p>
              <p className={`mt-4 text-sm font-semibold ${note}`}>{t(`how.${id}.note`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
