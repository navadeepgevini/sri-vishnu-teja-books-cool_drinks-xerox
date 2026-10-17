import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { isSignInCancelled, useAccount } from '../../hooks/useAccount'

/** Navbar: "Sign in" for guests; for signed-in visitors, their photo with a small account panel. */
export default function AccountButton() {
  const { t } = useTranslation()
  const account = useAccount()
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const panelId = useId()

  // Close the panel on Escape or a click outside it.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (account.status === 'loading') return <span aria-hidden className="skeleton size-11 rounded-full" />

  if (account.status === 'guest') {
    const signIn = async () => {
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
      <div className="relative">
        <button
          type="button"
          onClick={signIn}
          aria-label={t('auth.signInWithGoogle')}
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-navy px-3 text-base font-semibold text-paper transition-colors hover:bg-ink sm:px-4"
        >
          <LogIn aria-hidden className="size-5" />
          <span className="hidden sm:inline">{t('auth.signIn')}</span>
        </button>
        {failed && (
          <p
            role="alert"
            className="absolute top-full right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-paper p-3 text-sm text-error shadow-lift"
          >
            {t('auth.error')}
          </p>
        )}
      </div>
    )
  }

  const { name, email, photoUrl } = account.account
  return (
    <div ref={panel} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('auth.account')}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center overflow-hidden rounded-full bg-soft-paper text-navy transition-colors hover:bg-border"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" referrerPolicy="no-referrer" className="size-11 object-cover" />
        ) : (
          <UserRound aria-hidden className="size-5" />
        )}
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-paper p-4 shadow-lift"
        >
          <p className="truncate text-base font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-muted-strong">{email}</p>
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await account.signOut()
            }}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-navy bg-paper text-base font-semibold text-navy transition-colors hover:bg-cream"
          >
            <LogOut aria-hidden className="size-[18px]" />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
