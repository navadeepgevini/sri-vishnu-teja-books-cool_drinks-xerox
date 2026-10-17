import { Suspense, lazy, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircleQuestion } from 'lucide-react'
import ErrorBoundary from '../common/ErrorBoundary'

// Only the button is in the main bundle; the chat window (and the catalogue it searches) loads on
// first open, or earlier when the button is hovered or focused.
const loadPanel = () => import('./AssistantPanel')
const AssistantPanel = lazy(loadPanel)

export default function AssistantWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    // Give focus back to the button once it is visible again.
    window.setTimeout(() => buttonRef.current?.focus(), 0)
  }, [])

  return (
    <>
      {open ? (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <AssistantPanel onClose={close} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          onPointerEnter={loadPanel}
          onFocus={loadPanel}
          title={t('assistant.openLabel')}
          aria-haspopup="dialog"
          className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-4 text-base font-semibold text-paper shadow-lift transition-colors hover:bg-ink lg:right-6 lg:bottom-6"
        >
          <MessageCircleQuestion aria-hidden className="size-5 text-soft-saffron" />
          {t('assistant.open')}
        </button>
      )}
    </>
  )
}
