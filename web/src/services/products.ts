import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { normaliseProduct, normaliseVariant } from './normalise'
import type { ProductWithVariants, Variant } from '../types/models'

type VariantsByProduct = Map<string, Variant[]>

function addVariant(byProduct: VariantsByProduct, productId: string, doc: QueryDocumentSnapshot) {
  const variant = normaliseVariant(doc.id, doc.data())
  if (variant) byProduct.set(productId, [...(byProduct.get(productId) ?? []), variant])
}

/**
 * Every active variant in one collection-group query, grouped by product id. Needs the
 * `{path=**}/variants` rule and the collection-group index in firestore.indexes.json.
 */
async function variantsInOneQuery(): Promise<VariantsByProduct> {
  const snap = await getDocs(query(collectionGroup(db, 'variants'), where('isActive', '==', true)))
  const byProduct: VariantsByProduct = new Map()
  for (const doc of snap.docs) {
    const productId = doc.ref.parent.parent?.id
    if (productId) addVariant(byProduct, productId, doc)
  }
  return byProduct
}

/** Slower path: one variants query per product. Used until the index and rule above are deployed. */
async function variantsPerProduct(productIds: string[]): Promise<VariantsByProduct> {
  const byProduct: VariantsByProduct = new Map()
  await Promise.all(
    productIds.map(async (id) => {
      const snap = await getDocs(query(collection(db, 'products', id, 'variants'), where('isActive', '==', true)))
      for (const doc of snap.docs) addVariant(byProduct, id, doc)
    }),
  )
  return byProduct
}

/**
 * All active products with their active variants (cheapest first), validated. Products that cannot be
 * shown (no name, no category, no sellable variant) are skipped with a warning.
 */
export async function fetchActiveProducts(): Promise<ProductWithVariants[]> {
  const [snap, grouped] = await Promise.all([
    getDocs(query(collection(db, 'products'), where('isActive', '==', true))),
    variantsInOneQuery().catch((error: unknown) => {
      // Checked by code, not `instanceof FirestoreError`: the SDK throws a FirebaseError that is not an
      // instance of the exported class (verified in the browser).
      const code = (error as { code?: unknown } | null)?.code
      if (code !== 'failed-precondition' && code !== 'permission-denied') throw error
      console.warn(
        'Variants collection-group query unavailable; loading variants per product instead. ' +
          'Deploy firestore.rules and firestore.indexes.json (see README) to use the faster path.',
        code,
      )
      return null
    }),
  ])
  // Offline with nothing cached, getDocs resolves empty from the local cache instead of failing.
  if (snap.empty && snap.metadata.fromCache) throw new Error('Products unavailable: offline and nothing cached')

  const byProduct = grouped ?? (await variantsPerProduct(snap.docs.map((d) => d.id)))
  return snap.docs
    .map((d) => normaliseProduct(d.id, d.data(), byProduct.get(d.id) ?? []))
    .filter((p): p is ProductWithVariants => p !== null)
}
