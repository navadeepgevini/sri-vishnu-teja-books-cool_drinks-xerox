import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import { isSignInCancelled, useAccount } from '../../hooks/useAccount'

/** Wraps ordering pages (cart, xerox, order status): Google sign-in is required before placing an order. */
export default function RequireSignIn({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const account = useAccount()
  const [failed, setFailed] = useState(false)

  if (account.status === 'loading') return <div aria-busy="true" className="min-h-[60vh]" />
  if (account.status === 'signed-in') return <>{children}</>

  async function signIn() {
    setFailed(false)
    try {
      await account.signIn()
    } catch (error) {
      if (isSignInCancelled(error)) return
      console.error('Google sign-in failed', error)
      setFailed(true)
    }
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-16 text-center lg:py-24">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-cream text-saffron-text">
        <LogIn aria-hidden className="size-7" />
      </span>
      <h1 className="text-2xl font-bold text-navy lg:text-3xl">{t('auth.requiredTitle')}</h1>
      <p className="mt-2 text-base text-muted-strong">{t('auth.requiredBody')}</p>
      <button
        type="button"
        onClick={signIn}
        className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-7 text-base font-semibold text-paper transition-colors hover:bg-ink"
      >
        <LogIn aria-hidden className="size-[18px]" />
        {t('auth.signInWithGoogle')}
      </button>
      {failed && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t('auth.error')}
        </p>
      )}
    </section>
  )
}
