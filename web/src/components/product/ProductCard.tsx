import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Rotate3d, ShoppingCart } from 'lucide-react'
import type { ProductWithVariants, Variant } from '../../types/models'
import { formatRupees } from '../../data/shop'
import { productModel, stockState } from '../../lib/catalog'
import type { PriceState, StockState } from '../../lib/catalog'
import { addToCart } from '../../lib/cart'
import Product3DViewer from './Product3DViewer'
import ProductPhoto from './ProductPhoto'
import { PRODUCT_IMAGES } from '../../data/productImages'

const chipBase = 'pointer-events-none absolute top-3 right-3 z-40 rounded-full px-2.5 py-1 text-[13px] font-semibold'

function StockChip({ stock }: { stock: StockState }) {
  const { t } = useTranslation()
  if (stock.status === 'low') {
    // Saffron fill: ink text only.
    return <span className={`${chipBase} bg-soft-saffron text-ink`}>{t('product.lowStock', { count: stock.left })}</span>
  }
  if (stock.status === 'out') {
    return <span className={`${chipBase} border border-border bg-paper text-error`}>{t('product.outOfStock')}</span>
  }
  return <span className={`${chipBase} border border-border bg-paper text-success-text`}>{t('product.inStock')}</span>
}

type AddStatus = 'idle' | 'added' | 'full'

function AddToCartButton({
  product,
  variant,
  priceState,
}: {
  product: ProductWithVariants
  variant: Variant
  priceState: PriceState
}) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<AddStatus>('idle')

  // "Added" / "No more stock" shows briefly, then the button returns to normal.
  useEffect(() => {
    if (status === 'idle') return
    const timer = window.setTimeout(() => setStatus('idle'), 1600)
    return () => window.clearTimeout(timer)
  }, [status])

  const soldOut = variant.stockQty <= 0
  // Only real prices can go into the cart (not the bundled fallback catalogue).
  const disabled = priceState !== 'shown' || soldOut

  function add() {
    const added = addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.nameEn,
      variantLabel: variant.label,
      price: variant.price,
      maxQty: variant.stockQty,
    })
    setStatus(added ? 'added' : 'full')
  }

  const label = soldOut
    ? t('product.outOfStock')
    : status === 'added'
      ? t('product.added')
      : status === 'full'
        ? t('product.noMoreStock')
        : t('product.addToCart')

  return (
    <>
      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-full border-[1.5px] border-navy bg-paper px-3 py-1.5 text-center text-base leading-tight font-semibold text-navy transition-colors enabled:hover:bg-navy enabled:hover:text-paper disabled:cursor-not-allowed disabled:border-border disabled:text-muted-strong @min-[15rem]:w-auto @min-[15rem]:gap-1.5 @min-[15rem]:px-4"
      >
        {status === 'added' ? (
          <Check aria-hidden className="size-4 shrink-0 @min-[15rem]:size-[18px]" />
        ) : (
          <ShoppingCart aria-hidden className="size-4 shrink-0 @min-[15rem]:size-[18px]" />
        )}
        {label}
        <span className="sr-only">, {product.nameEn}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {status === 'added' ? t('product.addedToCart', { name: product.nameEn }) : ''}
      </span>
    </>
  )
}

// @container: the card also sits in a 2-column grid on phones, where the badge and button must fit ~140px.
export default function ProductCard({
  product,
  priceState = 'shown',
}: {
  product: ProductWithVariants
  /** Only 'shown' prices and stock are real; see PriceState. */
  priceState?: PriceState
}) {
  const { t } = useTranslation()
  const name = product.nameEn
  const selectId = useId()
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '')
  const selected = product.variants.find((v) => v.id === variantId) ?? product.variants[0]
  const hasOptions = product.variants.length > 1
  const spec = hasOptions
    ? t('product.options', { count: product.variants.length })
    : (selected?.label ?? product.brand)
  const photo = PRODUCT_IMAGES[product.id]

  return (
    <article
      data-hover-root
      className="group @container flex h-full flex-col rounded-2xl border border-border bg-paper p-4 shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative h-56 overflow-hidden rounded-xl bg-soft-paper">
        {photo ? (
          <ProductPhoto src={photo} alt={name} />
        ) : (
          <>
            <Product3DViewer model={productModel(product)} label={t('common.model3d', { name })} />
            <span className="pointer-events-none absolute top-3 left-3 z-40 hidden items-center gap-1 rounded-full border border-border bg-paper px-2.5 py-1 text-[13px] font-semibold text-ink uppercase @min-[15rem]:inline-flex">
              <Rotate3d aria-hidden className="size-4 text-saffron-text" />
              {t('product.badge360')}
            </span>
          </>
        )}
        {priceState === 'shown' && <StockChip stock={stockState(product)} />}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="line-clamp-1 text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-0.5 text-sm text-muted-strong">{spec}</p>

        <div className="mt-auto pt-4">
          {hasOptions && selected && (
            <>
              <label htmlFor={selectId} className="sr-only">
                {t('product.chooseOption', { name })}
              </label>
              <select
                id={selectId}
                value={selected.id}
                onChange={(event) => setVariantId(event.target.value)}
                className="mb-3 min-h-11 w-full cursor-pointer rounded-xl border border-border bg-paper px-3 text-base text-ink focus:border-navy"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="flex flex-col">
              <span className="text-[13px] text-muted-strong">{t('product.price')}</span>
              {priceState === 'shown' && selected ? (
                <span className="text-lg font-bold text-navy">{formatRupees(selected.price)}</span>
              ) : priceState === 'loading' ? (
                <span aria-hidden className="skeleton mt-1 h-6 w-16 rounded" />
              ) : (
                <span className="text-base font-semibold text-navy">{t('product.priceUnavailable')}</span>
              )}
            </p>
            {selected && <AddToCartButton product={product} variant={selected} priceState={priceState} />}
          </div>
        </div>
      </div>
    </article>
  )
}
