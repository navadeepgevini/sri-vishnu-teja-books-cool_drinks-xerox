import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { normaliseCategory } from './normalise'
import type { Category } from '../types/models'

/** Active categories in display order. The isActive filter is required: rules only allow reading active ones. */
export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, 'categories'), where('isActive', '==', true)))
  // Offline with nothing cached, getDocs resolves empty from the local cache instead of failing.
  if (snap.empty && snap.metadata.fromCache) throw new Error('Categories unavailable: offline and nothing cached')

  return snap.docs
    .map((d) => normaliseCategory(d.id, d.data()))
    .filter((c): c is Category => c !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
