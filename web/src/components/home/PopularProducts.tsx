import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import { useCatalog } from '../../hooks/useCatalog'
import ProductCard from '../product/ProductCard'

export default function PopularProducts() {
  const { t } = useTranslation()
  const { categories, products, status, priceState } = useCatalog()
  // Featured products first; fill up to four with the rest if fewer are featured.
  const picks = [...products.filter((p) => p.isFeatured), ...products.filter((p) => !p.isFeatured)].slice(0, 4)
  const totalItems = categories.reduce((sum, c) => sum + c.productCount, 0)

  return (
    <section id="popular" aria-labelledby="popular-title" className="scroll-mt-24 bg-soft-paper py-10 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[13px] font-semibold text-saffron-text">
              <Flame aria-hidden className="size-4" />
              {t('popular.eyebrow')}
            </p>
            <h2 id="popular-title" className="text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
              {t('popular.title')}
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center gap-1 text-base font-semibold text-navy transition-colors hover:text-saffron-text"
          >
            {status === 'ready' ? t('popular.viewAll', { count: totalItems }) : t('popular.viewAllNoCount')}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} priceState={priceState} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
