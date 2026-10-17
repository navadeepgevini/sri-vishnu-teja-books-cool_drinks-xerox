import { useCallback, useEffect, useState } from 'react'
import type { Account } from '../lib/auth'

export type AccountState = { status: 'loading' } | { status: 'guest' } | { status: 'signed-in'; account: Account }

const CANCELLED = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'])

/** The visitor closed the Google window themselves: not an error worth showing. */
export function isSignInCancelled(error: unknown): boolean {
  return CANCELLED.has(String((error as { code?: unknown } | null)?.code))
}

/**
 * The visitor's Google account (or 'guest'). Firebase Auth loads in its own chunk, so using this hook
 * never adds the SDK to the first-load bundle.
 */
export function useAccount() {
  const [state, setState] = useState<AccountState>({ status: 'loading' })

  useEffect(() => {
    let alive = true
    let unsubscribe = () => {}
    void import('../lib/auth').then(({ watchAccount }) => {
      if (!alive) return
      unsubscribe = watchAccount((account) => setState(account ? { status: 'signed-in', account } : { status: 'guest' }))
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async () => {
    const { signInWithGoogle } = await import('../lib/auth')
    const account = await signInWithGoogle()
    setState({ status: 'signed-in', account })
  }, [])

  const signOut = useCallback(async () => {
    const { signOutToGuest } = await import('../lib/auth')
    await signOutToGuest()
    setState({ status: 'guest' })
  }, [])

  return { ...state, signIn, signOut }
}
