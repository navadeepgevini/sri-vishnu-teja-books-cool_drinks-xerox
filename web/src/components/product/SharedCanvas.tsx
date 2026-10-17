import { useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { registerRenderer } from './renderLoop'

// Views render with autoClear off, so wipe the whole canvas first on every rendered frame
// (priority 0 runs before the views) — otherwise moved views leave trails.
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false)
    gl.clear(true, true, false)
  }, 0)
  return null
}

// The canvas renders on demand instead of 60 times a second forever. A frame is requested whenever
// something on screen may have moved: scrolling (any scroller), resizing, DOM changes (filters,
// language, loading states), fonts finishing loading, and viewer hover/drag via renderLoop.
// While a model is still rotating, the scene itself keeps requesting frames (see placeholders.tsx).
function RenderOnChange() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const request = () => invalidate()
    const unregister = registerRenderer(request)
    window.addEventListener('scroll', request, { passive: true, capture: true })
    window.addEventListener('resize', request)
    const mutations = new MutationObserver(request)
    mutations.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
    document.fonts?.addEventListener('loadingdone', request)
    request()
    return () => {
      unregister()
      window.removeEventListener('scroll', request, { capture: true })
      window.removeEventListener('resize', request)
      mutations.disconnect()
      document.fonts?.removeEventListener('loadingdone', request)
    }
  }, [invalidate])

  return null
}

/** The single WebGL context. Every Product3DViewer draws into its own rectangle of this canvas. */
export default function SharedCanvas() {
  return (
    <Canvas
      aria-hidden
      frameloop="demand"
      eventSource={document.getElementById('root') ?? undefined}
      // Above page content, below the sticky header / bottom nav (z-50). Never blocks clicks.
      style={{ position: 'fixed', inset: 0, zIndex: 30, pointerEvents: 'none' }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <ClearEachFrame />
      <RenderOnChange />
      <View.Port />
    </Canvas>
  )
}
