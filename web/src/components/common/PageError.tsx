import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'

/** Shown by the page-level ErrorBoundary. Reloading also recovers from a stale chunk after a redeploy. */
export default function PageError() {
  const { t } = useTranslation()

  return (
    <section role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center lg:py-24">
      <h1 className="text-3xl font-bold text-navy">{t('errors.pageTitle')}</h1>
      <p className="mt-3 text-base text-muted-strong">{t('errors.pageBody')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-base font-semibold text-paper transition-colors hover:bg-ink"
      >
        <RotateCcw aria-hidden className="size-[18px]" />
        {t('errors.reload')}
      </button>
    </section>
  )
}
