import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// Values come from .env (see .env.example). Vite inlines them into the bundle at build time:
// Firebase web keys are public identifiers, not secrets. Restrict them in the Firebase console
// (API key restrictions + security rules), not by hiding them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase config is missing. Copy .env.example to .env and fill in the values.')
}

export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Offline persistence: data already read stays available from IndexedDB when the network drops,
// shared across open tabs.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

// Analytics runs in production builds only, so local development sends no events.
// isSupported() guards browsers where measurement is unavailable (private mode, blocked storage).
export const analyticsReady: Promise<Analytics | null> = import.meta.env.PROD
  ? isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null)
  : Promise.resolve(null)
