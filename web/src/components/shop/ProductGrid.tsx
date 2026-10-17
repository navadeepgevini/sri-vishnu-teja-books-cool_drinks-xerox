import type { PriceState } from '../../lib/catalog'
import type { ProductWithVariants } from '../../types/models'
import ProductCard from '../product/ProductCard'

const grid = 'grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6'

export default function ProductGrid({
  products,
  priceState,
}: {
  products: ProductWithVariants[]
  priceState: PriceState
}) {
  return (
    <ul className={grid}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} priceState={priceState} />
        </li>
      ))}
    </ul>
  )
}

/** Card-shaped shimmer placeholders while the catalogue loads. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden className={grid}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="rounded-2xl border border-border bg-paper p-4">
          <div className="skeleton h-56 rounded-xl" />
          <div className="skeleton mt-4 h-5 w-3/4 rounded" />
          <div className="skeleton mt-2 h-4 w-1/2 rounded" />
          <div className="skeleton mt-6 h-11 rounded-full" />
        </li>
      ))}
    </ul>
  )
}
