import type {
  Category,
  CategoryTint,
  ModelColor,
  ModelKind,
  ModelSpec,
  Product,
  ProductWithVariants,
} from '../types/models'

// Pure catalogue helpers. Kept apart from src/services/ (the Firestore reads) so components can use
// them without pulling the Firebase SDK into the first-load bundle.

export const MODEL_KINDS: readonly ModelKind[] = ['notebook', 'pen', 'paper', 'box', 'bottle', 'bag']
export const CATEGORY_TINTS: readonly CategoryTint[] = [
  'cat-long',
  'cat-short',
  'cat-record',
  'cat-pens',
  'cat-pencils',
  'cat-geometry',
  'cat-paper',
  'cat-office',
]
export const MODEL_COLORS: readonly ModelColor[] = [...CATEGORY_TINTS, 'navy', 'ink', 'paper']

/**
 * Whether prices and stock can be shown: 'loading' while Firestore answers, 'unavailable' when the page
 * is showing the bundled catalogue, whose prices must never be presented as real.
 */
export type PriceState = 'shown' | 'loading' | 'unavailable'

export function minPrice(product: ProductWithVariants): number {
  return product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : 0
}

export function hasPriceRange(product: ProductWithVariants): boolean {
  return new Set(product.variants.map((v) => v.price)).size > 1
}

export type StockState = { status: 'in' } | { status: 'low'; left: number } | { status: 'out' }

export function stockState(product: ProductWithVariants): StockState {
  const left = product.variants.reduce((sum, v) => sum + Math.max(0, v.stockQty), 0)
  if (left === 0) return { status: 'out' }
  const alert = Math.max(0, ...product.variants.map((v) => v.lowStockAlert))
  return left <= alert ? { status: 'low', left } : { status: 'in' }
}

export function brandSlug(brand: string): string {
  return brand
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const STACK: Record<ModelKind, number> = { notebook: 2, pen: 4, paper: 3, box: 1, bottle: 3, bag: 1 }

/** 3D placeholder for a product. Unknown kinds or colours degrade safely. */
export function productModel(product: Product): ModelSpec {
  const kind = MODEL_KINDS.includes(product.modelKind) ? product.modelKind : 'box'
  const color = MODEL_COLORS.includes(product.coverColor) ? product.coverColor : 'navy'
  return { kind, color, count: STACK[kind] }
}

/** 3D placeholder shown on a category tile. Unknown kinds or colours degrade safely. */
export function categoryModel(category: Category): ModelSpec {
  const kind = MODEL_KINDS.includes(category.icon) ? category.icon : 'box'
  const color = CATEGORY_TINTS.includes(category.colorToken) ? category.colorToken : 'cat-long'
  return { kind, color, count: STACK[kind] === 1 ? 1 : 3 }
}
