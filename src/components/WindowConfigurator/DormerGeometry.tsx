import { useRef, useEffect, useMemo, useState } from "react"
import * as THREE from 'three'
import { useGLTF, Center, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { WindowConfig } from './types'

// ─── Roof Top Model Component ──────────────────────────────────────────────
export function RoofTopModel({ 
  position = [0, 0, 0], 
  targetWidth = 2,
  targetDepth = 1,
}: { 
  position?: [number, number, number]
  targetWidth?: number
  targetDepth?: number
}) {
  const { scene } = useGLTF('/models/rooftop.glb') as any
  const cloned = useMemo(() => scene.clone(), [scene])
  const innerRef = useRef<THREE.Group>(null)
  const [bottomOffset, setBottomOffset] = useState(0)
  const [centerX, setCenterX] = useState(0)
  const [centerZ, setCenterZ] = useState(0)

  useEffect(() => {
    if (!innerRef.current) return
    const b = new THREE.Box3().setFromObject(innerRef.current)
    if (b.isEmpty()) return
    const center = new THREE.Vector3()
    b.getCenter(center)
    setBottomOffset(-b.min.y)
    setCenterX(-center.x)
    setCenterZ(-center.z)
  }, [cloned])

  const { scaleX, scaleZ, scaleY } = useMemo(() => {
    const b = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    b.getSize(size)
    const sx = targetWidth / Math.max(size.x, 0.001)
    const sz = targetDepth / Math.max(size.z, 0.001)
    const sy = Math.min(sx, sz)
    return { scaleX: sx, scaleZ: sz, scaleY: sy }
  }, [cloned, targetWidth, targetDepth])

  return (
    <group position={position}>
      <group scale={[scaleX, scaleY, scaleZ]}>
        <group ref={innerRef} position={[centerX, bottomOffset, centerZ]}>
          <primitive object={cloned} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/rooftop.glb')

const mm = (v: number) => v / 1000

const WOOD_TILE_MM = 400

function woodRepeatFromSize(widthM: number, heightM: number) {
  const tile = mm(WOOD_TILE_MM)
  return {
    u: Math.max(widthM / tile, 0.25),
    v: Math.max(heightM / tile, 0.25),
  }
}

function createWoodMaterial(
  repeatU: number,
  repeatV: number,
  woodCol: THREE.Texture,
  woodRgh: THREE.Texture,
  woodNrm: THREE.Texture,
  side: THREE.Side = THREE.DoubleSide,
): THREE.MeshStandardMaterial {
  const cloneWithRepeat = (t: THREE.Texture) => {
    const c = t.clone()
    c.wrapS = c.wrapT = THREE.RepeatWrapping
    c.repeat.set(repeatU, repeatV)
    c.needsUpdate = true
    return c
  }
  return new THREE.MeshStandardMaterial({
    map: cloneWithRepeat(woodCol),
    roughnessMap: cloneWithRepeat(woodRgh),
    normalMap: cloneWithRepeat(woodNrm),
    roughness: 0.75,
    metalness: 0.0,
    side,
  })
}

const CLAD_TILE_MM = 850

function claddingRepeatV(heightM: number) {
  return Math.max(heightM / mm(CLAD_TILE_MM), 0.25)
}

const SIDE_W       = mm(190)
const FRONT_T      = mm(140)
const FASCIA_H     = mm(150)
const FASCIA_T     = mm(30)
const FRAME_T      = mm(60)
const GLASS_T      = mm(8)
const SOFFIT_T     = mm(60)
const FLOOR_PANEL  = mm(40)

const ROOF_OVERHANG = mm(220)
const ROOF_SIDE_OVH = mm(80)
const ROOF_SLAB_T   = mm(220)
const ROOF_FSC_H    = mm(160)
const ROOF_FSC_T    = mm(40)

export function makeCheekGeom(H: number, D: number): THREE.BufferGeometry {
  const positions = new Float32Array([
    0,      0, 0,   SIDE_W, 0, 0,   0,      H, 0,
    SIDE_W, 0, 0,   SIDE_W, H, 0,   0,      H, 0,
    0,      H,  0,   SIDE_W, H,  0,   0,      H, -D,
    SIDE_W, H,  0,   SIDE_W, H, -D,   0,      H, -D,
    0,      0, 0,   0,      H, -D,   SIDE_W, 0,  0,
    SIDE_W, 0, 0,   0,      H, -D,   SIDE_W, H, -D,
    0, 0,  0,   0, H,  0,   0, H, -D,
    SIDE_W, 0,  0,   SIDE_W, H, -D,   SIDE_W, H, 0,
  ])
  const sw = SIDE_W
  const uvs = new Float32Array([
    0, 0,   sw/sw, 0,   0, 1,
    sw/sw, 0,   sw/sw, 1,   0, 1,
    0, 0,   sw/sw, 0,   0, 1,
    sw/sw, 0,   sw/sw, 1,   0, 1,
    0, 0,   0, 1,   sw/sw, 0,
    sw/sw, 0,   0, 1,   sw/sw, 1,
    0, 0,   0, 1,   1, 1,
    0, 0,   1, 1,   0, 1,
  ])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  g.computeVertexNormals()
  g.addGroup(0,  18, 0)
  g.addGroup(18,  3, 1)
  g.addGroup(21,  3, 2)
  return g
}

function createRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 512, 512)

  const tileW = 64
  const tileH = 40
  const gap = 2

  for (let row = 0; row < 512 / tileH + 2; row++) {
    const offset = (row % 2) * (tileW / 2)
    for (let col = -1; col < 512 / tileW + 1; col++) {
      const x = col * tileW + offset
      const y = row * tileH

      const grad = ctx.createLinearGradient(x, y, x, y + tileH - gap)
      grad.addColorStop(0, '#2a2a2a')
      grad.addColorStop(0.5, '#1a1a1a')
      grad.addColorStop(1, '#0f0f0f')

      ctx.fillStyle = grad
      ctx.fillRect(x + gap, y + gap, tileW - gap * 2, tileH - gap)

      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + gap, y + gap, tileW - gap * 2, tileH - gap)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

export function RoofTileCube({ position, size = [1, 1, 1] }: {
  position: [number, number, number]
  size?: [number, number, number]
}) {
  const tileTexture = useMemo(() => createRoofTileTexture(), [])
  const matRef = useRef(new THREE.MeshStandardMaterial({
    map: tileTexture,
    bumpMap: tileTexture,
    bumpScale: 0.08,
    roughness: 0.6,
    metalness: 0.1,
    color: '#ffffff'
  }))

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <primitive object={matRef.current} />
    </mesh>
  )
}

export function FrontWall({ W, H, color, winW, winH, winYBottom, subWinWs, penantWs, styleType, claddingMaterial }: {
  W: number; H: number; color: string;
  winW?: number; winH?: number; winYBottom?: number;
  subWinWs?: number[]; penantWs?: number[];
  styleType?: 'traditional' | 'kader';
  claddingMaterial?: 'rondkantpanelen' | 'hpl';
}) {
  const animatedColor = useAnimatedColor(color, 0.25)
  const outerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, color }))
  const innerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, color: '#FFFFFF' }))
  useFrame(() => { outerMatRef.current.color.lerp(animatedColor, 0.25) })

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')
  const revealMat = useMemo(() => {
    const wc = woodCol.clone(); wc.wrapS = wc.wrapT = THREE.RepeatWrapping; wc.repeat.set(2, 1); wc.needsUpdate = true
    const wr = woodRgh.clone(); wr.wrapS = wr.wrapT = THREE.RepeatWrapping; wr.repeat.set(2, 1); wr.needsUpdate = true
    const wn = woodNrm.clone(); wn.wrapS = wn.wrapT = THREE.RepeatWrapping; wn.repeat.set(2, 1); wn.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: wc, roughnessMap: wr, normalMap: wn, roughness: 0.75, metalness: 0.0 })
  }, [woodCol, woodRgh, woodNrm])

  const isTraditional = styleType === 'traditional'
  const showCladding = isTraditional && claddingMaterial !== 'hpl'

  const hasWin = !!(winW && winH)
  const yBot   = hasWin ? (winYBottom ?? (H - (winH as number)) / 2) : 0
  const botH   = hasWin ? yBot : H
  const topH   = hasWin ? H - yBot - (winH as number) : 0

  const claddingLinesTex = useMemo(() => {
    if (!showCladding) return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      for (let y = 0; y <= 256; y += 64) {
        ctx.strokeStyle = 'rgba(20,20,20,0.75)'
        ctx.lineWidth = 6
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [showCladding])

  const cladTexs = useMemo(() => {
    const make = (h: number) => {
      if (!claddingLinesTex || h <= 0) return null
      const t = claddingLinesTex.clone()
      t.repeat.set(1, claddingRepeatV(h))
      t.needsUpdate = true
      return t
    }
    return {
      full:   make(H),
      bottom: make(botH),
      top:    make(topH),
      side:   make(hasWin ? (winH as number) : 0),
    }
  }, [claddingLinesTex, H, botH, topH, winH, hasWin])

  const cladFullRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, side: THREE.DoubleSide }))
  const cladBottomRef = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, side: THREE.DoubleSide }))
  const cladTopRef    = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, side: THREE.DoubleSide }))
  const cladSideRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, side: THREE.DoubleSide }))
  useFrame(() => {
    if (!showCladding) return
    const pairs: Array<[THREE.MeshStandardMaterial, THREE.Texture | null]> = [
      [cladFullRef.current,   cladTexs.full],
      [cladBottomRef.current, cladTexs.bottom],
      [cladTopRef.current,    cladTexs.top],
      [cladSideRef.current,   cladTexs.side],
    ]
    for (const [mat, tex] of pairs) {
      mat.color.lerp(animatedColor, 0.25)
      if (mat.map !== (tex ?? null)) {
        mat.map = tex ?? null
        mat.needsUpdate = true
      }
    }
  })

  if (!winW || !winH) {
    const frontFaceMatFull = showCladding ? cladFullRef.current : outerMatRef.current
    const fullWallMats = [
      outerMatRef.current, outerMatRef.current, outerMatRef.current,
      outerMatRef.current, frontFaceMatFull, innerMatRef.current,
    ]
    return (
      <mesh position={[0, H / 2, 0]} castShadow material={fullWallMats}>
        <boxGeometry args={[W, H, FRONT_T]} />
      </mesh>
    )
  }
  const sideW = (W - winW) / 2
  const winCY = yBot + winH / 2

  const o = outerMatRef.current
  const i = innerMatRef.current
  const r = revealMat
  const fB = showCladding ? cladBottomRef.current : outerMatRef.current
  const fT = showCladding ? cladTopRef.current    : outerMatRef.current
  const fS = showCladding ? cladSideRef.current   : outerMatRef.current
  const bottomMats = [o, o, i, o, fB, i]
  const topMats    = [o, o, o, i, fT, i]
  const leftMats   = [i, o, o, o, fS, i]
  const rightMats  = [o, i, o, o, fS, i]
  const penantMats = [i, i, o, o, fS, i]

  const penants: JSX.Element[] = []
  if (subWinWs && penantWs && penantWs.length) {
    let cx = -winW / 2
    for (let i = 0; i < subWinWs.length - 1; i++) {
      cx += subWinWs[i]
      const pw = penantWs[i]
      penants.push(
        <mesh key={`pen-${i}`} position={[cx + pw / 2, winCY, 0]} material={penantMats} castShadow>
          <boxGeometry args={[pw, winH, FRONT_T]} />
        </mesh>
      )
      cx += pw
    }
  }

  return (
    <group>
      <mesh position={[0, botH / 2, 0]} material={bottomMats} castShadow receiveShadow>
        <boxGeometry args={[W, botH, FRONT_T]} />
      </mesh>
      <mesh position={[0, yBot + winH + topH / 2, 0]} material={topMats} castShadow receiveShadow>
        <boxGeometry args={[W, topH, FRONT_T]} />
      </mesh>
      <mesh position={[-(winW / 2 + sideW / 2), winCY, 0]} material={leftMats} castShadow receiveShadow>
        <boxGeometry args={[sideW, winH, FRONT_T]} />
      </mesh>
      <mesh position={[+(winW / 2 + sideW / 2), winCY, 0]} material={rightMats} castShadow receiveShadow>
        <boxGeometry args={[sideW, winH, FRONT_T]} />
      </mesh>
      {penants}
    </group>
  )
}

function useAnimatedColor(targetHex: string, speed = 0.25) {
  const colorRef = useRef(new THREE.Color(targetHex))
  const targetRef = useRef(new THREE.Color(targetHex))

  useEffect(() => {
    targetRef.current.set(targetHex)
  }, [targetHex])

  useFrame(() => {
    colorRef.current.lerp(targetRef.current, speed)
  })

  return colorRef.current
}

export function WindowFrame({
  W, H, frameColor, sashColor, panelCount = 2, hideInnerSash = false, sashPattern, insectScreenEnabled = false, ventGrillEnabled = false,
}: { W: number; H: number; frameColor: string; sashColor: string; panelCount?: number; hideInnerSash?: boolean; sashPattern?: boolean[]; insectScreenEnabled?: boolean; ventGrillEnabled?: boolean }) {
  const animatedFrameColor = useAnimatedColor(frameColor, 0.25)
  const animatedSashColor = useAnimatedColor(sashColor, 0.25)

  const OUTER_T   = mm(90)
  const OUTER_D   = mm(80)
  const LIP_T     = mm(10)
  const LIP_D     = mm(14)
  const MULLION_W = mm(40)
  const TRANSOM_H = mm(30)
  const TRANSOM_RATIO = 0.35

  const innerW    = W - OUTER_T * 2
  const innerH    = H - OUTER_T * 2

  const totalMullionW = MULLION_W * (panelCount - 1)
  const paneW = (innerW - totalMullionW) / panelCount

  const panelCXs: number[] = []
  for (let i = 0; i < panelCount; i++) {
    panelCXs.push(-innerW / 2 + paneW / 2 + i * (paneW + MULLION_W))
  }

  const zFront    = FRONT_T / 2 + 0.001

  const frameOuterMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: frameColor }))
  const lipOuterMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: frameColor }))
  const sashOuterMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: sashColor }))
  const frameInnerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: '#FFFFFF' }))
  const lipInnerMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: '#FFFFFF' }))
  const sashInnerMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: '#FFFFFF' }))
  const fixedSashMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, envMapIntensity: 0.15, color: '#F5F0EB' }))

  useFrame(() => {
    frameOuterMatRef.current.color.lerp(animatedFrameColor, 0.12)
    lipOuterMatRef.current.color.lerp(animatedFrameColor, 0.12)
    sashOuterMatRef.current.color.lerp(animatedSashColor, 0.12)
  })

  const frameMats = [
    frameOuterMatRef.current,
    frameOuterMatRef.current,
    frameOuterMatRef.current,
    frameOuterMatRef.current,
    frameOuterMatRef.current,
    frameInnerMatRef.current,
  ]
  const lipMats = [
    lipOuterMatRef.current,
    lipOuterMatRef.current,
    lipOuterMatRef.current,
    lipOuterMatRef.current,
    lipOuterMatRef.current,
    lipInnerMatRef.current,
  ]
  const sashMats = [
    sashOuterMatRef.current,
    sashOuterMatRef.current,
    sashOuterMatRef.current,
    sashOuterMatRef.current,
    sashOuterMatRef.current,
    sashInnerMatRef.current,
  ]
  const fixedSashMat = fixedSashMatRef.current

  return (
    <group position={[0, H / 2, zFront]}>
      <mesh position={[0,  innerH / 2 + OUTER_T / 2, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[W, OUTER_T, OUTER_D]} />
      </mesh>
      <mesh position={[0, -innerH / 2 - OUTER_T / 2, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[W, OUTER_T, OUTER_D]} />
      </mesh>
      <mesh position={[-innerW / 2 - OUTER_T / 2, 0, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[OUTER_T, H, OUTER_D]} />
      </mesh>
      <mesh position={[ innerW / 2 + OUTER_T / 2, 0, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[OUTER_T, H, OUTER_D]} />
      </mesh>

      <mesh position={[0,  innerH / 2 - LIP_T / 2, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[innerW, LIP_T, OUTER_D + LIP_D]} />
      </mesh>
      <mesh position={[0, -innerH / 2 + LIP_T / 2, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[innerW, LIP_T, OUTER_D + LIP_D]} />
      </mesh>
      <mesh position={[-innerW / 2 + LIP_T / 2, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[LIP_T, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
      </mesh>
      <mesh position={[ innerW / 2 - LIP_T / 2, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[LIP_T, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
      </mesh>

      {Array.from({ length: panelCount - 1 }, (_, i) => {
        const mx = -innerW / 2 + paneW + MULLION_W / 2 + i * (paneW + MULLION_W)
        return (
          <mesh key={`mul-${i}`} position={[mx, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
            <boxGeometry args={[MULLION_W, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
          </mesh>
        )
      })}

      {panelCXs.map((cx, i) => {
        const openW  = paneW + LIP_T * 1.5
        const openH  = innerH + LIP_T * 1.5
        const SASH_T = mm(72)
        const SASH_D = mm(60)
        const sashZ  = LIP_D * 0.7
        const isFirst = i === 0
        const isLast = i === panelCount - 1
        const isEven = i % 2 === 0
        const showSash = sashPattern
          ? !!sashPattern[i]
          : (!hideInnerSash && (
              panelCount === 1 ||
              (panelCount === 2 && isFirst) ||
              (panelCount === 3 && (isFirst || isLast)) ||
              (panelCount === 4 && (isFirst || isLast)) ||
              (panelCount >= 5 && isEven)
            ))
        const glassW = showSash ? openW - SASH_T * 2 : openW
        const glassH = showSash ? openH - SASH_T * 2 : openH
        return (
          <group key={`panel-${i}`} position={[cx, 0, 0]}>
            {showSash && (
              <mesh position={[0, openH / 2 - SASH_T / 2, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[openW, SASH_T, SASH_D]} />
              </mesh>
            )}
            {showSash && (
              <mesh position={[0, -(openH / 2 - SASH_T / 2), sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[openW, SASH_T, SASH_D]} />
              </mesh>
            )}
            {showSash && (
              <mesh position={[-(openW / 2 - SASH_T / 2), 0, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[SASH_T, openH, SASH_D]} />
              </mesh>
            )}
            {showSash && (
              <mesh position={[openW / 2 - SASH_T / 2, 0, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[SASH_T, openH, SASH_D]} />
              </mesh>
            )}
            <mesh position={[0, 0, -mm(10)]}>
              <boxGeometry args={[glassW, glassH, GLASS_T]} />
              <meshPhysicalMaterial
                color={insectScreenEnabled && showSash ? "#1a1a1a" : "#bebebe"}
                transparent opacity={0.38}
                roughness={0.05} metalness={0.0}
                transmission={0.65} ior={1.5}
                thickness={0.005} reflectivity={0.55}
                envMapIntensity={1.2} side={THREE.DoubleSide}
              />
            </mesh>
            {ventGrillEnabled && !showSash && (
              <group position={[0, openH / 2 - mm(40), mm(15)]}>
                <mesh position={[0, 0, mm(20)]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow material={lipMats}>
                  <boxGeometry args={[openW - mm(20), mm(60), mm(30)]} />
                </mesh>
                <mesh castShadow receiveShadow material={lipMats}>
                  <boxGeometry args={[openW, mm(80), mm(25)]} />
                </mesh>
                {Array.from({ length: 4 }, (_, j) => (
                  <mesh key={`slat-${j}`} position={[0, mm(20) - j * mm(20), mm(15)]} castShadow>
                    <boxGeometry args={[openW - mm(10), mm(6), mm(3)]} />
                    <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}

export function ClosedPanel({ W, H, frameColor, panelColor }: { W: number; H: number; frameColor: string; panelColor: string }) {
  const animatedPanelColor = useAnimatedColor(panelColor, 0.25)

  const panelMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, color: panelColor }))
  useFrame(() => {
    panelMatRef.current.color.lerp(animatedPanelColor, 0.25)
  })

  // No frame border, no recessed infill — a single flat panel that fills the
  // whole opening flush with the wall's own front face, so it reads as one
  // continuous flat surface rather than a distinct framed insert.
  return (
    <group position={[0, H / 2, 0]}>
      <mesh position={[0, 0, 0]} material={panelMatRef.current}>
        <boxGeometry args={[W, H, FRONT_T]} />
      </mesh>
    </group>
  )
}

export function FlatRoof({ W, H, depth, color, isKader = false }: { W: number; H: number; depth: number; color: string; isKader?: boolean }) {
  const targetColorRef = useRef(new THREE.Color(color))
  const frontMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, envMapIntensity: 0.15, color }))
  const topSideMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, color: '#F7F9EF' }))
  const innerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, envMapIntensity: 0.15, color: '#FFFFFF' }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { frontMatRef.current.color.lerp(targetColorRef.current, 0.25) })

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const soffitMat = useMemo(() => {
    const { u, v } = woodRepeatFromSize(W, depth)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm, THREE.FrontSide)
  }, [woodCol, woodRgh, woodNrm, W, depth])

  const totalW   = isKader ? W + SIDE_W * 2 + mm(295) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
  const slabLen  = depth + ROOF_OVERHANG
  const slabCtrZ = (ROOF_OVERHANG - depth) / 2

  return (
    <group position={[0, H, 0]}>
      <mesh position={[0, ROOF_SLAB_T / 2, slabCtrZ]} castShadow material={[
        frontMatRef.current,
        frontMatRef.current,
        topSideMatRef.current,
        innerMatRef.current,
        frontMatRef.current,
        topSideMatRef.current,
      ]}>
        <boxGeometry args={[totalW, ROOF_SLAB_T, slabLen]} />
      </mesh>
      <mesh position={[0, -mm(2), -depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, depth]} />
        <primitive object={soffitMat} />
      </mesh>

      {(() => {
        const beamW  = mm(28)
        const beamH  = mm(55)
        const beamD  = depth
        const count  = Math.max(2, Math.round(W / mm(260)))
        const step   = W / (count + 1)
        return Array.from({ length: count }, (_, i) => {
          const x = -W / 2 + step * (i + 1)
          return (
            <mesh key={`beam-${i}`} position={[x, -mm(2) - beamH / 2, -depth / 2]}>
              <boxGeometry args={[beamW, beamH, beamD]} />
              <primitive object={soffitMat} />
            </mesh>
          )
        })
      })()}
    </group>
  )
}

function Soffit({ W, depth, color }: { W: number; depth: number; color: string }) {
  return (
    <mesh position={[0, -SOFFIT_T / 2, -depth / 2]} castShadow>
      <boxGeometry args={[W + SIDE_W * 2, SOFFIT_T, depth]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

function createShutterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, 512, 512)

  const slatCount = 4
  const gap = 4
  const slatHeight = (512 - (gap * slatCount)) / slatCount

  for (let i = 0; i < slatCount; i++) {
    const y = i * (slatHeight + gap)

    const gradient = ctx.createLinearGradient(0, y, 0, y + slatHeight)
    gradient.addColorStop(0, '#6a6a6a')
    gradient.addColorStop(0.2, '#4a4a4a')
    gradient.addColorStop(0.5, '#3a3a3a')
    gradient.addColorStop(0.8, '#2a2a2a')
    gradient.addColorStop(1, '#0a0a0a')

    ctx.fillStyle = gradient
    ctx.fillRect(0, y, 512, slatHeight)

    ctx.strokeStyle = '#8a8a8a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()

    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, y + slatHeight)
    ctx.lineTo(512, y + slatHeight)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.5, 2.5)
  return texture
}

function RollerShutter({ W, winH, roofH, color, guideColor, openPercent }: { W: number; winH: number; roofH: number; color: string; guideColor: string; openPercent: number }) {
  const animatedColor = useAnimatedColor(color, 0.08)
  const guideBase = useMemo(() => new THREE.Color(guideColor).multiplyScalar(0.72), [guideColor])
  const animatedGuideColor = useAnimatedColor(`#${guideBase.getHexString()}`, 0.08)
  const texture = useMemo(() => createShutterTexture(), [])
  const matRef = useRef(new THREE.MeshStandardMaterial({
    roughness: 0.4,
    metalness: 0.1,
    map: texture,
    bumpMap: texture,
    bumpScale: 0.02
  }))
  const guideMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15, color: guideColor }))
  const [scale, setScale] = useState(openPercent / 100)
  const [targetOpen, setTargetOpen] = useState(openPercent)
  const [isClosed, setIsClosed] = useState(openPercent >= 90)

  useEffect(() => {
  }, [W])

  useEffect(() => {
    setTargetOpen(openPercent)
    setIsClosed(openPercent >= 90)
  }, [openPercent])

  useFrame((_, delta) => {
    matRef.current.color.lerp(animatedColor, 0.1)
    guideMatRef.current.color.lerp(animatedGuideColor, 0.1)
    const targetScale = targetOpen / 100
    setScale(prev => prev + (targetScale - prev) * Math.min(delta * 8, 1))

    if (matRef.current.map) {
      const repeatY = Math.max(scale * 10, 3)
      matRef.current.map.repeat.set(1, repeatY)
    }
  })

  const zPos = FRONT_T / 2 + mm(60)

  const shutterH = winH * scale
  const curtainY = winH - shutterH / 2

  const GUIDE_W = mm(45)
  const guideX = (W + mm(10)) / 2 + GUIDE_W / 2

  const TOP_FRAME_H = mm(20)
  const HOUSING_D   = mm(60)
  const HOUSING_H = Math.max(roofH - winH - TOP_FRAME_H, mm(60))

  return (
    <group>
      <mesh position={[0, winH + TOP_FRAME_H / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[W + mm(10) + GUIDE_W * 2, TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      <mesh position={[0, winH + HOUSING_H / 2 + TOP_FRAME_H, zPos]} castShadow receiveShadow>
        <boxGeometry args={[W + mm(10) + GUIDE_W * 2, HOUSING_H, HOUSING_D]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      <mesh
        position={[0, curtainY, zPos]}
        castShadow
        receiveShadow
        visible={scale > 0.005}
        onClick={() => {
          if (isClosed) {
            setTargetOpen(33)
            setIsClosed(false)
          } else {
            setTargetOpen(100)
            setIsClosed(true)
          }
        }}
      >
        <boxGeometry args={[W + mm(10), Math.max(shutterH, 0.001), mm(25)]} />
        <primitive object={matRef.current} />
      </mesh>

      <mesh position={[-guideX, (winH + TOP_FRAME_H) / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[GUIDE_W, winH + TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      <mesh position={[guideX, (winH + TOP_FRAME_H) / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[GUIDE_W, winH + TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>
    </group>
  )
}

function AnimatedBox({ position, size, color, roughness = 0.4, metalness = 0.05 }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
}) {
  const targetColorRef = useRef(new THREE.Color(color))
  const matRef = useRef(new THREE.MeshStandardMaterial({ roughness, metalness, color }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { matRef.current.color.lerp(targetColorRef.current, 0.25) })

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <primitive object={matRef.current} />
    </mesh>
  )
}

function FasciaBoard({ W, H, depth, color, isKader = false }: {
  W: number; H: number; depth: number; color: string; isKader?: boolean
}) {
  const targetColorRef = useRef(new THREE.Color(color))
  const frontMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, color }))
  const greyMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, color: '#F7F9EF' }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { frontMatRef.current.color.lerp(targetColorRef.current, 0.25) })

  const width = isKader ? W + SIDE_W * 2 + mm(300) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
  const length = depth + ROOF_OVERHANG

  return (
    <mesh
      position={[0, H + ROOF_SLAB_T + mm(20), (ROOF_OVERHANG - depth) / 2]}
      castShadow
      material={[
        frontMatRef.current,
        frontMatRef.current,
        greyMatRef.current,
        greyMatRef.current,
        frontMatRef.current,
        greyMatRef.current,
      ]}
    >
      <boxGeometry args={[width, mm(40), length]} />
    </mesh>
  )
}

export function SideCheek({
  H, depth, color, side, claddingMaterial, isKader = false,
}: { H: number; depth: number; color: string; side: 'left' | 'right'; claddingMaterial?: 'rondkantpanelen' | 'hpl'; isKader?: boolean }) {
  const animatedColor = useAnimatedColor(color, 0.25)
  const geom = useMemo(() => makeCheekGeom(H, depth), [H, depth])
  const flipX = side === 'left' ? -1 : 1

  const linesTex = useMemo(() => {
    if (isKader || claddingMaterial !== 'rondkantpanelen') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      for (let y = 0; y <= 256; y += 64) {
        ctx.strokeStyle = 'rgba(20,20,20,0.75)'
        ctx.lineWidth = 6
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, claddingRepeatV(H))
    return tex
  }, [claddingMaterial, isKader, H])

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const innerWoodMat = useMemo(() => {
    const slopeLen = Math.hypot(H, depth)
    const { u, v } = woodRepeatFromSize(SIDE_W, slopeLen)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm)
  }, [woodCol, woodRgh, woodNrm, H, depth])

  const bodyMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, side: THREE.DoubleSide }))
  const outerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, side: THREE.DoubleSide }))

  useFrame(() => {
    const next = linesTex ?? null
    bodyMatRef.current.color.lerp(animatedColor, 0.25)
    if (bodyMatRef.current.map !== next) { bodyMatRef.current.map = next; bodyMatRef.current.needsUpdate = true }
    outerMatRef.current.color.lerp(animatedColor, 0.25)
    if (outerMatRef.current.map !== next) { outerMatRef.current.map = next; outerMatRef.current.needsUpdate = true }
  })

  const mats = [bodyMatRef.current, innerWoodMat, outerMatRef.current]

  return (
    <group scale={[flipX, 1, 1]}>
      <mesh geometry={geom} material={mats} castShadow />
    </group>
  )
}

export function RoofSurface({ W, H, depth, pitchDeg, sideExt, isKader, roofTileColor }: { W: number; H: number; depth: number; pitchDeg: number; sideExt?: number; isKader?: boolean; roofTileColor?: string }) {
  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  const FORWARD     = isKader ? mm(900) : mm(700)
  const BACK        = depth + mm(300)
  const holeHW      = isKader ? (W + SIDE_W * 2 + mm(280)) / 2 : (W + SIDE_W * 2) / 2
  const _sideExt    = sideExt ?? holeHW
  const ROOF_W      = holeHW * 2 + _sideExt * 2
  const hw          = ROOF_W / 2
  const HOLE_Z_FRONT = ROOF_OVERHANG
  const HOLE_Z_BACK  = -depth

  const clipPlanes = useMemo(() => [
    new THREE.Plane(new THREE.Vector3(1,  0,  0),  hw),
    new THREE.Plane(new THREE.Vector3(-1, 0,  0),  hw),
    new THREE.Plane(new THREE.Vector3(0,  0, -1),  FORWARD),
    new THREE.Plane(new THREE.Vector3(0,  0,  1),  BACK),
  ], [hw, FORWARD, BACK])

  const tileCol = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Color.png')
  const tileRgh = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Roughness.jpg.jpeg')
  const tileNrm = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_NormalGL.jpg (1).jpeg')
  const tileAO  = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_AmbientOcclusion.jpg.jpeg')
  const tileDsp = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Displacement.jpg.jpeg')

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const uRepeat = (hw * 2) / mm(1200)
  const vRepeat = (FORWARD + BACK) / mm(1200)

  const tileMat = useMemo(() => {
    const repeat = (t: THREE.Texture, uRep: number, vRep: number) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(uRep, vRep)
      t.needsUpdate = true
      return t
    }
    const isRed = roofTileColor === '#EC8A4A'
    const mat = new THREE.MeshStandardMaterial({
      map:              repeat(tileCol.clone(), uRepeat, vRepeat),
      roughnessMap:     repeat(tileRgh.clone(), uRepeat, vRepeat),
      normalMap:        repeat(tileNrm.clone(), uRepeat, vRepeat),
      normalScale:      new THREE.Vector2(2, 2),
      aoMap:            repeat(tileAO.clone(), uRepeat, vRepeat),
      roughness:    0.7,
      metalness:    0.4,
      side:         THREE.FrontSide,
      color: new THREE.Color(roofTileColor || '#ffffff'),
    })
    if (isRed) {
      mat.emissive = new THREE.Color('#D06A2E')
      mat.emissiveIntensity = 0.46
    }
    return mat
  }, [tileCol, tileRgh, tileNrm, tileAO, uRepeat, vRepeat, roofTileColor])

  const tileMatDouble = useMemo(() => {
    const m = tileMat.clone()
    m.side = THREE.DoubleSide
    return m
  }, [tileMat])

  const fullPlane = useMemo(() => {
    const tan = Math.tan(pitchRad)
    const DROP = mm(-5)
    const segs = 128
    const xStep = (hw * 2) / segs
    const zStep = (FORWARD + BACK) / segs

    const holeXMin = -holeHW
    const holeXMax = holeHW
    const holeZMin = HOLE_Z_BACK
    const holeZMax = 0

    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    for (let row = 0; row <= segs; row++) {
      for (let col = 0; col <= segs; col++) {
        const x = -hw + col * xStep
        const z = FORWARD - row * zStep
        const y = -z * tan - DROP
        positions.push(x, y, z)
        const u = col / segs
        const v = row / segs
        uvs.push(u, v)
      }
    }

    for (let row = 0; row < segs; row++) {
      for (let col = 0; col < segs; col++) {
        const x = -hw + col * xStep
        const z = FORWARD - row * zStep
        const nextX = x + xStep
        const nextZ = z - zStep

        const cellInHole = x >= holeXMin && nextX <= holeXMax && nextZ >= holeZMin && z <= holeZMax
        if (cellInHole) continue

        const a = row * (segs + 1) + col
        const b = a + 1
        const c = a + (segs + 1)
        const d = c + 1
        indices.push(a, b, c, b, d, c)
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    g.setAttribute('uv2', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }, [pitchRad, hw, FORWARD, BACK, holeHW, HOLE_Z_BACK])

  const backPanels = useMemo(() => {
    const tan = Math.tan(pitchRad)
    const lift = mm(40)
    const thick = mm(50)

    const holeXMin = -holeHW
    const holeXMax = holeHW
    const holeZFront = 0
    const holeZBack = HOLE_Z_BACK

    const getY = (z: number) => -z * tan - lift

    const getLength = (z1: number, z2: number) => Math.abs(z2 - z1) / Math.cos(pitchRad)

    const getCenterZ = (z1: number, z2: number) => (z1 + z2) / 2

    const getCenterY = (z1: number, z2: number) => (getY(z1) + getY(z2)) / 2

    const panels = [
      {
        pos: [-(holeHW + (hw - holeHW) / 2), getCenterY(FORWARD, -BACK), (FORWARD - BACK) / 2] as [number, number, number],
        size: [(hw - holeHW), thick, getLength(FORWARD, -BACK)] as [number, number, number],
      },
      {
        pos: [(holeHW + (hw - holeHW) / 2), getCenterY(FORWARD, -BACK), (FORWARD - BACK) / 2] as [number, number, number],
        size: [(hw - holeHW), thick, getLength(FORWARD, -BACK)] as [number, number, number],
      },
      ...(FORWARD > holeZFront + mm(50) ? [{
        pos: [0, getCenterY(holeZFront, FORWARD), getCenterZ(holeZFront, FORWARD)] as [number, number, number],
        size: [holeHW * 2, thick, getLength(holeZFront, FORWARD)] as [number, number, number],
      }] : []),
      {
        pos: [0, getCenterY(-BACK, holeZBack), getCenterZ(-BACK, holeZBack)] as [number, number, number],
        size: [holeHW * 2, thick, getLength(-BACK, holeZBack)] as [number, number, number],
      },
    ]

    return panels.map((panel) => {
      const { u, v } = woodRepeatFromSize(panel.size[0], panel.size[2])
      return { ...panel, repeatU: u, repeatV: v }
    })
  }, [pitchRad, hw, holeHW, FORWARD, BACK, HOLE_Z_BACK])

  const backPanelMaterials = useMemo(
    () => backPanels.map((panel) =>
      createWoodMaterial(panel.repeatU, panel.repeatV, woodCol, woodRgh, woodNrm)
    ),
    [backPanels, woodCol, woodRgh, woodNrm],
  )

  return (
    <group>
      <mesh geometry={fullPlane} material={tileMat} castShadow receiveShadow />

      {backPanels.map((panel, i) => (
        <mesh
          key={i}
          position={panel.pos}
          rotation={[pitchRad, 0, 0]}
          material={backPanelMaterials[i]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={panel.size} />
        </mesh>
      ))}

      {!isKader && (() => {
        const slabTopY = H + ROOF_SLAB_T
        const slabHalfLen = (depth + ROOF_OVERHANG) / 2
        const slabCtrZ = (ROOF_OVERHANG - depth) / 2
        const overhangFrontZ = slabCtrZ + slabHalfLen
        const totalHalfW = isKader ? (W + SIDE_W * 2 + mm(280)) / 2 : (W + (SIDE_W + ROOF_SIDE_OVH) * 2) / 2
        const pipeX = -totalHalfW + mm(40)
        const overhangBackZ = slabCtrZ - slabHalfLen
        const pipeZ = overhangBackZ + mm(500)
        const pipeHeight = mm(250)
        const pipeRadius = mm(35)
        const extraDown = mm(50)

        return (
          <mesh position={[pipeX, slabTopY - pipeHeight / 2 - extraDown, pipeZ]} castShadow receiveShadow>
            <cylinderGeometry args={[pipeRadius, pipeRadius, pipeHeight, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} envMapIntensity={1.0} />
          </mesh>
        )
      })()}
    </group>
  )
}

export function PipePanel({ pitchRad, W, clipHW, isKader = false }: { pitchRad: number; W: number; clipHW: number; isKader?: boolean }) {
  const { scene } = useGLTF('/models/pipepanel.glb')
  const cloned = useMemo(() => scene.clone(), [scene])
  const FORWARD = isKader ? mm(1050) : mm(850)
  const ATTACH_Z = isKader ? mm(900) : mm(700)
  const totalW  = isKader ? W + SIDE_W * 2 + mm(300) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
  const planeBottomY = -ATTACH_Z * Math.tan(pitchRad)

  const clipPlanes = useMemo(() => [
    new THREE.Plane(new THREE.Vector3( 1, 0, 0),  clipHW),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0),  clipHW),
  ], [clipHW])

  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: THREE.Material) => { m.clippingPlanes = clipPlanes })
      }
    })
  }, [cloned, clipPlanes])

  return (
    <primitive
      object={cloned}
      position={[0, planeBottomY, FORWARD]}
      rotation={[-Math.PI / 30, Math.PI / 2, 0]}
      scale={[-0.13, 0.13, totalW /6.9]}
    />
  )
}
useGLTF.preload('/models/pipepanel.glb')

function SlopeBackPanel({ W, depth, pitchRad, sideExt }: { W: number; depth: number; pitchRad: number; sideExt?: number }) {
  const FORWARD      = mm(700)
  const BACK         = depth + mm(300)
  const holeHW       = (W + SIDE_W * 2) / 2
  const _sideExt     = sideExt ?? holeHW
  const hw           = holeHW + _sideExt
  const HOLE_Z_FRONT = ROOF_OVERHANG
  const HOLE_Z_BACK  = -depth

  const sections = useMemo(() => {
    const tan  = Math.tan(pitchRad)
    const lift = mm(35)
    const y    = (z: number) => -z * tan - lift

    const makeQuad = (x1: number, x2: number, z1: number, z2: number) => {
      const verts = new Float32Array([
        x1, y(z1), z1,  x2, y(z1), z1,  x1, y(z2), z2,
        x2, y(z1), z1,  x2, y(z2), z2,  x1, y(z2), z2,
      ])
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      g.computeVertexNormals()
      return g
    }

    return [
      makeQuad(-hw,     -holeHW,    FORWARD,     -BACK),
      makeQuad(+holeHW, +hw,        FORWARD,     -BACK),
      makeQuad(-holeHW, +holeHW,    FORWARD,     HOLE_Z_FRONT),
      makeQuad(-holeHW, +holeHW,    HOLE_Z_BACK, -BACK),
    ]
  }, [hw, holeHW, depth, pitchRad, FORWARD, BACK, HOLE_Z_FRONT, HOLE_Z_BACK])

  return (
    <group>
      {sections.map((geom, i) => (
        <mesh key={i} geometry={geom}>
          <meshStandardMaterial color="#696969" roughness={0.6} metalness={0.01} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

export function ProceduralDormer({ config }: { config: WindowConfig }) {
  const {
    windowWidth,
    windowHeight,
    lintelLevel,
    windowCopies,
    pitchDeg,
    frontColor,
    sideColor,
    fasciaColor,
    frameColor,
    sashColor,
    shutterEnabled,
    shutterOpen,
    insectScreenEnabled,
    styleType,
    claddingMaterial,
    kozijnTypes,
    kozijnSashTypes,
    kozijnPaneSashTypes,
  } = config

  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  const panelCount  = Math.max(1, windowCopies ?? 1)

  const rawWidths   = config.windowWidths?.length === panelCount
    ? config.windowWidths
    : Array.from({ length: panelCount }, () => windowWidth)
  const rawSpacings = config.spacings ?? [200, 200, 200, 200]

  const W_single    = mm(windowWidth)
  const subWinWs    = rawWidths.map(w => mm(w) - mm(40))
  const penantWs    = Array.from({ length: panelCount - 1 }, (_, i) => mm(rawSpacings[i] ?? 200))

  const winW  = subWinWs.reduce((s, w) => s + w, 0) + penantWs.reduce((s, p) => s + p, 0)
  const W     = rawWidths.reduce((s, w) => s + mm(w), 0) + penantWs.reduce((s, p) => s + p, 0)

  const panelXs: number[] = []
  let cursor = -winW / 2
  for (let i = 0; i < panelCount; i++) {
    panelXs.push(cursor + subWinWs[i] / 2)
    cursor += subWinWs[i] + (penantWs[i] ?? 0)
  }

  const H         = mm(windowHeight)
  const cheekH    = H + ROOF_SLAB_T + mm(10)
  const depth     = cheekH / Math.tan(pitchRad)

  const winYBottom  = mm(40) + mm(lintelLevel)
  const winH        = H - winYBottom - mm(40)

  const halfW = W / 2

  const roofTileTint = config.roofTileColor === 'antraciet' ? '#ffffff' : '#EC8A4A'

  return (
    <group position={[0, -H / 2, 0]}>
      <RoofSurface W={W} H={H} depth={depth} pitchDeg={pitchDeg} sideExt={(W_single + SIDE_W * 2) / 2} isKader={styleType === 'kader'} roofTileColor={roofTileTint} />

      <PipePanel pitchRad={pitchRad} W={W} clipHW={styleType === 'kader' ? (W + SIDE_W * 2 + mm(280)) / 2 + (W_single + SIDE_W * 2) / 2 : (W + SIDE_W * 2) / 2 + (W_single + SIDE_W * 2) / 2} isKader={styleType === 'kader'} />

      <FrontWall
        W={styleType === 'kader' ? W + SIDE_W * 2 + mm(280) : W + SIDE_W * 2 - mm(4)} H={H} color={frontColor}
        winW={winW} winH={winH} winYBottom={winYBottom}
        subWinWs={subWinWs} penantWs={penantWs}
        styleType={styleType}
        claddingMaterial={claddingMaterial}
      />

      <group position={[0, winYBottom, 0]}>
        {panelXs.map((xOff, i) => {
          const manualPanelCount = config.kozijnPanelCounts?.[i]
          const copyPanelCount = manualPanelCount ?? 1
          const wWidth = subWinWs[i]
          const isGesloten = kozijnTypes?.[i] === 'gesloten'
          return (
            <group key={i} position={[xOff, 0, 0]}>
              {isGesloten ? (
                <ClosedPanel
                  W={wWidth}
                  H={winH}
                  frameColor={frameColor}
                  panelColor={config.frontColor || frameColor}
                />
              ) : (
                <>
                  <WindowFrame
                    W={wWidth}
                    H={winH}
                    frameColor={frameColor}
                    sashColor={sashColor}
                    panelCount={copyPanelCount}
                    hideInnerSash={kozijnSashTypes?.[i] === 'vast'}
                    sashPattern={
                      copyPanelCount > 1
                        ? Array.from({ length: copyPanelCount }, (_, paneIdx) =>
                            (kozijnPaneSashTypes?.[i]?.[paneIdx] ?? (paneIdx === 0 ? 'draaikiep' : 'vast')) === 'draaikiep'
                          )
                        : undefined
                    }
                    insectScreenEnabled={insectScreenEnabled}
                    ventGrillEnabled={config.ventGrillEnabled}
                  />
                  {shutterEnabled && (
                    <RollerShutter
                      W={wWidth}
                      winH={winH}
                      roofH={H - winYBottom}
                      color={config.shutterColor || frameColor}
                      guideColor={frameColor}
                      openPercent={shutterOpen}
                    />
                  )}
                </>
              )}
            </group>
          )
        })}
      </group>

      <FlatRoof W={W} H={H} depth={depth} color={fasciaColor} isKader={styleType === 'kader'} />

      <FasciaBoard
        W={W}
        H={H}
        depth={depth}
        color={fasciaColor}
        isKader={styleType === 'kader'}
      />

      {(() => {
        const isKaderStyle = styleType === 'kader'
        const totalW = isKaderStyle ? W + SIDE_W * 2 + mm(295) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
        const slabLen = depth + ROOF_OVERHANG
        const slabCtrZ = (ROOF_OVERHANG - depth) / 2
        const slabTopY = H + ROOF_SLAB_T + mm(40) + mm(1)
        return (
          <mesh position={[0, slabTopY, slabCtrZ]} castShadow receiveShadow>
            <boxGeometry args={[totalW - mm(150), mm(20), slabLen - mm(150)]} />
            <meshStandardMaterial color="#3f3f3f" roughness={0.9} metalness={0.0} />
          </mesh>
        )
      })()}

      <group position={[halfW + (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="right" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} />
        {styleType === 'kader' && (
          <AnimatedBox
            position={[SIDE_W / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[SIDE_W + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
        {styleType === 'kader' && (
          <AnimatedBox
            position={[SIDE_W / 2, H + (ROOF_SLAB_T + mm(40)) / 2, (ROOF_OVERHANG - depth) / 2 + mm(10)]}
            size={[SIDE_W + mm(6), ROOF_SLAB_T + mm(40), depth + ROOF_OVERHANG - mm(2)]}
            color={fasciaColor}
            roughness={0.3} metalness={0.08}
          />
        )}
      </group>

      <group position={[-halfW - (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="left" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} />
        {styleType === 'kader' && (
          <AnimatedBox
            position={[-SIDE_W / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[SIDE_W + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
        {styleType === 'kader' && (
          <AnimatedBox
            position={[-SIDE_W / 2, H + (ROOF_SLAB_T + mm(40)) / 2, (ROOF_OVERHANG - depth) / 2 + mm(10)]}
            size={[SIDE_W + mm(6), ROOF_SLAB_T + mm(40), depth + ROOF_OVERHANG - mm(2)]}
            color={fasciaColor}
            roughness={0.3} metalness={0.08}
          />
        )}
      </group>
    </group>
  )
}