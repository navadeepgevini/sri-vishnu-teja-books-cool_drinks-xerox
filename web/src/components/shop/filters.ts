import type { Category, ProductWithVariants, Ruling } from '../../types/models'
import { brandSlug, minPrice } from '../../lib/catalog'

export const PAGE_SIZE = 24

/** Every filter lives in the URL: /shop?cat=long-notebooks&brand=apsara&q=note&sort=price-asc */
export const FILTER_KEYS = ['cat', 'brand', 'ruling', 'pages', 'price', 'q', 'sort'] as const
export type FilterKey = (typeof FILTER_KEYS)[number]
export type Filters = Record<FilterKey, string>

export const PRICE_BUCKETS = ['under-50', '50-100', 'over-100'] as const

export function readFilters(params: URLSearchParams): Filters {
  return Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? ''])) as Filters
}

function inPriceBucket(price: number, bucket: string): boolean {
  if (bucket === 'under-50') return price < 50
  if (bucket === '50-100') return price >= 50 && price <= 100
  if (bucket === 'over-100') return price > 100
  return true
}

type Compare = (a: ProductWithVariants, b: ProductWithVariants) => number

/** Client-side filter + sort. Fine for a catalogue of a few hundred products. */
export function applyFilters(
  products: ProductWithVariants[],
  categories: Category[],
  filters: Filters,
  lang: string,
): ProductWithVariants[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const selected = filters.cat ? categories.find((c) => c.slug === filters.cat) : undefined
  const words = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean)

  const matches = products.filter((p) => {
    if (filters.cat && p.categoryId !== selected?.id) return false
    if (filters.brand && brandSlug(p.brand) !== filters.brand) return false
    if (filters.ruling && !p.variants.some((v) => v.ruling === filters.ruling)) return false
    if (filters.pages && !p.variants.some((v) => String(v.pages) === filters.pages)) return false
    if (filters.price && !inPriceBucket(minPrice(p), filters.price)) return false
    if (words.length) {
      const category = byId.get(p.categoryId)
      const haystack = [p.nameEn, p.nameTe, p.brand, category?.nameEn, category?.nameTe].join(' ').toLowerCase()
      if (!words.every((word) => haystack.includes(word))) return false
    }
    return true
  })

  const name = (p: ProductWithVariants) => (lang === 'te' ? p.nameTe : p.nameEn)
  const order = (p: ProductWithVariants) => byId.get(p.categoryId)?.sortOrder ?? Number.MAX_SAFE_INTEGER
  const popular: Compare = (a, b) =>
    Number(b.isFeatured) - Number(a.isFeatured) || order(a) - order(b) || a.nameEn.localeCompare(b.nameEn)
  const sorts: Record<string, Compare> = {
    'price-asc': (a, b) => minPrice(a) - minPrice(b),
    'price-desc': (a, b) => minPrice(b) - minPrice(a),
    name: (a, b) => name(a).localeCompare(name(b), lang),
  }

  return matches.sort(sorts[filters.sort] ?? popular)
}

/** Options for the Brand / Ruling / Pages dropdowns, built from whatever is in the catalogue. */
export function filterOptions(products: ProductWithVariants[]) {
  const brands = new Map<string, string>()
  const rulings = new Set<Ruling>()
  const pages = new Set<number>()
  for (const p of products) {
    if (p.brand) brands.set(brandSlug(p.brand), p.brand) // unbranded items stay out of the Brand list
    for (const v of p.variants) {
      if (v.ruling) rulings.add(v.ruling)
      if (v.pages) pages.add(v.pages)
    }
  }
  return {
    brands: [...brands].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label })),
    rulings: [...rulings],
    pages: [...pages].sort((a, b) => a - b),
  }
}
