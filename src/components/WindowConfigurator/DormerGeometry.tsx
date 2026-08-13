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

// Used ONLY for the narrow Composiet strips (window reveal left/right,
// penanten, side cheeks) — front/bottom/top/ClosedPanel keep using
// CLAD_TILE_MM exactly as before (untouched, since that's already correct).
// Narrow strips are often narrower than one full CLAD_TILE_MM board
// division, so no line could ever fit inside them — this smaller reference
// guarantees several visible lines on even the narrowest strip.
const COMPOSIET_TILE_MM_NARROW = 80

// Used specifically for FrontWall's own window-reveal left/right strip —
// the full COMPOSIET_TILE_MM_NARROW made this strip's lines too densely
// packed right where it meets the (also narrow-tiled) SideCheek, creating
// a busy/mismatched cluster at that corner. A larger, in-between tile
// keeps some visible lines there without being as dense.
const COMPOSIET_TILE_MM_MEDIUM = 850

/** Fine-tune knob: shifts the FrontWall strip lines up/down (in mm) relative
 *  to their calculated world-space position, to nudge them into exact
 *  alignment with the SideCheek lines if they're still slightly off.
 *  Positive = lines shift up, negative = lines shift down. */
const CLAD_PHASE_ADJUST_MM = 0

function claddingRepeatV(heightM: number) {
  return Math.max(heightM / mm(CLAD_TILE_MM), 0.25)
}

// Composiet cladding runs VERTICALLY (narrow vertical boards) instead of the
// horizontal Rabatprofiel lines — this is the width-based equivalent of
// claddingRepeatV, used to tile vertical-line textures across a strip's width.
function claddingRepeatU(widthM: number, tileMM: number = CLAD_TILE_MM) {
  return Math.max(widthM / mm(tileMM), 0.25)
}

// Default side wall (wang) width — used as a fallback wherever a component
// isn't explicitly given a sideW prop. The actual value now comes from
// config.wangWidth (both wangen share this one value), threaded through as
// a "sideW" prop to every component below that used to reference this
// constant directly.
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
// Caps how far the roof tile plane extends sideways beyond each dormer's
// own footprint. Previously this scaled with window width with no upper
// bound, which meant two adjacent dormers (placed with a ~1000mm gap in
// Scene.tsx for multi-dormer rendering) could have their roof tile planes
// overlap and z-fight/flicker for wide windows. Capping it at 450mm keeps
// each side safely under half the gap (450+450=900mm < 1000mm), while
// staying visually the same for narrower dormers where the uncapped value
// was already below this limit.
// Caps how far the roof tile plane extends sideways beyond each dormer's
// own footprint. This MUST equal exactly half of Scene.tsx's DORMER_GAP_MM
// (currently 1000mm) — 500+500=1000mm means two adjacent dormers' roof
// planes meet EXACTLY at the midpoint between them: no overlap (which
// z-fights/flickers) and no gap (which showed as a dark wedge/notch cut
// into the roof where nothing was drawn). The earlier 450mm value was too
// small (450+450=900mm < 1000mm gap), leaving a 100mm strip uncovered.
const MAX_ROOF_SIDE_EXT = mm(500)
const ROOF_SLAB_T   = mm(220)
const ROOF_FSC_H    = mm(160)
const ROOF_FSC_T    = mm(40)

export function makeCheekGeom(H: number, D: number, sideW: number = SIDE_W): THREE.BufferGeometry {
  const positions = new Float32Array([
    0,      0, 0,   sideW, 0, 0,   0,      H, 0,
    sideW, 0, 0,   sideW, H, 0,   0,      H, 0,
    0,      H,  0,   sideW, H,  0,   0,      H, -D,
    sideW, H,  0,   sideW, H, -D,   0,      H, -D,
    0,      0, 0,   0,      H, -D,   sideW, 0,  0,
    sideW, 0, 0,   0,      H, -D,   sideW, H, -D,
    0, 0,  0,   0, H,  0,   0, H, -D,
    sideW, 0,  0,   sideW, H, -D,   sideW, H, 0,
  ])
  const sw = sideW
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
  claddingMaterial?: 'rondkantpanelen' | 'hpl' | 'composiet';
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
  // Rabatprofiel = horizontal lines (unchanged from before). Composiet =
  // narrow VERTICAL boards — same visual technique, transposed axis.
  const showHorizontal = isTraditional && claddingMaterial === 'rondkantpanelen'
  const showVertical    = isTraditional && claddingMaterial === 'composiet'
  const showCladding = showHorizontal || showVertical

  const hasWin = !!(winW && winH)
  const yBot   = hasWin ? (winYBottom ?? (H - (winH as number)) / 2) : 0
  const botH   = hasWin ? yBot : H
  const topH   = hasWin ? H - yBot - (winH as number) : 0

  // Shared canvas generator for both orientations — draws either horizontal
  // rows (Rabatprofiel) or vertical columns (Composiet) of dark lines on a
  // light base, at the same 64px spacing either way.
  const claddingLinesTex = useMemo(() => {
    if (!showCladding) return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      ctx.strokeStyle = 'rgba(20,20,20,0.75)'
      ctx.lineWidth = 6
      if (showVertical) {
        for (let x = 0; x <= 256; x += 64) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke()
        }
      } else {
        for (let y = 0; y <= 256; y += 64) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    // Anisotropic filtering — without this, narrow strips (which compress
    // the same texture into less on-screen width/height) mipmap down and
    // blur, while wider strips stay crisp. Raising anisotropy keeps the
    // lines equally sharp everywhere.
    tex.anisotropy = 16
    tex.generateMipmaps = false
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [showCladding, showVertical])

  const cladTexs = useMemo(() => {
    // HORIZONTAL (Rabatprofiel): each strip's texture is offset in Y based
    // on its real world bottom-Y, so lines stay in phase with the
    // SideCheek's continuous surface (which starts at Y=0) regardless of
    // which strip they're on.
    const makeHorizontal = (h: number, yBottom: number = 0) => {
      if (!claddingLinesTex || h <= 0) return null
      const t = claddingLinesTex.clone()
      t.repeat.set(1, claddingRepeatV(h))
      const rawOffset = (yBottom + mm(CLAD_PHASE_ADJUST_MM)) / mm(CLAD_TILE_MM)
      t.offset.y = ((rawOffset % 1) + 1) % 1
      t.needsUpdate = true
      return t
    }
    // VERTICAL (Composiet): same idea, but phase-aligned by each strip's
    // real world LEFT-edge X instead of its bottom-Y, since the boards run
    // vertically — this keeps the vertical board seams lining up across
    // strip boundaries (bottom/top/left/right/penanten) instead of each
    // strip restarting its own pattern at x=0.
    const makeVertical = (w: number, xLeft: number = 0, tileMM: number = CLAD_TILE_MM) => {
      if (!claddingLinesTex || w <= 0) return null
      const t = claddingLinesTex.clone()
      t.repeat.set(claddingRepeatU(w, tileMM), 1)
      const rawOffset = xLeft / mm(tileMM)
      t.offset.x = ((rawOffset % 1) + 1) % 1
      t.needsUpdate = true
      return t
    }

    if (showVertical) {
      const halfW = W / 2
      const sideWLocal = hasWin ? (W - (winW as number)) / 2 : 0
      return {
        full:   makeVertical(W, -halfW),
        bottom: makeVertical(W, -halfW),
        top:    makeVertical(W, -halfW),
        left:   makeVertical(sideWLocal, -((winW ?? 0) / 2 + sideWLocal), COMPOSIET_TILE_MM_MEDIUM),
        right:  makeVertical(sideWLocal, (winW ?? 0) / 2, COMPOSIET_TILE_MM_MEDIUM),
      }
    }
    return {
      full:   makeHorizontal(H, 0),
      bottom: makeHorizontal(botH, 0),
      top:    makeHorizontal(topH, yBot + (winH ?? 0)),
      side:   makeHorizontal(hasWin ? (winH as number) : 0, yBot),
    }
  }, [claddingLinesTex, showVertical, W, H, botH, topH, winH, winW, hasWin, yBot])

  const cladFullRef   = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  const cladBottomRef = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  const cladTopRef    = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  // For horizontal cladding, left/right/penant strips all share ONE texture
  // (fine, since lines only need Y-phase-matching and those strips share a
  // Y range). For vertical cladding, left and right sit at DIFFERENT X
  // positions and need their own offset — so they get separate refs now.
  const cladSideRef   = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  const cladLeftRef   = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  const cladRightRef  = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  // Penant strips (dynamic count, 0–3) — one material per penant so each
  // can carry its own X-phase-matched vertical texture. Reused across
  // renders by index so color animation stays smooth.
  const cladPenantRefs = useRef<THREE.MeshPhysicalMaterial[]>([])
  const getPenantMat = (i: number) => {
    while (cladPenantRefs.current.length <= i) {
      cladPenantRefs.current.push(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
    }
    return cladPenantRefs.current[i]
  }

  // Per-penant vertical textures (only relevant when showVertical) — each
  // penant strip gets its own X-phase-matched texture, computed the same
  // way as the other vertical strips above.
  const penantVerticalTexs = useMemo(() => {
    if (!showVertical || !claddingLinesTex || !subWinWs || !penantWs || !penantWs.length) return []
    const winWLocal = winW ?? 0
    const texs: (THREE.Texture | null)[] = []
    let cx = -winWLocal / 2
    for (let idx = 0; idx < subWinWs.length - 1; idx++) {
      cx += subWinWs[idx]
      const pw = penantWs[idx]
      if (pw > 0) {
        const t = claddingLinesTex.clone()
        t.repeat.set(claddingRepeatU(pw), 1)
        const rawOffset = cx / mm(CLAD_TILE_MM)
        t.offset.x = ((rawOffset % 1) + 1) % 1
        t.needsUpdate = true
        texs.push(t)
      } else {
        texs.push(null)
      }
      cx += pw
    }
    return texs
  }, [showVertical, claddingLinesTex, subWinWs, penantWs, winW])

  useFrame(() => {
    if (!showCladding) return
    const pairs: Array<[THREE.MeshStandardMaterial, THREE.Texture | null]> = [
      [cladFullRef.current,   cladTexs.full],
      [cladBottomRef.current, cladTexs.bottom],
      [cladTopRef.current,    cladTexs.top],
    ]
    if (showVertical) {
      pairs.push([cladLeftRef.current,  (cladTexs as any).left ?? null])
      pairs.push([cladRightRef.current, (cladTexs as any).right ?? null])
      penantVerticalTexs.forEach((tex, i) => pairs.push([getPenantMat(i), tex]))
    } else {
      pairs.push([cladSideRef.current, (cladTexs as any).side ?? null])
    }
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
  const fL = showCladding ? (showVertical ? cladLeftRef.current  : cladSideRef.current) : outerMatRef.current
  const fR = showCladding ? (showVertical ? cladRightRef.current : cladSideRef.current) : outerMatRef.current
  const bottomMats = [o, o, i, o, fB, i]
  const topMats    = [o, o, o, i, fT, i]
  const leftMats   = [i, o, o, o, fL, i]
  const rightMats  = [o, i, o, o, fR, i]

  const penants: JSX.Element[] = []
  if (subWinWs && penantWs && penantWs.length) {
    let cx = -winW / 2
    for (let idx = 0; idx < subWinWs.length - 1; idx++) {
      cx += subWinWs[idx]
      const pw = penantWs[idx]
      const fP = showCladding ? (showVertical ? getPenantMat(idx) : cladSideRef.current) : outerMatRef.current
      const penantMats = [i, i, o, o, fP, i]
      penants.push(
        <mesh key={`pen-${idx}`} position={[cx + pw / 2, winCY, 0]} material={penantMats} castShadow>
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

  const frameOuterMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.08, envMapIntensity: 0.8, color: frameColor }))
  const lipOuterMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: frameColor }))
  const sashOuterMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: sashColor }))
  const frameInnerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.08, envMapIntensity: 0.8, color: '#FFFFFF' }))
  const lipInnerMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#FFFFFF' }))
  const sashInnerMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#FFFFFF' }))
  const fixedSashMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#F5F0EB' }))

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

/** Closed panel — when the front cladding is "Rabatprofiel" (rondkantpanelen),
 *  a Gesloten paneel gets the SAME horizontal-line texture and color as the
 *  side cheeks, so it visually reads as a continuation of the side surface
 *  instead of a plain flat block. HPL / Kader styles stay flat (no lines). */
export function ClosedPanel({ W, H, frameColor, panelColor, styleType, claddingMaterial, worldYBottom = 0, worldXLeft = 0 }: {
  W: number; H: number; frameColor: string; panelColor: string;
  styleType?: 'traditional' | 'kader';
  claddingMaterial?: 'rondkantpanelen' | 'hpl' | 'composiet';
  worldYBottom?: number;
  worldXLeft?: number;
}) {
  const animatedPanelColor = useAnimatedColor(panelColor, 0.25)
  const isVertical = claddingMaterial === 'composiet'
  const showCladding = styleType === 'traditional' && claddingMaterial !== 'hpl'

  const claddingTex = useMemo(() => {
    if (!showCladding) return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      ctx.strokeStyle = 'rgba(20,20,20,0.75)'
      ctx.lineWidth = 6
      if (isVertical) {
        for (let x = 0; x <= 256; x += 64) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke()
        }
      } else {
        for (let y = 0; y <= 256; y += 64) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    if (isVertical) {
      // Composiet — phase-align by this panel's real world LEFT-edge X, same
      // technique as the horizontal offset below, so the vertical board
      // seams line up with the adjacent FrontWall side-strip instead of
      // each restarting its own pattern at x=0 (which showed as a visible
      // mismatch/seam at the boundary).
      tex.repeat.set(claddingRepeatU(W), 1)
      const rawOffsetX = worldXLeft / mm(CLAD_TILE_MM)
      tex.offset.x = ((rawOffsetX % 1) + 1) % 1
    } else {
      // Rabatprofiel — same real-height-based repeat as the side cheeks, so plank size matches.
      tex.repeat.set(1, claddingRepeatV(H))
      // ClosedPanel is rendered inside a group already offset by winYBottom in
      // world space, but the mesh's own local UV always starts at v=0 — so
      // without this, its lines were always in phase with world Y=0 instead of
      // its own real world position, causing a mismatch against the FrontWall
      // strips (which DO account for this) and the SideCheek.
      const rawOffset = (worldYBottom + mm(CLAD_PHASE_ADJUST_MM)) / mm(CLAD_TILE_MM)
      tex.offset.y = ((rawOffset % 1) + 1) % 1
    }
    tex.anisotropy = 16
    tex.generateMipmaps = false
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [showCladding, isVertical, W, H, worldYBottom, worldXLeft])

  const panelMatRef = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, color: panelColor }))
  useFrame(() => {
    panelMatRef.current.color.lerp(animatedPanelColor, 0.25)
    const next = claddingTex ?? null
    if (panelMatRef.current.map !== next) { panelMatRef.current.map = next; panelMatRef.current.needsUpdate = true }
  })

  return (
    <mesh position={[0, H / 2, 0]} material={panelMatRef.current}>
      <boxGeometry args={[W, H, FRONT_T]} />
    </mesh>
  )
}

export function FlatRoof({ W, H, depth, color, isKader = false, sideW = SIDE_W }: { W: number; H: number; depth: number; color: string; isKader?: boolean; sideW?: number }) {
  const targetColorRef = useRef(new THREE.Color(color))
  const frontMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.08, envMapIntensity: 0.5, color }))
  const topSideMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, color: '#F7F9EF' }))
  const innerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.08, envMapIntensity: 0.5, color: '#FFFFFF' }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { frontMatRef.current.color.lerp(targetColorRef.current, 0.25) })

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const soffitMat = useMemo(() => {
    const { u, v } = woodRepeatFromSize(W, depth)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm, THREE.FrontSide)
  }, [woodCol, woodRgh, woodNrm, W, depth])

  const totalW   = isKader ? W + sideW * 2 + mm(295) : W + (sideW + ROOF_SIDE_OVH) * 2
  const slabLen  = depth + ROOF_OVERHANG
  const slabCtrZ = (ROOF_OVERHANG - depth) / 2

  return (
    <group position={[0, H, 0]}>
      <mesh position={[0, ROOF_SLAB_T / 2, slabCtrZ]} castShadow material={[
        frontMatRef.current, // 0: right face (colored)
        frontMatRef.current, // 1: left face (colored)
        topSideMatRef.current, // 2: top face (grey — unchanged)
        frontMatRef.current, // 3: bottom face — now follows the selected boei color instead of staying fixed white
        frontMatRef.current, // 4: front face (colored)
        topSideMatRef.current, // 5: back face (grey — unchanged)
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

function BoeiSideBand({ position, size, mainColor, boeiColor, outward }: {
  position: [number, number, number]
  size: [number, number, number]
  mainColor: string
  boeiColor: string
  outward: 'left' | 'right'
}) {
  const animatedMain = useAnimatedColor(mainColor, 0.25)
  const animatedBoei = useAnimatedColor(boeiColor, 0.25)
  const mainMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05, color: mainColor }))
  const boeiMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.08, color: boeiColor }))
  useFrame(() => {
    mainMatRef.current.color.lerp(animatedMain, 0.25)
    boeiMatRef.current.color.lerp(animatedBoei, 0.25)
  })

  const m = mainMatRef.current
  const b = boeiMatRef.current
  const mats = outward === 'right'
    ? [b, m, m, m, b, m]
    : [m, b, m, m, b, m]

  return (
    <mesh position={position} material={mats} castShadow>
      <boxGeometry args={size} />
    </mesh>
  )
}

/** Generates a grey striped canvas texture, used for both the Bitumen roof
 *  membrane and the Loodvervanger flashing (so both get the same "roll-seam
 *  stripes" look). stripeWPx controls how wide each stripe is on the 256px
 *  canvas — bigger number = wider stripes / more spacing between lines. */
function createStripeTexture(stripeWPx: number, baseColor = '#6b6b6b', lightColor = '#787878', darkColor = '#5e5e5e'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, 256, 256)
    for (let x = 0; x < 256; x += stripeWPx) {
      ctx.fillStyle = (x / stripeWPx) % 2 === 0 ? lightColor : darkColor
      ctx.fillRect(x, 0, stripeWPx, 256)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke()
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

function RoofMembrane({ position, size, covering = 'bitumen' }: {
  position: [number, number, number]
  size: [number, number, number]
  covering?: 'bitumen' | 'epdm'
}) {
  const isBitumen = covering === 'bitumen'
  const [totalW, thickness, totalD] = size

  // Wide field strips — much wider spacing than before, matching the
  // reference photo's wide bitumen roll strips (not the old busy fine lines).
  const fieldTex = useMemo(() => {
    if (!isBitumen) return null
    const tex = createStripeTexture(160, '#6b6b6b', '#767676', '#5c5c5c')
    tex.repeat.set(Math.max(totalW / mm(1200), 1), Math.max(totalD / mm(2200), 1))
    tex.anisotropy = 16
    return tex
  }, [isBitumen, totalW, totalD])

  const fieldMatRef = useRef(new THREE.MeshStandardMaterial({
    color: isBitumen ? '#6b6b6b' : '#3f3f3f',
    roughness: isBitumen ? 0.85 : 0.9,
    metalness: 0,
    map: fieldTex,
  }))
  useEffect(() => {
    fieldMatRef.current.color.set(isBitumen ? '#6b6b6b' : '#3f3f3f')
    fieldMatRef.current.roughness = isBitumen ? 0.85 : 0.9
    fieldMatRef.current.map = fieldTex
    fieldMatRef.current.needsUpdate = true
  }, [isBitumen, fieldTex])

  // Border/edge strip running around the perimeter — visible in the
  // reference photo as a distinct strip along all four sides, slightly
  // lighter than the main field. Bitumen only (EPDM stays one flat surface).
  const BORDER_W = mm(220)
  const borderMatRef = useRef(new THREE.MeshStandardMaterial({ color: '#7d7d7d', roughness: 0.85, metalness: 0 }))
  useEffect(() => {
    borderMatRef.current.color.set('#7d7d7d')
  }, [])

  // Small daktrim/kraal edge — a thin trim strip that stays visible just
  // past the membrane's own boundary (wider + set slightly lower than the
  // membrane, so only its outer rim peeks out, like real roof edge trim).
  const TRIM_W = mm(18)
  const trimMatRef = useRef(new THREE.MeshStandardMaterial({ color: '#c9c9c9', roughness: 0.4, metalness: 0.25 }))

  const fieldW = Math.max(totalW - BORDER_W * 2, mm(50))
  const fieldD = Math.max(totalD - BORDER_W * 2, mm(50))

  return (
    <group position={position}>
      {/* Main field */}
      <mesh castShadow receiveShadow material={fieldMatRef.current}>
        <boxGeometry args={[isBitumen ? fieldW : totalW, thickness, isBitumen ? fieldD : totalD]} />
      </mesh>

      {isBitumen && (
        <>
          {/* Front / back border strips */}
          <mesh position={[0, 0, (totalD - BORDER_W) / 2]} castShadow receiveShadow material={borderMatRef.current}>
            <boxGeometry args={[totalW, thickness, BORDER_W]} />
          </mesh>
          <mesh position={[0, 0, -(totalD - BORDER_W) / 2]} castShadow receiveShadow material={borderMatRef.current}>
            <boxGeometry args={[totalW, thickness, BORDER_W]} />
          </mesh>
          {/* Left / right border strips */}
          <mesh position={[(totalW - BORDER_W) / 2, 0, 0]} castShadow receiveShadow material={borderMatRef.current}>
            <boxGeometry args={[BORDER_W, thickness, fieldD]} />
          </mesh>
          <mesh position={[-(totalW - BORDER_W) / 2, 0, 0]} castShadow receiveShadow material={borderMatRef.current}>
            <boxGeometry args={[BORDER_W, thickness, fieldD]} />
          </mesh>
        </>
      )}

      {/* Daktrim/kraal — thin trim that stays visible right at the edge */}
      <mesh position={[0, -thickness * 0.35, 0]} material={trimMatRef.current}>
        <boxGeometry args={[totalW + TRIM_W * 2, thickness * 0.35, totalD + TRIM_W * 2]} />
      </mesh>
    </group>
  )
}

/** Lood/Loodvervanger flashing band — Loodvervanger gets the same striped
 *  "roll-seam" look as the Bitumen roof membrane (dark grey stripes), Lood
 *  stays a flat light-grey surface (no texture), matching how EPDM stays
 *  flat while Bitumen gets stripes. */
function FlashingBand({ position, rotation, size, roofConnection }: {
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
  roofConnection?: 'lood' | 'loodvervanger'
}) {
  const isLoodvervanger = roofConnection === 'loodvervanger'

  const stripeTex = useMemo(() => {
    if (!isLoodvervanger) return null
    const tex = createStripeTexture(72, '#2a2a2a', '#3a3a3a', '#1c1c1c')
    tex.repeat.set(Math.max(size[0] / mm(300), 1), Math.max(size[2] / mm(300), 1))
    return tex
  }, [isLoodvervanger, size])

  const matRef = useRef(new THREE.MeshStandardMaterial({
    color: isLoodvervanger ? '#2a2a2a' : '#b8b8b8',
    roughness: 0.45,
    metalness: 0.3,
    map: stripeTex,
    // Layer 3 of 3 — these bands clear the roof tile plane by only
    // 0.12-0.72mm depending on pitch, which is far too little to reliably win
    // the depth test at every zoom level. Pulling them TOWARD the camera
    // guarantees the Lood/Loodvervanger strips stay visible on top of the
    // tiles instead of being swallowed by them.
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  }))

  useEffect(() => {
    matRef.current.color.set(isLoodvervanger ? '#2a2a2a' : '#b8b8b8')
    matRef.current.map = stripeTex
    matRef.current.needsUpdate = true
  }, [isLoodvervanger, stripeTex])

  return (
    <mesh position={position} rotation={rotation} material={matRef.current}>
      <boxGeometry args={size} />
    </mesh>
  )
}

function FasciaBoard({ W, H, depth, color, isKader = false, sideW = SIDE_W }: {
  W: number; H: number; depth: number; color: string; isKader?: boolean; sideW?: number
}) {
  const targetColorRef = useRef(new THREE.Color(color))
  const frontMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, color }))
  const greyMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, color: '#F7F9EF' }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { frontMatRef.current.color.lerp(targetColorRef.current, 0.25) })

  const width = isKader ? W + sideW * 2 + mm(300) : W + (sideW + ROOF_SIDE_OVH) * 2
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

/** Daktrim/Dakkraal — a thin white trim strip running along the roof edge
 *  right on top of the boei/fascia, on the front and both sides (matching
 *  FasciaBoard's own front+depth footprint math so it lines up exactly).
 *  Two profiles: "daktrim" is a flat box strip, "dakkraal" is a round
 *  aluminum rod (rendered as a cylinder). Visible by default (this is not
 *  gated behind any cladding/style choice — it always renders once a
 *  ProceduralDormer exists). */
function DakTrim({ W, H, depth, isKader = false, sideW = SIDE_W, trimType = 'daktrim', color = '#FFFFFF', pitchDeg = 35 }: {
  W: number; H: number; depth: number; isKader?: boolean; sideW?: number;
  trimType?: 'daktrim' | 'dakkraal'; color?: string; pitchDeg?: number;
}) {
  const isDakkraal = trimType === 'dakkraal'
  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)
  const matRef = useRef(new THREE.MeshStandardMaterial({
    color,
    roughness: isDakkraal ? 0.3 : 0.55,
    metalness: isDakkraal ? 0.45 : 0.05,
  }))
  useEffect(() => {
    matRef.current.color.set(color)
    matRef.current.roughness = isDakkraal ? 0.3 : 0.55
    matRef.current.metalness = isDakkraal ? 0.45 : 0.05
  }, [color, isDakkraal])

  // Same width/length/topY math as FasciaBoard, so this trim sits exactly
  // on top of it and matches its footprint on the front and both sides.
  const width  = isKader ? W + sideW * 2 + mm(300) : W + (sideW + ROOF_SIDE_OVH) * 2
  const topY   = H + ROOF_SLAB_T + mm(20) + mm(20) // top surface of the mm(40)-tall FasciaBoard
  const frontZ = ROOF_OVERHANG
  const halfW  = width / 2

  const PROFILE = mm(90)   // round rod diameter / flat strip footprint width — bigger, clearly visible
  const FLAT_T  = mm(25)   // flat daktrim thickness

  // Corner fix (flat/box variant): the FRONT piece is extended by half a
  // profile-width on each side so it fully spans past the corner, and the
  // SIDE pieces are shortened to start exactly where the front piece ends
  // — clean butt joint, no overlap/gap. The round/sphere variant below
  // uses DIFFERENT (non-extended, exact) values — see isDakkraal branch.
  const frontWidth   = width + PROFILE
  const sideFrontZ   = frontZ - PROFILE / 2

  // The side pieces run LEVEL for their whole length, along the top edge of
  // the cheek, and stop where the rising roof surface meets the underside of
  // the trim — i.e. they follow the roof line instead of leaving it.
  const roofMeetZ = (mm(5) - topY) / Math.tan(pitchRad)
  const sideBackZ = Math.max(-depth, roofMeetZ)

  if (isDakkraal) {
    const radius = PROFILE / 2
    // Exact (non-extended) corner math for the round variant — both the
    // front cylinder and each side cylinder terminate PRECISELY at the
    // sphere's center (halfW, frontZ), instead of one overshooting past it
    // and the other falling short of it, so the sphere fully blends both
    // directions into one smooth-looking joint instead of a visible gap or
    // a rod poking out past the ball.
    const rSideLength  = frontZ - sideBackZ
    const rSideCenterZ = (frontZ + sideBackZ) / 2

    return (
      <group>
        <mesh position={[0, topY + radius, frontZ]} rotation={[0, 0, Math.PI / 2]} material={matRef.current} castShadow>
          <cylinderGeometry args={[radius, radius, width, 16]} />
        </mesh>
        {[-halfW, halfW].map((x) => (
          <mesh key={x} position={[x, topY + radius, rSideCenterZ]} rotation={[Math.PI / 2, 0, 0]} material={matRef.current} castShadow>
            <cylinderGeometry args={[radius, radius, rSideLength, 16]} />
          </mesh>
        ))}
        {/* Sphere at each front corner, centered exactly where the front
            cylinder's end and the side cylinder's end both meet — blends
            both directions into one smooth rounded joint. */}
        <mesh position={[-halfW, topY + radius, frontZ]} material={matRef.current} castShadow>
          <sphereGeometry args={[radius, 16, 16]} />
        </mesh>
        <mesh position={[halfW, topY + radius, frontZ]} material={matRef.current} castShadow>
          <sphereGeometry args={[radius, 16, 16]} />
        </mesh>
      </group>
    )
  }

  // Flat/box variant — same level full-depth run.
  const sideLength  = sideFrontZ - sideBackZ
  const sideCenterZ = (sideFrontZ + sideBackZ) / 2

  return (
    <group>
      <mesh position={[0, topY + FLAT_T / 2, frontZ]} material={matRef.current} castShadow>
        <boxGeometry args={[frontWidth, FLAT_T, PROFILE]} />
      </mesh>
      {[-halfW, halfW].map((x) => (
        <group key={x}>
          <mesh position={[x, topY + FLAT_T / 2, sideCenterZ]} material={matRef.current} castShadow>
            <boxGeometry args={[PROFILE, FLAT_T, sideLength]} />
          </mesh>
          {/* Corner block — bridges the seam where the front piece and this
              side piece meet, same idea as the round variant's sphere cap,
              so the corner reads as one blended piece instead of two boxes
              just touching. */}
          <mesh position={[x, topY + FLAT_T / 2, frontZ]} material={matRef.current} castShadow>
            <boxGeometry args={[PROFILE, FLAT_T, PROFILE]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function SideCheek({
  H, depth, color, side, claddingMaterial, isKader = false, sideW = SIDE_W,
}: { H: number; depth: number; color: string; side: 'left' | 'right'; claddingMaterial?: 'rondkantpanelen' | 'hpl' | 'composiet'; isKader?: boolean; sideW?: number }) {
  const animatedColor = useAnimatedColor(color, 0.25)
  const geom = useMemo(() => makeCheekGeom(H, depth, sideW), [H, depth, sideW])
  const flipX = side === 'left' ? -1 : 1
  // Composiet is the one exception where the side cheeks now follow the
  // front's orientation (vertical boards) — for every other choice (HPL,
  // Rabatprofiel), side cheeks keep their original always-horizontal
  // Rabatprofiel look, independent of the front's choice.
  const isVertical = claddingMaterial === 'composiet'

  const linesTex = useMemo(() => {
    if (isKader) return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      ctx.strokeStyle = 'rgba(20,20,20,0.75)'
      ctx.lineWidth = 6
      if (isVertical) {
        for (let x = 0; x <= 256; x += 64) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke()
        }
      } else {
        for (let y = 0; y <= 256; y += 64) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    if (isVertical) {
      tex.repeat.set(claddingRepeatU(sideW, COMPOSIET_TILE_MM_NARROW), 1)
    } else {
      tex.repeat.set(1, claddingRepeatV(H))
    }
    tex.anisotropy = 16
    tex.generateMipmaps = false
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [isVertical, isKader, H, sideW])

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const innerWoodMat = useMemo(() => {
    const slopeLen = Math.hypot(H, depth)
    const { u, v } = woodRepeatFromSize(sideW, slopeLen)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm)
  }, [woodCol, woodRgh, woodNrm, H, depth, sideW])

  const bodyMatRef  = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))
  const outerMatRef = useRef(new THREE.MeshPhysicalMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0, reflectivity: 0, clearcoat: 0, side: THREE.DoubleSide }))

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

export function RoofSurface({ W, H, depth, pitchDeg, sideExt, isKader, roofTileColor, sideW = SIDE_W }: { W: number; H: number; depth: number; pitchDeg: number; sideExt?: number; isKader?: boolean; roofTileColor?: string; sideW?: number }) {
  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  const FORWARD     = isKader ? mm(900) : mm(700)
  const BACK        = depth + mm(300)
  const holeHW      = isKader ? (W + sideW * 2 + mm(280)) / 2 : (W + sideW * 2) / 2
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
      // Anisotropic filtering — this REQUIRES a normal mipmap chain to work
      // (mipmaps stay enabled/default here). Combining this with disabled
      // mipmaps is an invalid/conflicting GPU texture configuration that
      // caused the roof to render as a near-invisible sliver at a distance —
      // that combination has been removed.
      t.anisotropy = 16
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
      // NO depth bias on the tile plane itself — this is layer 2 of 3.
      //
      // History: this was originally a POSITIVE offset (push away) to stop two
      // dormers' tile planes z-fighting. That pushed the plane behind the wood
      // `backPanels` ~20mm underneath it when viewed near edge-on, so zoomed
      // out the roof rendered as pale wood. Flipping it NEGATIVE fixed that but
      // broke the Lood/Loodvervanger flashing bands, which clear the tile plane
      // by only 0.12-0.72mm — pulling the tiles forward buried them, so
      // toggling the button appeared to do nothing.
      //
      // Neither sign can be right for both, because the tile plane needs to
      // beat what's below it and lose to what's above it. So the bias now lives
      // on the neighbours instead, giving one unambiguous order:
      //   backPanels  +2  (pushed back, below)
      //   tile plane   0  (here)
      //   FlashingBand -1 (pulled forward, above)
      // The original z-fighting concern is already handled geometrically:
      // MAX_ROOF_SIDE_EXT is exactly half of Scene.tsx's DORMER_GAP_MM, so
      // neighbouring roof planes meet at the midpoint and never overlap.
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
    const lift = mm(40)  // distance behind slope (reverted — the 300mm test had no confirmed effect)
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
    () => backPanels.map((panel) => {
      const m = createWoodMaterial(panel.repeatU, panel.repeatV, woodCol, woodRgh, woodNrm)
      // Layer 1 of 3 — these wood panels sit only ~20mm beneath the tile plane
      // and span the whole roof, so at shallow viewing angles they used to win
      // the depth test and the roof rendered as pale wood. Pushing them AWAY
      // from the camera keeps the tiles on top at every zoom level, without
      // biasing the tile plane itself (which would bury the flashing bands
      // just above it). These materials are created fresh here, so mutating
      // them affects nothing else that uses createWoodMaterial.
      m.polygonOffset = true
      m.polygonOffsetFactor = 2
      m.polygonOffsetUnits = 2
      return m
    }),
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
        const totalHalfW = isKader ? (W + sideW * 2 + mm(280)) / 2 : (W + (sideW + ROOF_SIDE_OVH) * 2) / 2
        const pipeXLeft = -totalHalfW + mm(40)
        const pipeXRight = totalHalfW - mm(40)
        const overhangBackZ = slabCtrZ - slabHalfLen
        const pipeZ = overhangBackZ + mm(500)
        const pipeHeight = mm(250)
        const pipeRadius = mm(35)
        const extraDown = mm(50)
        const pipeY = slabTopY - pipeHeight / 2 - extraDown

        return (
          <>
            <mesh position={[pipeXLeft, pipeY, pipeZ]} castShadow receiveShadow>
              <cylinderGeometry args={[pipeRadius, pipeRadius, pipeHeight, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} envMapIntensity={1.0} />
            </mesh>
            {/* Same pipe mirrored onto the right side */}
            <mesh position={[pipeXRight, pipeY, pipeZ]} castShadow receiveShadow>
              <cylinderGeometry args={[pipeRadius, pipeRadius, pipeHeight, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} envMapIntensity={1.0} />
            </mesh>
          </>
        )
      })()}
    </group>
  )
}

export function PipePanel({ pitchRad, W, clipHW, isKader = false, sideW = SIDE_W }: { pitchRad: number; W: number; clipHW: number; isKader?: boolean; sideW?: number }) {
  const { scene } = useGLTF('/models/pipepanel.glb')
  // Object3D.clone() copies the scene graph but SHARES materials between the
  // clones. With more than one dormer in the scene, every PipePanel was
  // writing its own clippingPlanes onto the SAME material objects below —
  // last one to mount wins, so both dormers ended up clipped by a single
  // dormer's region. Cloning the materials per instance gives each panel its
  // own independent clip state.
  const cloned = useMemo(() => {
    const c = scene.clone()
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = Array.isArray(child.material)
          ? child.material.map((m: THREE.Material) => m.clone())
          : (child.material as THREE.Material).clone()
      }
    })
    return c
  }, [scene])
  const FORWARD = isKader ? mm(1050) : mm(850)
  const ATTACH_Z = isKader ? mm(900) : mm(700)
  const totalW  = isKader ? W + sideW * 2 + mm(300) : W + (sideW + ROOF_SIDE_OVH) * 2
  const planeBottomY = -ATTACH_Z * Math.tan(pitchRad)

  const groupRef = useRef<THREE.Group>(null)

  const clipPlanes = useMemo(() => [
    new THREE.Plane(new THREE.Vector3( 1, 0, 0),  clipHW),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0),  clipHW),
  ], [clipHW])

  // THREE.Plane clipping planes are evaluated in WORLD space, but these were
  // built as +/-clipHW around world x = 0. That is only correct for a dormer
  // standing at the origin — a second dormer sits at its own world X offset
  // and was being clipped against a region it isn't in, so its panel was
  // sliced away entirely while the other's rendered unclipped. Re-centre the
  // planes on this panel's real world position.
  //
  // Plane keeps the half-space where normal . p + constant >= 0, so
  // constant = clipHW -/+ worldX reduces to the original values at x = 0.
  const worldPos = useRef(new THREE.Vector3())
  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    g.getWorldPosition(worldPos.current)
    const x = worldPos.current.x
    clipPlanes[0].constant = clipHW - x
    clipPlanes[1].constant = clipHW + x
  })

  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: THREE.Material) => {
          m.clippingPlanes = clipPlanes
          // Going from no planes to two changes the shader program, so the
          // material has to be flagged for recompile.
          m.needsUpdate = true
        })
      }
    })
  }, [cloned, clipPlanes])

  return (
    <group ref={groupRef}>
      <primitive
        object={cloned}
        position={[0, planeBottomY, FORWARD]}
        rotation={[-Math.PI / 30, Math.PI / 2, 0]}
        scale={[-0.13, 0.13, totalW /6.9]}
      />
    </group>
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
    wangWidth,
  } = config

  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  // Both wangen (Linkerwang/Rechterwang) share this one adjustable width —
  // falls back to the original fixed 190mm if not set.
  const sideW = mm(wangWidth ?? 190)

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

  // Antraciet gets an actual dark tint now, instead of white/untinted. The
  // roof's dark look was relying mostly on the normal map's simulated
  // shadow/bump detail (normalScale is quite strong) rather than the base
  // diffuse color — but normal maps flatten out toward "no bump" at low
  // mip levels (distance/zoomed out), which removed that shading and left
  // just the flat, lighter base texture color showing through. Tinting the
  // base color dark directly means it stays dark regardless of whether the
  // normal-map detail is visible or has flattened out.
  const roofTileTint = config.roofTileColor === 'antraciet' ? '#3a3a3a' : '#EC8A4A'

  return (
    <group position={[0, -H / 2, 0]}>
      {(() => {
        const roofSideExt = Math.min((W_single + sideW * 2) / 2, MAX_ROOF_SIDE_EXT)
        return (
          <>
            <RoofSurface W={W} H={H} depth={depth} pitchDeg={pitchDeg} sideExt={roofSideExt} isKader={styleType === 'kader'} roofTileColor={roofTileTint} sideW={sideW} />
            <PipePanel pitchRad={pitchRad} W={W} clipHW={styleType === 'kader' ? (W + sideW * 2 + mm(280)) / 2 + roofSideExt : (W + sideW * 2) / 2 + roofSideExt} isKader={styleType === 'kader'} sideW={sideW} />
          </>
        )
      })()}

      <FrontWall
        W={styleType === 'kader' ? W + sideW * 2 + mm(280) : W + sideW * 2 - mm(4)} H={H} color={frontColor}
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
                  styleType={styleType}
                  claddingMaterial={claddingMaterial}
                  worldYBottom={winYBottom}
                  worldXLeft={xOff - wWidth / 2}
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

      <FlatRoof W={W} H={H} depth={depth} color={fasciaColor} isKader={styleType === 'kader'} sideW={sideW} />

      <FasciaBoard
        W={W}
        H={H}
        depth={depth}
        color={fasciaColor}
        isKader={styleType === 'kader'}
        sideW={sideW}
      />

      <DakTrim
        W={W}
        H={H}
        depth={depth}
        isKader={styleType === 'kader'}
        sideW={sideW}
        trimType={config.trimType ?? 'daktrim'}
        pitchDeg={pitchDeg}
      />

      {(() => {
        const isKaderStyle = styleType === 'kader'
        const totalW = isKaderStyle ? W + sideW * 2 + mm(295) : W + (sideW + ROOF_SIDE_OVH) * 2
        const slabLen = depth + ROOF_OVERHANG
        const slabCtrZ = (ROOF_OVERHANG - depth) / 2
        const slabTopY = H + ROOF_SLAB_T + mm(40) + mm(3)
        return (
          <RoofMembrane
            position={[0, slabTopY, slabCtrZ]}
            size={[totalW - mm(300), mm(20), slabLen - mm(300)]}
            covering={config.roofCovering}
          />
        )
      })()}

      <group position={[halfW + (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="right" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} sideW={sideW} />
        {styleType === 'kader' && (
          <AnimatedBox
            position={[sideW / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[sideW + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
        {styleType === 'kader' && (
          <BoeiSideBand
            position={[sideW / 2, H + (ROOF_SLAB_T + mm(40)) / 2, (ROOF_OVERHANG - depth) / 2 + mm(10)]}
            size={[sideW + mm(6), ROOF_SLAB_T + mm(40), depth + ROOF_OVERHANG - mm(2)]}
            mainColor={frontColor}
            boeiColor={fasciaColor}
            outward="right"
          />
        )}
        <FlashingBand
          position={[sideW / 2 + mm(90), (depth / 2) * Math.tan(pitchRad) + mm(3), -depth / 2]}
          rotation={[pitchRad, 0, 0]}
          size={[mm(260), mm(6), Math.hypot(cheekH, depth)]}
          roofConnection={config.roofConnection}
        />
      </group>

      <group position={[-halfW - (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="left" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} sideW={sideW} />
        {styleType === 'kader' && (
          <AnimatedBox
            position={[-sideW / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[sideW + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
        {styleType === 'kader' && (
          <BoeiSideBand
            position={[-sideW / 2, H + (ROOF_SLAB_T + mm(40)) / 2, (ROOF_OVERHANG - depth) / 2 + mm(10)]}
            size={[sideW + mm(6), ROOF_SLAB_T + mm(40), depth + ROOF_OVERHANG - mm(2)]}
            mainColor={frontColor}
            boeiColor={fasciaColor}
            outward="left"
          />
        )}
        <FlashingBand
          position={[-sideW / 2 - mm(90), (depth / 2) * Math.tan(pitchRad) + mm(3), -depth / 2]}
          rotation={[pitchRad, 0, 0]}
          size={[mm(260), mm(6), Math.hypot(cheekH, depth)]}
          roofConnection={config.roofConnection}
        />
      </group>

      {(() => {
        const spanX = 2 * (halfW + sideW / 2 + mm(90)) + mm(260)
        return (
          <>
            <FlashingBand
              position={[0, mm(3) - mm(60) * Math.tan(pitchRad), mm(60)]}
              rotation={[pitchRad, 0, 0]}
              size={[spanX, mm(6), mm(220)]}
              roofConnection={config.roofConnection}
            />
            <FlashingBand
              position={[0, cheekH - mm(42), -depth + mm(70)]}
              rotation={[pitchRad, 0, 0]}
              size={[spanX, mm(6), mm(400)]}
              roofConnection={config.roofConnection}
            />
          </>
        )
      })()}
    </group>
  )
}