import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'
import type { CategoryTint } from '../../types/models'
import { useCatalog } from '../../hooks/useCatalog'
import { categoryModel } from '../../lib/catalog'
import Product3DViewer from '../product/Product3DViewer'

const tintClass: Record<CategoryTint, string> = {
  'cat-long': 'bg-cat-long/20 hover:bg-cat-long/30',
  'cat-short': 'bg-cat-short/20 hover:bg-cat-short/30',
  'cat-record': 'bg-cat-record/20 hover:bg-cat-record/30',
  'cat-pens': 'bg-cat-pens/20 hover:bg-cat-pens/30',
  'cat-pencils': 'bg-cat-pencils/20 hover:bg-cat-pencils/30',
  'cat-geometry': 'bg-cat-geometry/20 hover:bg-cat-geometry/30',
  'cat-paper': 'bg-cat-paper/20 hover:bg-cat-paper/30',
  'cat-office': 'bg-cat-office/20 hover:bg-cat-office/30',
}

export default function CategoryGrid() {
  const { t } = useTranslation()
  const { categories, status } = useCatalog()

  return (
    <section id="categories" aria-labelledby="categories-title" className="scroll-mt-24 bg-paper py-10 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-[13px] font-semibold tracking-wider text-saffron-text uppercase">
              {t('categories.eyebrow')}
            </p>
            <h2 id="categories-title" className="mt-1 text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
              {t('categories.title')}
            </h2>
          </div>
          <p className="text-base text-muted-strong">{t('categories.subtitle')}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to={`/shop?cat=${encodeURIComponent(category.slug)}`}
                draggable={false}
                data-hover-root
                className={`group flex h-[250px] flex-col rounded-2xl p-3 shadow-soft transition-[background-color,box-shadow] duration-300 hover:shadow-lift sm:h-[320px] lg:h-[360px] lg:p-4 ${tintClass[category.colorToken] ?? tintClass['cat-long']}`}
              >
                <div className="relative z-40 flex items-center justify-between">
                  {/* Counts are real only once Firestore has answered; the pill keeps its space meanwhile. */}
                  <span
                    aria-hidden={status !== 'ready'}
                    className={`rounded-full bg-paper px-2.5 py-1 text-[13px] font-semibold text-ink shadow-soft ${status === 'ready' ? '' : 'invisible'}`}
                  >
                    {t('categories.items', { count: category.productCount })}
                  </span>
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-paper text-ink">
                    <ArrowUpRight
                      aria-hidden
                      className="size-[18px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>

                <div className="relative my-2 flex-1">
                  <Product3DViewer model={categoryModel(category)} />
                </div>

                <div className="relative z-40 self-start rounded-xl bg-paper px-3 py-2 shadow-soft">
                  <h3 className="text-sm font-semibold text-ink">{category.nameEn}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
