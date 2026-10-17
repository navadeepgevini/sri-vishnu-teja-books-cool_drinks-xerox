import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Search, SearchX } from 'lucide-react'
import { useCatalog } from '../hooks/useCatalog'
import FilterBar from '../components/shop/FilterBar'
import ProductGrid, { ProductGridSkeleton } from '../components/shop/ProductGrid'
import { FILTER_KEYS, PAGE_SIZE, applyFilters, readFilters } from '../components/shop/filters'
import type { Filters } from '../components/shop/filters'

const primaryButton =
  'inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-7 text-base font-semibold text-paper transition-colors hover:bg-ink'

function EmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-paper px-6 py-14 text-center">
      <SearchX aria-hidden className="mb-3 size-10 text-saffron-text" />
      <h2 className="text-xl font-semibold text-navy">{t('pages.shop.emptyTitle')}</h2>
      <p className="mt-1 max-w-sm text-base text-muted-strong">{t('pages.shop.emptyBody')}</p>
      <button type="button" onClick={onClear} className={`${primaryButton} mt-6`}>
        {t('pages.shop.clear')}
      </button>
    </div>
  )
}

/** Firestore is empty or unreachable: the bundled range is shown without prices, with a way to retry. */
function FallbackNotice({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-cream p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-base font-semibold text-navy">{t('pages.shop.offlineTitle')}</p>
        <p className="text-sm text-muted-strong">{t('pages.shop.offlineBody')}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border-[1.5px] border-navy bg-paper px-5 text-base font-semibold text-navy transition-colors hover:bg-soft-paper sm:self-auto"
      >
        <RotateCcw aria-hidden className="size-[18px]" />
        {t('pages.shop.retry')}
      </button>
    </div>
  )
}

export default function Shop() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { status, categories, products, priceState, retry } = useCatalog()

  const query = params.toString()
  const filters = useMemo(() => readFilters(new URLSearchParams(query)), [query])
  const results = useMemo(
    () => applyFilters(products, categories, filters, i18n.language),
    [products, categories, filters, i18n.language],
  )

  // "Load more" pages through results; any filter change starts again from the first page.
  const [visible, setVisible] = useState(PAGE_SIZE)
  useEffect(() => setVisible(PAGE_SIZE), [query])

  function update(next: Partial<Filters>, replace = false) {
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(next)) {
          if (value) nextParams.set(key, value)
          else nextParams.delete(key)
        }
        return nextParams
      },
      { replace },
    )
  }

  function clearFilters() {
    setParams((prev) => {
      const nextParams = new URLSearchParams(prev)
      for (const key of FILTER_KEYS) if (key !== 'sort') nextParams.delete(key)
      return nextParams
    })
  }

  return (
    <section aria-labelledby="shop-title" className="bg-soft-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10 lg:py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold tracking-wider text-saffron-text uppercase">{t('pages.shop.eyebrow')}</p>
            <h1 id="shop-title" className="mt-1 text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
              {t('pages.shop.title')}
            </h1>
            <p className="mt-1 text-base text-muted-strong">{t('pages.shop.subtitle')}</p>
          </div>

          {/* The navbar search box only shows from 1280px; below that, search lives here. */}
          <form role="search" onSubmit={(event) => event.preventDefault()} className="w-full md:max-w-xs xl:hidden">
            <label htmlFor="shop-search" className="sr-only">
              {t('search.label')}
            </label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-strong" />
              <input
                id="shop-search"
                type="search"
                value={filters.q}
                onChange={(event) => update({ q: event.target.value }, true)}
                placeholder={t('search.placeholder')}
                className="h-11 w-full rounded-xl border border-border bg-paper pr-4 pl-10 text-base text-ink placeholder:text-muted-strong focus:border-navy"
              />
            </div>
          </form>
        </div>

        <FilterBar
          categories={categories}
          products={products}
          filters={filters}
          showPrice={priceState === 'shown'}
          onChange={(next) => update(next)}
          onClear={clearFilters}
        />

        {status === 'loading' ? (
          <ProductGridSkeleton />
        ) : (
          <>
            {status === 'fallback' && <FallbackNotice onRetry={retry} />}
            {results.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <p aria-live="polite" className="mb-4 text-sm text-muted-strong">
                  {filters.q && (
                    <span className="font-semibold text-ink">{t('pages.shop.searchedFor', { q: filters.q })} · </span>
                  )}
                  {t('pages.shop.showing', { shown: Math.min(visible, results.length), total: results.length })}
                </p>
                <ProductGrid products={results.slice(0, visible)} priceState={priceState} />
                {visible < results.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisible((n) => n + PAGE_SIZE)}
                      className="min-h-12 rounded-full border-[1.5px] border-navy bg-paper px-8 text-base font-semibold text-navy transition-colors hover:bg-cream"
                    >
                      {t('pages.shop.loadMore')}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}
