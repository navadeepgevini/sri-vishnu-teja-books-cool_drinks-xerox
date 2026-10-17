import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingBag } from 'lucide-react'
import AccountButton from '../common/AccountButton'
import { cartCount, useCart } from '../../lib/cart'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-base font-semibold transition-colors ${
    isActive ? 'bg-soft-paper text-navy' : 'text-ink hover:bg-soft-paper'
  }`

// No display class here: each use adds its own (inline-flex, or responsive hidden/inline-flex).
const iconButton = 'size-11 items-center justify-center rounded-full bg-soft-paper text-navy transition-colors hover:bg-border'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const currentQuery = params.get('q') ?? ''
  const itemsInCart = cartCount(useCart())

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    // TODO: real search — for now this only navigates to the placeholder Shop page.
    navigate({ pathname: '/shop', search: q ? `?${new URLSearchParams({ q })}` : '' })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-20 lg:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-soft-paper px-2.5 py-1.5"
        >
          <img src="/logo.svg" alt="" width={40} height={40} className="size-9 lg:size-10" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-navy">{t('shop.name')}</span>
            <span className="text-[13px] font-medium text-muted-strong">{t('shop.tagline')}</span>
          </span>
        </Link>

        <form role="search" onSubmit={onSearch} className="hidden max-w-md flex-1 xl:flex">
          <label htmlFor="site-search" className="sr-only">
            {t('search.label')}
          </label>
          <div className="relative w-full">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-strong" />
            <input
              id="site-search"
              name="q"
              type="search"
              key={currentQuery}
              defaultValue={currentQuery}
              placeholder={t('search.placeholder')}
              className="h-11 w-full rounded-xl border border-border bg-soft-paper pr-4 pl-10 text-base text-ink transition-colors placeholder:text-muted-strong focus:border-navy focus:bg-paper"
            />
          </div>
          <button type="submit" className="sr-only">
            {t('search.submit')}
          </button>
        </form>

        <nav aria-label={t('nav.main')} className="hidden items-center gap-1 lg:flex">
          <NavLink to="/shop" className={linkClass}>
            {t('nav.shop')}
          </NavLink>
          <NavLink to="/xerox" className={linkClass}>
            {t('nav.xerox')}
          </NavLink>
          <Link to={{ pathname: '/', hash: '#popular' }} className={linkClass({ isActive: false })}>
            {t('nav.popular')}
          </Link>
          <NavLink to="/order-status" className={linkClass}>
            {t('nav.orderStatus')}
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Phones: search lives at the top of the Shop page (the navbar has no room). */}
          <Link to="/shop" className={`${iconButton} hidden sm:inline-flex xl:hidden`}>
            <Search aria-hidden className="size-5" />
            <span className="sr-only">{t('search.submit')}</span>
          </Link>
          <Link to="/cart" className={`${iconButton} relative inline-flex`}>
            <ShoppingBag aria-hidden className="size-[22px]" />
            {itemsInCart > 0 && (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-saffron px-1 text-center text-[13px] leading-5 font-bold text-ink"
              >
                {itemsInCart > 99 ? '99+' : itemsInCart}
              </span>
            )}
            <span className="sr-only">
              {t('nav.cart')}
              {itemsInCart > 0 && `, ${t('cart.items', { count: itemsInCart })}`}
            </span>
          </Link>
          <AccountButton />
        </div>
      </div>
    </header>
  )
}
