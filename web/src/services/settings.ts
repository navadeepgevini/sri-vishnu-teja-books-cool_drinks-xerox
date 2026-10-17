import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { normaliseSettings } from './normalise'
import type { Settings } from '../types/models'

/** settings/shop, validated field by field, or null if the document does not exist yet. */
export async function fetchSettings(): Promise<Settings | null> {
  const snap = await getDoc(doc(db, 'settings', 'shop'))
  return snap.exists() ? normaliseSettings(snap.data()) : null
}
