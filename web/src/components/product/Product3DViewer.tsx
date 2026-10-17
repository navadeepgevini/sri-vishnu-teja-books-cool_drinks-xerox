import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { PointerEvent, MouseEvent } from 'react'
import type { ModelSpec } from '../../types/models'
import ErrorBoundary from '../common/ErrorBoundary'
import { requestRender } from './renderLoop'

const SharedCanvas = lazy(() => import('./SharedCanvas'))
const ModelView = lazy(() => import('./placeholders'))

/** Rotation state shared with the 3D scene. Mutated in place and read every frame (no re-renders). */
export type Motion = { angle: number; spinning: boolean; dragging: boolean }

// One WebGL canvas for the whole app, loaded the first time any viewer gets near the viewport.
// 'failed' (WebGL unavailable, or the 3D code could not load) is final for the session.
type CanvasStatus = 'idle' | 'requested' | 'failed'
let canvasStatus: CanvasStatus = 'idle'
const listeners = new Set<() => void>()

function setCanvasStatus(next: CanvasStatus) {
  if (canvasStatus === next || canvasStatus === 'failed') return
  canvasStatus = next
  listeners.forEach((notify) => notify())
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

const getCanvasStatus = () => canvasStatus

export function Canvas3DHost() {
  const status = useSyncExternalStore(subscribe, getCanvasStatus)
  if (status !== 'requested') return null
  return (
    <ErrorBoundary fallback={null} onError={() => setCanvasStatus('failed')}>
      <Suspense fallback={null}>
        <SharedCanvas />
      </Suspense>
    </ErrorBoundary>
  )
}

/** Shown instead of the model when 3D is unavailable: a plain pedestal, never an endless shimmer. */
function StaticPedestal() {
  return <div aria-hidden className="absolute inset-x-[22%] bottom-[16%] h-[16%] rounded-[50%] bg-soft-saffron" />
}

type Props = {
  model: ModelSpec | 'hero'
  /** Accessible name. Omit when the viewer is decorative (e.g. inside an already-labelled link). */
  label?: string
  /** Default: 'hover' on devices with a fine pointer, otherwise 'visible'. */
  autoRotate?: 'hover' | 'visible'
}

const DRAG_SPEED = 0.012
const DRAG_THRESHOLD = 4

/** Fills its (relatively positioned) parent. */
export default function Product3DViewer({ model, label, autoRotate }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [motion] = useState<Motion>(() => ({ angle: 0.6, spinning: false, dragging: false }))
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const canvasFailed = useSyncExternalStore(subscribe, getCanvasStatus) === 'failed'
  const unavailable = failed || canvasFailed
  const drag = useRef<{ startX: number; x: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)

  // Lazy-load: mount the 3D view only when the viewer is close to the viewport.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        setCanvasStatus('requested')
        io.disconnect()
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Auto-rotate on hover (desktop) or while visible (touch), never with reduced motion.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const mode = autoRotate ?? (fineHover ? 'hover' : 'visible')
    let active = false
    const sync = () => {
      motion.spinning = active && !reduced.matches
      requestRender() // the canvas renders on demand; wake it so the change shows
    }
    reduced.addEventListener('change', sync)

    if (mode === 'hover') {
      const root = el.closest<HTMLElement>('[data-hover-root]') ?? el
      const on = () => {
        active = true
        sync()
      }
      const off = () => {
        active = false
        sync()
      }
      root.addEventListener('pointerenter', on)
      root.addEventListener('pointerleave', off)
      root.addEventListener('focusin', on)
      root.addEventListener('focusout', off)
      return () => {
        reduced.removeEventListener('change', sync)
        root.removeEventListener('pointerenter', on)
        root.removeEventListener('pointerleave', off)
        root.removeEventListener('focusin', on)
        root.removeEventListener('focusout', off)
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting
        sync()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      reduced.removeEventListener('change', sync)
      io.disconnect()
    }
  }, [autoRotate, motion])

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    drag.current = { startX: e.clientX, x: e.clientX, moved: false }
    suppressClick.current = false
    motion.dragging = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    motion.angle += (e.clientX - d.x) * DRAG_SPEED
    d.x = e.clientX
    requestRender()
    if (Math.abs(e.clientX - d.startX) > DRAG_THRESHOLD) d.moved = true
  }

  function endDrag() {
    if (drag.current?.moved) suppressClick.current = true
    drag.current = null
    motion.dragging = false
  }

  // A drag inside a link (category tile) must not also follow the link.
  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return
    suppressClick.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  return (
    <div
      ref={ref}
      {...a11y}
      className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
      {unavailable ? (
        <StaticPedestal />
      ) : (
        !ready && <div className="skeleton absolute inset-x-[18%] inset-y-[14%] rounded-2xl" />
      )}
      {near && !unavailable && (
        <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <ModelView model={model} motion={motion} onReady={() => setReady(true)} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}
