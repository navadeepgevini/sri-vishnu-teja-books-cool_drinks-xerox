import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RequireSignIn from '../components/common/RequireSignIn'

export default function OrderStatus() {
  const { t } = useTranslation()

  return (
    <RequireSignIn>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:py-24">
        <h1 className="text-3xl font-bold text-navy">{t('pages.orderStatus.title')}</h1>
        <p className="mt-3 text-base text-muted-strong">{t('pages.orderStatus.body')}</p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-navy px-6 text-base font-semibold text-paper transition-colors hover:bg-ink"
        >
          {t('common.backHome')}
        </Link>
      </section>
    </RequireSignIn>
  )
}
