import { useEffect, useState } from 'react'
import { SHOP } from '../data/shop'
import type { Settings } from '../types/models'

let pending: Promise<Settings> | null = null
let loaded: Settings | null = null

// A fallback result is kept for the session (no Firestore read on every page change); it is retried
// only when the browser comes back online.
function fallback(reason: unknown): Settings {
  console.warn('Using fallback shop settings from src/data/shop.ts:', reason)
  return SHOP
}

window.addEventListener('online', () => {
  if (!loaded) pending = null
})

/** settings/shop, read once and cached for the session. Firebase loads in its own chunk. */
function getSettings(): Promise<Settings> {
  pending ??= import('../services/settings')
    .then(({ fetchSettings }) => fetchSettings())
    .then((settings) => {
      if (!settings) return fallback('settings/shop does not exist yet (run the seed script)')
      loaded = settings
      return settings
    })
    .catch(fallback)
  return pending
}

/** Live shop settings from Firestore; the fallback values in src/data/shop.ts render until they arrive. */
export function useSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(() => loaded ?? SHOP)

  useEffect(() => {
    let alive = true
    void getSettings().then((value) => {
      if (alive) setSettings(value)
    })
    return () => {
      alive = false
    }
  }, [])

  return settings
}
