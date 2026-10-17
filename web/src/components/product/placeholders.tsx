import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import * as THREE from 'three'
import type { ModelColor, ModelSpec } from '../../types/models'
import type { Motion } from './Product3DViewer'

// Procedural stand-ins until real .glb models exist.
// Colours are read from the Tailwind theme tokens (CSS variables), never hard-coded here.

type Token = ModelColor | 'soft-saffron' | 'soft-paper'

function cssColor(token: Token): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim()
}

const materials = new Map<string, THREE.MeshStandardMaterial>()
function mat(token: Token, roughness = 0.75) {
  const key = `${token}:${roughness}`
  let m = materials.get(key)
  if (!m) {
    // An unknown token resolves to "" — use navy rather than an undefined colour.
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(cssColor(token) || cssColor('navy')), roughness })
    materials.set(key, m)
  }
  return m
}

const box = new THREE.BoxGeometry(1, 1, 1)
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 40)
const cone = new THREE.ConeGeometry(1, 1, 24)
const plane = new THREE.PlaneGeometry(1, 1)

let shadowMaterial: THREE.MeshBasicMaterial | undefined
/** Soft elliptical floor shadow (radial gradient in navy, per DESIGN.md). */
function getShadowMaterial() {
  if (shadowMaterial) return shadowMaterial
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const [r, g, b] = (cssColor('navy').match(/[0-9a-f]{2}/gi) ?? []).map((h) => parseInt(h, 16))
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.32)`)
    gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.12)`)
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  shadowMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  return shadowMaterial
}

function FloorShadow({ scale }: { scale: number }) {
  return (
    <mesh
      geometry={plane}
      material={getShadowMaterial()}
      rotation-x={-Math.PI / 2}
      position-y={0.002}
      scale={[scale, scale * 0.8, 1]}
    />
  )
}

const PEDESTAL_H = 0.34

function Pedestal() {
  return (
    <mesh
      geometry={cylinder}
      material={mat('soft-saffron', 0.85)}
      scale={[1.05, PEDESTAL_H, 1.05]}
      position-y={PEDESTAL_H / 2}
    />
  )
}

/** Notebook: thin box with a coloured cover and white page edges. */
function NotebookStack({ color, count, base = PEDESTAL_H }: { color: ModelColor; count: number; base?: number }) {
  const cover = mat(color, 0.6)
  const pages = mat('paper', 0.9)
  const thickness = 0.07
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          geometry={box}
          // BoxGeometry face order: +x, -x (spine), +y, -y, +z, -z
          material={[pages, cover, cover, cover, pages, pages]}
          scale={[1, thickness, 1.4]}
          position-y={base + thickness / 2 + i * (thickness + 0.006)}
          rotation-y={i % 2 ? 0.14 : -0.06}
        />
      ))}
    </>
  )
}

/** Pen: cylinder body with a cap and a conical tip (points down at -y). */
function Pen({ color, ...group }: { color: ModelColor } & JSX.IntrinsicElements['group']) {
  return (
    <group {...group}>
      <mesh geometry={cylinder} material={mat(color, 0.4)} scale={[0.045, 1.1, 0.045]} />
      <mesh geometry={cylinder} material={mat('ink', 0.4)} scale={[0.052, 0.3, 0.052]} position-y={0.42} />
      <mesh
        geometry={cone}
        material={mat('ink', 0.5)}
        scale={[0.045, 0.14, 0.045]}
        position-y={-0.62}
        rotation-x={Math.PI}
      />
    </group>
  )
}

function PenRow({ color, count }: { color: ModelColor; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Pen
          key={i}
          color={color}
          position={[0, PEDESTAL_H + 0.055, (i - (count - 1) / 2) * 0.17]}
          rotation={[0, (i % 2 ? 0.08 : -0.05) + 0.3, Math.PI / 2]}
        />
      ))}
    </>
  )
}

/** Paper stack: layered reams with a coloured wrapper band. */
function PaperStack({
  band,
  count,
  ...group
}: { band: ModelColor; count: number } & JSX.IntrinsicElements['group']) {
  const ream = 0.1
  return (
    <group {...group}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position-y={ream / 2 + i * (ream + 0.006)} rotation-y={((i % 3) - 1) * 0.05}>
          <mesh geometry={box} material={mat(i % 2 ? 'soft-paper' : 'paper', 0.95)} scale={[1, ream, 1.41]} />
          <mesh geometry={box} material={mat(band, 0.6)} scale={[1.01, ream * 1.02, 0.34]} />
        </group>
      ))}
    </group>
  )
}

/** Box: a closed box (geometry box, writing pad) with a paper-white lid edge. */
function BoxStack({ color, count }: { color: ModelColor; count: number }) {
  const height = 0.22
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position-y={PEDESTAL_H + height / 2 + i * (height + 0.01)} rotation-y={i % 2 ? 0.1 : -0.05}>
          <mesh geometry={box} material={mat(color, 0.55)} scale={[1.2, height, 0.8]} />
          <mesh geometry={box} material={mat('paper', 0.9)} scale={[1.21, 0.02, 0.81]} position-y={height / 2 - 0.03} />
        </group>
      ))}
    </>
  )
}

/** Bottle: body with a paper label band, shoulder, neck and cap. Scaled to fit the card camera. */
function Bottle({ color, x }: { color: ModelColor; x: number }) {
  return (
    <group position={[x, PEDESTAL_H, 0]} scale={0.8}>
      <mesh geometry={cylinder} material={mat(color, 0.35)} scale={[0.26, 0.8, 0.26]} position-y={0.4} />
      <mesh geometry={cylinder} material={mat('paper', 0.8)} scale={[0.265, 0.22, 0.265]} position-y={0.42} />
      <mesh geometry={cone} material={mat(color, 0.35)} scale={[0.26, 0.28, 0.26]} position-y={0.94} />
      <mesh geometry={cylinder} material={mat(color, 0.35)} scale={[0.09, 0.2, 0.09]} position-y={1.12} />
      <mesh geometry={cylinder} material={mat('ink', 0.5)} scale={[0.1, 0.07, 0.1]} position-y={1.25} />
    </group>
  )
}

function BottleRow({ color, count }: { color: ModelColor; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Bottle key={i} color={color} x={(i - (count - 1) / 2) * 0.5} />
      ))}
    </>
  )
}

/** Backpack: body, front pocket with a zip line, and a top handle. */
function Backpack({ color }: { color: ModelColor }) {
  return (
    <group position-y={PEDESTAL_H} scale={0.85}>
      <mesh geometry={box} material={mat(color, 0.8)} scale={[0.9, 1.0, 0.5]} position-y={0.5} />
      <mesh geometry={box} material={mat(color, 0.7)} scale={[0.7, 0.42, 0.14]} position={[0, 0.3, 0.31]} />
      <mesh geometry={box} material={mat('paper', 0.6)} scale={[0.72, 0.025, 0.02]} position={[0, 0.52, 0.385]} />
      <mesh geometry={box} material={mat('ink', 0.6)} scale={[0.3, 0.06, 0.06]} position={[0, 1.05, 0]} />
    </group>
  )
}

function ProductModel({ spec }: { spec: ModelSpec }) {
  const count = spec.count ?? 1
  return (
    <>
      <Pedestal />
      {spec.kind === 'notebook' && <NotebookStack color={spec.color} count={count} />}
      {spec.kind === 'box' && <BoxStack color={spec.color} count={count} />}
      {spec.kind === 'bottle' && <BottleRow color={spec.color} count={count} />}
      {spec.kind === 'bag' && <Backpack color={spec.color} />}
      {spec.kind === 'pen' && <PenRow color={spec.color} count={count} />}
      {spec.kind === 'paper' && <PaperStack band={spec.color} count={count} position-y={PEDESTAL_H} />}
      <FloorShadow scale={3.4} />
    </>
  )
}

/** Hero podium: stepped saffron blocks with a notebook stack, a pen cup and a paper stack. */
function HeroModel() {
  const block = mat('soft-saffron', 0.85)
  const penColors: ModelColor[] = ['navy', 'cat-long', 'ink', 'cat-pens', 'navy']
  return (
    <>
      <mesh geometry={box} material={block} scale={[1.7, 0.55, 1.5]} position={[-1.15, 0.275, 0.15]} />
      <mesh geometry={box} material={block} scale={[1.4, 1.0, 1.3]} position={[0.45, 0.5, -0.6]} />
      <mesh geometry={box} material={block} scale={[1.5, 0.32, 1.4]} position={[0.95, 0.16, 0.85]} />

      <group position={[-1.15, 0, 0.15]} scale={0.85}>
        <NotebookStack color="cat-long" count={5} base={0.55 / 0.85} />
      </group>

      <group position={[0.45, 1.0, -0.6]}>
        <mesh geometry={cylinder} material={mat('navy', 0.5)} scale={[0.3, 0.55, 0.3]} position-y={0.275} />
        {penColors.map((color, i) => {
          const a = (i / penColors.length) * Math.PI * 2
          return (
            <Pen
              key={i}
              color={color}
              position={[Math.cos(a) * 0.12, 0.72, Math.sin(a) * 0.12]}
              rotation={[Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18 + Math.PI]}
            />
          )
        })}
      </group>

      <PaperStack band="cat-pens" count={3} position={[0.95, 0.32, 0.85]} scale={0.8} />
      <FloorShadow scale={7} />
    </>
  )
}

type Props = { model: ModelSpec | 'hero'; motion: Motion; onReady: () => void }

function Scene({ model, motion, onReady }: Props) {
  const group = useRef<THREE.Group>(null)
  const camera = useRef<THREE.PerspectiveCamera>(null)
  const notified = useRef(false)
  const hero = model === 'hero'
  const baseFov = hero ? 30 : 32

  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    camera.current?.lookAt(0, hero ? 0.55 : 0.35, 0)
  }, [hero])

  // The canvas renders on demand: ask for the first frame so the model appears (and onReady fires).
  useEffect(() => invalidate(), [invalidate])

  useFrame((state, rawDelta) => {
    // After an idle period the first delta covers the whole pause; cap it so models don't jump.
    const delta = Math.min(rawDelta, 1 / 30)
    if (!notified.current) {
      notified.current = true
      onReady()
    }
    if (motion.spinning && !motion.dragging) motion.angle += delta * 0.5
    const g = group.current
    let moving = motion.spinning || motion.dragging
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, motion.angle, 12, delta)
      if (Math.abs(motion.angle - g.rotation.y) > 0.0005) moving = true
    }
    // Keep frames coming only while this model is still moving.
    if (moving) state.invalidate()

    // Keep the model inside narrow (portrait) views by widening the vertical field of view.
    const cam = camera.current
    if (cam) {
      const fov =
        cam.aspect < 1
          ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) / cam.aspect))
          : baseFov
      if (Math.abs(cam.fov - fov) > 0.01) {
        cam.fov = fov
        cam.updateProjectionMatrix()
      }
    }
  })

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={baseFov} position={hero ? [0, 3.2, 7.8] : [0, 1.9, 3.9]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
      <group ref={group}>{hero ? <HeroModel /> : <ProductModel spec={model} />}</group>
    </>
  )
}

/** Lazy-loaded: a tracked <div> whose contents render into the shared canvas. */
export default function ModelView(props: Props) {
  return (
    <View className="absolute inset-0">
      <Scene {...props} />
    </View>
  )
}
