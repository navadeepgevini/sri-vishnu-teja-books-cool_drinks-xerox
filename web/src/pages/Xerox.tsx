import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Image as ImageIcon, MessageCircle, Paperclip, Trash2, Upload } from 'lucide-react'
import RequireSignIn from '../components/common/RequireSignIn'
import { useAccount } from '../hooks/useAccount'
import { useSettings } from '../hooks/useSettings'
import { whatsappHref } from '../data/shop'

// Word, PDF and photos. Files never leave the browser: they go straight to WhatsApp through the
// share sheet, or the customer attaches them in the chat we open (wa.me links cannot carry files).
const ACCEPT = '.pdf,.doc,.docx,image/*'
const ALLOWED = /\.(pdf|docx?|jpe?g|png|webp|heic|heif)$/i
const MAX_FILES = 10
const MAX_MB = 25

function sizeLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const isImage = (file: File) => file.type.startsWith('image/')

function XeroxForm() {
  const { t } = useTranslation()
  const settings = useSettings()
  const account = useAccount()
  const inputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [sent, setSent] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<number, number>>({})
  const [uploadFailed, setUploadFailed] = useState(false)

  const [copies, setCopies] = useState(1)
  const [colour, setColour] = useState(false)
  const [doubleSide, setDoubleSide] = useState(false)
  const [note, setNote] = useState('')

  function addFiles(incoming: FileList | null) {
    if (!incoming?.length) return
    const found: string[] = []
    const kept: File[] = []

    for (const file of Array.from(incoming)) {
      if (!ALLOWED.test(file.name)) {
        found.push(t('pages.xerox.errorType', { name: file.name }))
        continue
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        found.push(t('pages.xerox.errorTooBig', { name: file.name, max: MAX_MB }))
        continue
      }
      kept.push(file)
    }

    setFiles((current) => {
      const room = MAX_FILES - current.length
      if (kept.length > room) found.push(t('pages.xerox.errorTooMany', { max: MAX_FILES }))
      return [...current, ...kept.slice(0, Math.max(0, room))]
    })
    setProblems(found)
    setSent(false)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    event.target.value = '' // let the same file be picked again after removing it
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index))
    setSent(false)
  }

  const name = account.status === 'signed-in' ? account.account.name : ''
  const email = account.status === 'signed-in' ? account.account.email : ''

  function orderLines(code?: string): string[] {
    return [
      t('pages.xerox.message.intro', { name, email }),
      ...(code ? [t('pages.xerox.message.code', { code })] : []),
      ...files.map((file, index) => t('pages.xerox.message.file', { index: index + 1, name: file.name })),
      t('pages.xerox.message.copies', { count: copies }),
      t('pages.xerox.message.print', {
        type: colour ? t('pages.xerox.colour') : t('pages.xerox.bw'),
        sides: doubleSide ? t('pages.xerox.double') : t('pages.xerox.single'),
      }),
      ...(note.trim() ? [t('pages.xerox.message.note', { note: note.trim() })] : []),
    ]
  }

  const fallbackHref = `${whatsappHref(settings.whatsapp)}?text=${encodeURIComponent(
    [...orderLines(), t('pages.xerox.message.attach')].join('\n'),
  )}`

  /**
   * Uploads the files, then opens WhatsApp with a download link for each one, so the shop gets the
   * files on a phone and on a computer alike (a wa.me link cannot carry files itself).
   */
  async function send() {
    if (account.status !== 'signed-in') return
    setUploadFailed(false)
    setUploading(true)
    setProgress({})
    try {
      const { makeOrderCode, uploadPrintFiles } = await import('../services/uploads')
      const code = makeOrderCode()
      const links = await uploadPrintFiles(files, code, ({ index, percent }) =>
        setProgress((current) => ({ ...current, [index]: percent })),
      )
      const text = [
        ...orderLines(code),
        ...links.map((link, index) => t('pages.xerox.message.link', { index: index + 1, url: link })),
      ].join('\n')
      window.open(`${whatsappHref(settings.whatsapp)}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
      setSent(true)
    } catch (error) {
      // Storage not turned on yet, no signal, or the rules rejected the file: fall back to attaching by hand.
      console.error('Uploading the xerox files failed', error)
      setUploadFailed(true)
    } finally {
      setUploading(false)
    }
  }

  /** Fallback when the upload fails: share the files (phone) or open the chat for manual attaching. */
  async function sendWithoutUpload() {
    const text = orderLines().join('\n')
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files, text, title: t('pages.xerox.shareTitle') })
        setSent(true)
        return
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return // the customer closed the share sheet
        console.warn('Sharing files failed; opening WhatsApp with the details instead.', error)
      }
    }
    window.open(fallbackHref, '_blank', 'noopener')
    setSent(true)
  }

  return (
    <section aria-labelledby="xerox-page-title" className="bg-soft-paper">
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-10 lg:py-12">
        <h1 id="xerox-page-title" className="text-2xl font-bold text-navy lg:text-[32px] lg:leading-10">
          {t('pages.xerox.title')}
        </h1>
        <p className="mt-1 text-base text-muted-strong">{t('pages.xerox.subtitle')}</p>

        {/* Pick files */}
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-6 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? 'border-navy bg-cream' : 'border-border bg-paper'
          }`}
        >
          <Upload aria-hidden className="mx-auto mb-2 size-8 text-saffron-text" />
          <p className="text-base font-semibold text-ink">{t('pages.xerox.dropTitle')}</p>
          <p className="mt-1 text-sm text-muted-strong">{t('pages.xerox.dropHint', { max: MAX_MB, files: MAX_FILES })}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-base font-semibold text-paper transition-colors hover:bg-ink"
          >
            <Paperclip aria-hidden className="size-5" />
            {t('pages.xerox.choose')}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            onChange={onPick}
            className="sr-only"
            aria-label={t('pages.xerox.choose')}
          />
        </div>

        <div aria-live="polite">
          {problems.length > 0 && (
            <ul className="mt-3 space-y-1">
              {problems.map((problem) => (
                <li key={problem} className="text-sm font-semibold text-error">
                  {problem}
                </li>
              ))}
            </ul>
          )}

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-paper p-3"
                >
                  {isImage(file) ? (
                    <ImageIcon aria-hidden className="size-5 shrink-0 text-saffron-text" />
                  ) : (
                    <FileText aria-hidden className="size-5 shrink-0 text-saffron-text" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-ink">{file.name}</span>
                    <span className="block text-sm text-muted-strong">
                      {sizeLabel(file.size)}
                      {uploading && progress[index] !== undefined && ` · ${progress[index]}%`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={t('pages.xerox.remove', { name: file.name })}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-error transition-colors hover:bg-soft-paper"
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Print options */}
        <fieldset className="mt-6 rounded-2xl border border-border bg-paper p-5">
          <legend className="px-1 text-base font-semibold text-navy">{t('pages.xerox.options')}</legend>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="xerox-copies" className="text-base text-ink">
              {t('pages.xerox.copies')}
            </label>
            <input
              id="xerox-copies"
              type="number"
              min={1}
              max={50}
              value={copies}
              onChange={(event) => setCopies(Math.min(50, Math.max(1, Number(event.target.value) || 1)))}
              className="min-h-11 w-24 rounded-xl border border-border bg-paper px-3 text-base text-ink focus:border-navy"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { set: () => setColour(false), label: t('pages.xerox.bw'), active: !colour },
              { set: () => setColour(true), label: t('pages.xerox.colour'), active: colour },
            ].map(({ set, label, active }) => (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={set}
                className={`min-h-11 rounded-full border px-4 text-base font-semibold transition-colors ${
                  active ? 'border-navy bg-navy text-paper' : 'border-border bg-paper text-ink hover:bg-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { set: () => setDoubleSide(false), label: t('pages.xerox.single'), active: !doubleSide },
              { set: () => setDoubleSide(true), label: t('pages.xerox.double'), active: doubleSide },
            ].map(({ set, label, active }) => (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={set}
                className={`min-h-11 rounded-full border px-4 text-base font-semibold transition-colors ${
                  active ? 'border-navy bg-navy text-paper' : 'border-border bg-paper text-ink hover:bg-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label htmlFor="xerox-note" className="mt-4 block text-base text-ink">
            {t('pages.xerox.note')}
          </label>
          <textarea
            id="xerox-note"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('pages.xerox.notePlaceholder')}
            className="mt-1 w-full rounded-xl border border-border bg-paper p-3 text-base text-ink placeholder:text-muted-strong focus:border-navy"
          />
        </fieldset>

        {/* Send */}
        <div className="mt-6">
          <button
            type="button"
            onClick={send}
            disabled={files.length === 0 || uploading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-base font-semibold text-paper transition-colors enabled:hover:bg-ink disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-strong"
          >
            <MessageCircle aria-hidden className="size-5" />
            {uploading ? t('pages.xerox.sending') : t('pages.xerox.send')}
          </button>
          <p className="mt-2 text-sm text-muted-strong">{t('pages.xerox.sendHint')}</p>

          {uploadFailed && (
            <div role="alert" className="mt-4 rounded-2xl border border-border bg-cream p-4">
              <p className="text-base font-semibold text-navy">{t('pages.xerox.uploadFailedTitle')}</p>
              <p className="mt-1 text-sm text-muted-strong">{t('pages.xerox.uploadFailedBody')}</p>
              <button
                type="button"
                onClick={sendWithoutUpload}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-navy bg-paper px-5 text-base font-semibold text-navy transition-colors hover:bg-paper"
              >
                <MessageCircle aria-hidden className="size-[18px]" />
                {t('pages.xerox.sendWithoutFiles')}
              </button>
            </div>
          )}

          {sent && (
            <p role="status" className="mt-2 text-sm font-semibold text-success-text">
              {uploadFailed ? t('pages.xerox.sentNote') : t('pages.xerox.sentWithFilesNote')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Xerox() {
  return (
    <RequireSignIn>
      <XeroxForm />
    </RequireSignIn>
  )
}
