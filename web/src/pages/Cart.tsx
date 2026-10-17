import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { cartCount, clearCart, removeFromCart, setQuantity, useCart } from '../lib/cart'
import { productModel } from '../lib/catalog'
import { formatRupees, whatsappHref } from '../data/shop'
import { useCatalog } from '../hooks/useCatalog'
import { useSettings } from '../hooks/useSettings'
import { isSignInCancelled, useAccount } from '../hooks/useAccount'
import Product3DViewer from '../components/product/Product3DViewer'
import ProductPhoto from '../components/product/ProductPhoto'
import { PRODUCT_IMAGES } from '../data/productImages'

const primaryButton =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-base font-semibold text-paper transition-colors hover:bg-ink'
const stepButton =
  'inline-flex size-11 items-center justify-center rounded-full text-navy transition-colors enabled:hover:bg-soft-paper disabled:cursor-not-allowed disabled:text-border'

export default function Cart() {
  const { t } = useTranslation()
  const items = useCart()
  const { products, priceState } = useCatalog()
  const settings = useSettings()
  const account = useAccount()
  const [signInFailed, setSignInFailed] = useState(false)

  // Re-price every line from the live catalogue; the price stored in the cart is only a fallback.
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines = items.map((item) => {
    const product = byId.get(item.productId)
    const variant = product?.variants.find((v) => v.id === item.variantId)
    // While the catalogue is loading or offline we can't tell, so keep the line and its saved price.
    const available = priceState !== 'shown' || Boolean(variant)
    const price = priceState === 'shown' && variant ? variant.price : item.price
    return { item, product, available, price, lineTotal: price * item.qty }
  })
  const orderLines = lines.filter((line) => line.available)
  const total = orderLines.reduce((sum, line) => sum + line.lineTotal, 0)
  const count = cartCount(items)

  async function signIn() {
    setSignInFailed(false)
    try {
      await account.signIn()
    } catch (error) {
      if (isSignInCancelled(error)) return
      console.error('Google sign-in failed', error)
      setSignInFailed(true)
    }
  }

  // Until online checkout exists, the order goes to the shop on WhatsApp with everything filled in.
  const whatsappOrderHref =
    account.status === 'signed-in'
      ? `${whatsappHref(settings.whatsapp)}?text=${encodeURIComponent(
          [
            t('cart.message.intro', { name: account.account.name, email: account.account.email }),
            ...orderLines.map((line, index) =>
              t('cart.message.line', {
                index: index + 1,
                name: line.item.name,
                option: line.item.variantLabel,
                qty: line.item.qty,
                total: formatRupees(line.lineTotal),
              }),
            ),
            t('cart.message.total', { total: formatRupees(total) }),
            t('cart.message.pickup'),
          ].join('\n'),
        )}`
      : ''

  return (
    <section aria-labelledby="cart-title" className="bg-soft-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10 lg:py-12">
        <h1 id="cart-title" className="text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
          {t('cart.title')}
        </h1>
        {count > 0 && <p className="mt-1 text-base text-muted-strong">{t('cart.items', { count })}</p>}

        {items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-paper px-6 py-14 text-center">
            <ShoppingBag aria-hidden className="mb-3 size-10 text-saffron-text" />
            <h2 className="text-xl font-semibold text-navy">{t('cart.emptyTitle')}</h2>
            <p className="mt-1 max-w-sm text-base text-muted-strong">{t('cart.emptyBody')}</p>
            <Link to="/shop" className={`${primaryButton} mt-6 w-auto`}>
              {t('cart.continue')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <ul className="space-y-3 lg:col-span-8">
              {lines.map(({ item, product, available, price, lineTotal }) => (
                <li
                  key={`${item.productId}/${item.variantId}`}
                  className="flex gap-3 rounded-2xl border border-border bg-paper p-3 sm:gap-4 sm:p-4"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-soft-paper sm:size-24">
                    {product &&
                      (PRODUCT_IMAGES[product.id] ? (
                        <ProductPhoto src={PRODUCT_IMAGES[product.id]} alt="" />
                      ) : (
                        <Product3DViewer model={productModel(product)} />
                      ))}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-base font-semibold text-ink">{item.name}</p>
                    <p className="text-sm text-muted-strong">
                      {item.variantLabel} · {t('cart.each', { price: formatRupees(price) })}
                    </p>
                    {!available && <p className="mt-1 text-sm font-semibold text-error">{t('cart.unavailable')}</p>}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label={t('cart.decrease', { name: item.name })}
                          onClick={() => setQuantity(item.productId, item.variantId, item.qty - 1)}
                          className={stepButton}
                        >
                          <Minus aria-hidden className="size-4" />
                        </button>
                        <span className="min-w-8 text-center text-base font-semibold text-ink">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={t('cart.increase', { name: item.name })}
                          disabled={item.qty >= item.maxQty}
                          onClick={() => setQuantity(item.productId, item.variantId, item.qty + 1)}
                          className={stepButton}
                        >
                          <Plus aria-hidden className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base font-bold text-navy">{formatRupees(lineTotal)}</span>
                        <button
                          type="button"
                          aria-label={t('cart.remove', { name: item.name })}
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="inline-flex size-11 items-center justify-center rounded-full text-error transition-colors hover:bg-soft-paper"
                        >
                          <Trash2 aria-hidden className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside aria-labelledby="cart-summary" className="h-fit rounded-2xl border border-border bg-paper p-5 lg:sticky lg:top-24 lg:col-span-4">
              <h2 id="cart-summary" className="text-lg font-semibold text-navy">
                {t('cart.summary')}
              </h2>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-lg font-bold text-navy">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-navy">{formatRupees(total)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-strong">{t('cart.pickupNote')}</p>

              <div className="mt-5">
                {account.status === 'signed-in' ? (
                  orderLines.length > 0 && (
                    <>
                      <a href={whatsappOrderHref} target="_blank" rel="noopener noreferrer" className={primaryButton}>
                        <MessageCircle aria-hidden className="size-5" />
                        {t('cart.sendWhatsapp')}
                        <span className="sr-only"> {t('common.newTab')}</span>
                      </a>
                      <p className="mt-2 text-sm text-muted-strong">{t('cart.whatsappNote')}</p>
                    </>
                  )
                ) : account.status === 'guest' ? (
                  <>
                    <button type="button" onClick={signIn} className={primaryButton}>
                      <LogIn aria-hidden className="size-5" />
                      {t('cart.signInToOrder')}
                    </button>
                    {signInFailed && (
                      <p role="alert" className="mt-2 text-sm text-error">
                        {t('auth.error')}
                      </p>
                    )}
                  </>
                ) : (
                  <span aria-hidden className="skeleton block h-12 rounded-full" />
                )}
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-2">
                <Link
                  to="/shop"
                  className="inline-flex min-h-11 items-center text-base font-semibold text-navy underline-offset-4 hover:underline"
                >
                  {t('cart.continue')}
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex min-h-11 items-center text-base font-semibold text-error underline-offset-4 hover:underline"
                >
                  {t('cart.clear')}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
