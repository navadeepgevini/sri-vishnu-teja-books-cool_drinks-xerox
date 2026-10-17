import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { Category, ProductWithVariants } from '../../types/models'
import { formatRupees } from '../../data/shop'
import { PRICE_BUCKETS, filterOptions } from './filters'
import type { Filters } from './filters'

type Option = { value: string; label: string }

const pillBase = 'min-h-11 rounded-full border text-base font-semibold transition-colors'
const pillOn = 'border-navy bg-navy text-paper'
const pillOff = 'border-border bg-paper text-ink hover:bg-cream'

function SelectPill({
  label,
  value,
  options,
  onChange,
  anyLabel,
  highlight = true,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  anyLabel?: string
  highlight?: boolean
}) {
  const id = useId()
  const on = highlight && value !== ''
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${pillBase} cursor-pointer appearance-none py-2 pr-10 pl-4 ${on ? pillOn : pillOff}`}
      >
        {anyLabel !== undefined && <option value="">{anyLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className={`pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 ${on ? 'text-paper' : 'text-ink'}`}
      />
    </div>
  )
}

type Props = {
  categories: Category[]
  products: ProductWithVariants[]
  filters: Filters
  /** False while prices are not real (bundled catalogue): the Price filter and price sorts are hidden. */
  showPrice: boolean
  onChange: (next: Partial<Filters>) => void
  onClear: () => void
}

export default function FilterBar({ categories, products, filters, showPrice, onChange, onClear }: Props) {
  const { t } = useTranslation()
  const { brands, rulings, pages } = filterOptions(products)
  const hasFilters = Boolean(filters.cat || filters.brand || filters.ruling || filters.pages || filters.price || filters.q)

  const priceLabel: Record<(typeof PRICE_BUCKETS)[number], string> = {
    'under-50': t('pages.shop.priceUnder', { price: formatRupees(50) }),
    '50-100': t('pages.shop.priceBetween', { min: formatRupees(50), max: formatRupees(100) }),
    'over-100': t('pages.shop.priceOver', { price: formatRupees(100) }),
  }
  const categoryPills = [
    { slug: '', label: t('pages.shop.all') },
    ...categories.map((c) => ({ slug: c.slug, label: c.nameEn })),
  ]

  return (
    <div className="mb-6">
      <div
        role="group"
        aria-label={t('pages.shop.category')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        {categoryPills.map(({ slug, label }) => {
          const active = filters.cat === slug
          return (
            <button
              key={slug || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ cat: slug })}
              className={`${pillBase} shrink-0 px-4 whitespace-nowrap ${active ? pillOn : pillOff}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SelectPill
          label={t('pages.shop.brand')}
          anyLabel={t('pages.shop.brand')}
          value={filters.brand}
          options={brands}
          onChange={(brand) => onChange({ brand })}
        />
        <SelectPill
          label={t('pages.shop.ruling')}
          anyLabel={t('pages.shop.ruling')}
          value={filters.ruling}
          options={rulings.map((r) => ({ value: r, label: t(`rulings.${r}`) }))}
          onChange={(ruling) => onChange({ ruling })}
        />
        <SelectPill
          label={t('pages.shop.pages')}
          anyLabel={t('pages.shop.pages')}
          value={filters.pages}
          options={pages.map((p) => ({ value: String(p), label: t('product.pages', { count: p }) }))}
          onChange={(value) => onChange({ pages: value })}
        />
        {showPrice && (
          <SelectPill
            label={t('pages.shop.price')}
            anyLabel={t('pages.shop.price')}
            value={filters.price}
            options={PRICE_BUCKETS.map((bucket) => ({ value: bucket, label: priceLabel[bucket] }))}
            onChange={(price) => onChange({ price })}
          />
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-base font-semibold text-navy underline-offset-4 hover:underline"
          >
            <RotateCcw aria-hidden className="size-4" />
            {t('pages.shop.clear')}
          </button>
        )}
        <div className="ms-auto">
          <SelectPill
            label={t('pages.shop.sort')}
            highlight={false}
            value={filters.sort}
            options={[
              { value: '', label: t('pages.shop.sortPopular') },
              ...(showPrice
                ? [
                    { value: 'price-asc', label: t('pages.shop.sortPriceAsc') },
                    { value: 'price-desc', label: t('pages.shop.sortPriceDesc') },
                  ]
                : []),
              { value: 'name', label: t('pages.shop.sortName') },
            ]}
            onChange={(sort) => onChange({ sort })}
          />
        </div>
      </div>
    </div>
  )
}
