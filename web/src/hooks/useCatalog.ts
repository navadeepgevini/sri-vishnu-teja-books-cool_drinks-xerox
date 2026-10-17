import { useCallback, useEffect, useState } from 'react'
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../data/home'
import type { PriceState } from '../lib/catalog'
import type { Category, ProductWithVariants } from '../types/models'

type Catalog = { categories: Category[]; products: ProductWithVariants[] }

/**
 * 'loading': Firestore has not answered yet. 'ready': real data. 'fallback': Firestore is empty or
 * unreachable, so the bundled catalogue is shown instead — with prices, stock and counts hidden,
 * because they are not real (see PriceState).
 */
type Status = 'loading' | 'ready' | 'fallback'

const FALLBACK: Catalog = { categories: FALLBACK_CATEGORIES, products: FALLBACK_PRODUCTS }
const PRICE_STATE: Record<Status, PriceState> = { loading: 'loading', ready: 'shown', fallback: 'unavailable' }

let pending: Promise<Catalog> | null = null
let loaded: Catalog | null = null

const isEmpty = (catalog: Catalog) => catalog.categories.length === 0 || catalog.products.length === 0

// The services (and the Firebase SDK behind them) load in their own chunk, after first paint.
function loadCatalog(): Promise<Catalog> {
  pending ??= Promise.all([import('../services/categories'), import('../services/products')])
    .then(([{ fetchCategories }, { fetchActiveProducts }]) => Promise.all([fetchCategories(), fetchActiveProducts()]))
    .then(([categories, products]) => {
      const catalog = { categories, products }
      if (!isEmpty(catalog)) loaded = catalog
      return catalog
    })
  return pending
}

// An empty or failed result is kept for the session (no Firestore reads on every page change);
// it is retried when the browser comes back online, or when the visitor presses "Try again".
function forgetFailedLoad() {
  if (!loaded) pending = null
}

window.addEventListener('online', forgetFailedLoad)

/**
 * Categories and products from Firestore, loaded once per session. The bundled catalogue fills the page
 * while loading and whenever Firestore is empty or unreachable, so no page is ever blank, and
 * `priceState` says whether prices and stock may be shown.
 */
export function useCatalog() {
  const [state, setState] = useState<Catalog & { status: Status }>(() =>
    loaded ? { status: 'ready', ...loaded } : { status: 'loading', ...FALLBACK },
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    loadCatalog()
      .then((data) => {
        if (!alive) return
        if (isEmpty(data)) {
          console.warn('Firestore catalogue is empty (run the seed script); showing the bundled catalogue without prices.')
          setState({ status: 'fallback', ...FALLBACK })
          return
        }
        setState({ status: 'ready', ...data })
      })
      .catch((error: unknown) => {
        if (!alive) return
        console.warn('Could not load the catalogue from Firestore; showing the bundled catalogue without prices.', error)
        setState({ status: 'fallback', ...FALLBACK })
      })
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    forgetFailedLoad()
    setState((s) => ({ ...s, status: 'loading' }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, priceState: PRICE_STATE[state.status], retry }
}
