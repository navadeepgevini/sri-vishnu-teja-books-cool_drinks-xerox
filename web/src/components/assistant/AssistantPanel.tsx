import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, LoaderCircle, Send, Sparkles, Store, X } from 'lucide-react'
import { answer, productContext, topicAnswer } from '../../lib/assistant'
import type { AssistantAnswer, AssistantContext, Topic } from '../../lib/assistant'
import { useCatalog } from '../../hooks/useCatalog'
import { useSettings } from '../../hooks/useSettings'

type Message = { id: number; from: 'user' | 'bot'; text: string; answer?: AssistantAnswer; pending?: boolean }

const QUICK: Topic[] = ['hours', 'xerox', 'location', 'contact', 'delivery']

const chip =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-paper px-3.5 text-[15px] font-semibold text-navy transition-colors hover:bg-cream'

function BotAnswer({ value, onNavigate }: { value: AssistantAnswer; onNavigate: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-line">{value.text}</p>
      {value.fromAi && (
        <p className="flex items-center gap-1 text-[13px] text-muted-strong">
          <Sparkles aria-hidden className="size-3.5 text-saffron-text" />
          {t('assistant.aiNote')}
        </p>
      )}
      {value.lines && (
        <ul className="list-disc space-y-0.5 pl-5">
          {value.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {value.items && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-paper">
          {value.items.map((item) => (
            <li key={item.to}>
              <Link to={item.to} onClick={onNavigate} className="block px-3 py-2 transition-colors hover:bg-cream">
                <span className="block font-semibold text-navy">{item.name}</span>
                <span className="block text-sm text-muted-strong">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {value.actions && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.actions.map((action) =>
            action.to ? (
              <Link key={action.label} to={action.to} onClick={onNavigate} className={chip}>
                {action.label}
              </Link>
            ) : (
              <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" className={chip}>
                <ExternalLink aria-hidden className="size-4 text-saffron-text" />
                {action.label}
                <span className="sr-only"> {t('common.newTab')}</span>
              </a>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const settings = useSettings()
  const { products, categories, priceState } = useCatalog()
  const titleId = useId()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, from: 'bot', text: t('assistant.welcome') }])

  const ctx: AssistantContext = { t, lang: i18n.language, settings, products, categories, priceState }

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  // Ids are taken here, not inside the state updater (React may run an updater twice).
  const ids = () => [nextId.current++, nextId.current++] as const

  function push(question: string, reply: AssistantAnswer) {
    const [userId, botId] = ids()
    setMessages((list) => [
      ...list,
      { id: userId, from: 'user', text: question },
      { id: botId, from: 'bot', text: reply.text, answer: reply },
    ])
  }

  // Step 2: the shop data had no answer, so ask the AI (with the catalogue as its facts).
  async function askAi(question: string, local: AssistantAnswer) {
    const [userId, pendingId] = ids()
    setMessages((list) => [
      ...list,
      { id: userId, from: 'user', text: question },
      { id: pendingId, from: 'bot', text: t('assistant.thinking'), pending: true },
    ])
    setBusy(true)
    const { askShopAi } = await import('../../services/assistantAi')
    const result = await askShopAi(question, productContext(question, ctx))
    setBusy(false)
    const reply: AssistantAnswer = result.ok
      ? { text: result.answer, actions: local.actions, fromAi: true }
      : result.reason === 'busy'
        ? { text: t('assistant.busy'), actions: local.actions }
        : local
    setMessages((list) =>
      list.map((message) => (message.id === pendingId ? { id: pendingId, from: 'bot', text: reply.text, answer: reply } : message)),
    )
  }

  function ask(event: FormEvent) {
    event.preventDefault()
    const question = draft.trim()
    if (!question || busy) return
    const local = answer(question, ctx)
    if (local.unanswered) void askAi(question, local)
    else push(question, local)
    setDraft('')
  }

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-50 flex h-[min(36rem,72dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-soft-paper shadow-lift sm:inset-x-auto sm:right-4 sm:w-[24rem] lg:right-6 lg:bottom-6"
    >
      <header className="flex items-center gap-3 bg-navy px-4 py-3 text-paper">
        <Store aria-hidden className="size-6 shrink-0 text-soft-saffron" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base leading-tight font-semibold">
            {t('assistant.title')}
          </h2>
          <p className="text-sm text-powder">{t('assistant.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('assistant.close')}
          className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-ink"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>

      <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((message) => (
          <div key={message.id} className={message.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-base ${
                message.from === 'user' ? 'rounded-br-md bg-navy text-paper' : 'rounded-bl-md border border-border bg-paper text-ink'
              }`}
            >
              <span className="sr-only">{message.from === 'user' ? t('assistant.you') : t('assistant.bot')}: </span>
              {message.answer ? (
                <BotAnswer value={message.answer} onNavigate={onClose} />
              ) : message.pending ? (
                <span className="inline-flex items-center gap-2 text-muted-strong">
                  <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
                  {message.text}
                </span>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => push(t(`assistant.quick.${topic}`), topicAnswer(topic, ctx))}
              className={chip}
            >
              {t(`assistant.quick.${topic}`)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={ask} className="flex items-center gap-2 border-t border-border bg-paper p-3">
        <label htmlFor={inputId} className="sr-only">
          {t('assistant.inputLabel')}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('assistant.placeholder')}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={200}
          className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-soft-paper px-4 text-base text-ink placeholder:text-muted-strong focus:border-navy"
        />
        <button
          type="submit"
          aria-label={t('assistant.send')}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-paper transition-colors hover:bg-ink"
        >
          <Send aria-hidden className="size-5" />
        </button>
      </form>
    </section>
  )
}
