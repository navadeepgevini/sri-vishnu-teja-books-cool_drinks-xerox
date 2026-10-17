import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  onIdTokenChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import type { FirebaseError } from 'firebase/app'
import { auth } from './firebase'

let pending: Promise<string | null> | null = null

/**
 * Every visitor gets an anonymous uid on arrival, so browsing needs no login. Google sign-in (required
 * before ordering) upgrades that same uid in place. Resolves to null if sign-in is unavailable;
 * public catalogue reads still work.
 */
export function ensureAnonymousUser(): Promise<string | null> {
  pending ??= new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe()
        resolve(user.uid)
        return
      }
      signInAnonymously(auth).catch((error: unknown) => {
        unsubscribe()
        console.warn('Anonymous sign-in failed. Enable it in Firebase console → Authentication.', error)
        pending = null
        resolve(null)
      })
    })
  })
  return pending
}

/** A signed-in Google account. Anonymous visitors are guests, not accounts. */
export type Account = { uid: string; name: string; email: string; photoUrl: string | null }

function toAccount(user: User | null): Account | null {
  if (!user || user.isAnonymous) return null
  // Right after an anonymous account is upgraded, the Google details may only be on providerData.
  const google = user.providerData.find((p) => p.providerId === 'google.com')
  return {
    uid: user.uid,
    name: user.displayName ?? google?.displayName ?? user.email ?? '',
    email: user.email ?? google?.email ?? '',
    photoUrl: user.photoURL ?? google?.photoURL ?? null,
  }
}

/** Calls back with the Google account, or null for guests. Returns an unsubscribe function. */
export function watchAccount(callback: (account: Account | null) => void): () => void {
  // onIdTokenChanged, not onAuthStateChanged: only the former fires when an anonymous user is upgraded in place.
  return onIdTokenChanged(auth, (user) => callback(toAccount(user)))
}

/** Google sign-in in a popup. An anonymous visitor keeps their uid (and anything tied to it). */
export async function signInWithGoogle(): Promise<Account> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const current = auth.currentUser

  if (current?.isAnonymous) {
    try {
      return toAccount((await linkWithPopup(current, provider)).user) as Account
    } catch (error) {
      if ((error as FirebaseError).code !== 'auth/credential-already-in-use') throw error
      // This Google account already has its own user (e.g. from another phone): switch to it.
      const credential = GoogleAuthProvider.credentialFromError(error as FirebaseError)
      if (!credential) throw error
      return toAccount((await signInWithCredential(auth, credential)).user) as Account
    }
  }
  return toAccount((await signInWithPopup(auth, provider)).user) as Account
}

/** Signs out of Google and returns to a fresh anonymous guest, so browsing keeps working. */
export async function signOutToGuest(): Promise<void> {
  await signOut(auth)
  pending = null
  await ensureAnonymousUser()
}
