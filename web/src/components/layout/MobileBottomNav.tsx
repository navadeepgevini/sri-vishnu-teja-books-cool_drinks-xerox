import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ClipboardList, House, Printer, ShoppingBag, Store } from 'lucide-react'
import { cartCount, useCart } from '../../lib/cart'

const items = [
  { to: '/', icon: House, key: 'nav.home', end: true },
  { to: '/shop', icon: Store, key: 'nav.shop', end: false },
  { to: '/xerox', icon: Printer, key: 'nav.xeroxShort', end: false },
  { to: '/cart', icon: ShoppingBag, key: 'nav.cart', end: false },
  { to: '/order-status', icon: ClipboardList, key: 'nav.orders', end: false },
]

export default function MobileBottomNav() {
  const { t } = useTranslation()
  const itemsInCart = cartCount(useCart())

  return (
    <nav
      aria-label={t('nav.mobile')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, icon: Icon, key, end }) => {
          const badge = to === '/cart' && itemsInCart > 0 ? itemsInCart : 0
          return (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[13px] ${
                    isActive ? 'font-semibold text-navy' : 'font-medium text-muted-strong'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <Icon aria-hidden className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                      {badge > 0 && (
                        <span
                          aria-hidden
                          className="absolute -top-2 -right-3 h-[18px] min-w-[18px] rounded-full bg-saffron px-1 text-center text-[11px] leading-[18px] font-bold text-ink"
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </span>
                    <span>
                      {t(key)}
                      {badge > 0 && <span className="sr-only">, {t('cart.items', { count: badge })}</span>}
                    </span>
                    <span aria-hidden className={`h-0.5 w-6 rounded-full ${isActive ? 'bg-saffron' : 'bg-transparent'}`} />
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
