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

  // Measure bounding box after the cloned scene is in the graph
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

  // Measure original size from cloned object for scaling
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

const mm = (v: number) => v / 1000   // millimetres → scene units

/** One wood texture tile covers this many mm — repeat scales with face size to avoid stretching */
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

// ─── Constants (mm) ────────────────────────────────────────────────────────
const SIDE_W       = mm(240)   // side cheek wall thickness
const FRONT_T      = mm(140)   // front wall depth (Z)
const FASCIA_H     = mm(150)   // fascia board height
const FASCIA_T     = mm(30)    // fascia board thickness
const FRAME_T      = mm(60)    // window frame thickness
const GLASS_T      = mm(8)     // glass pane thickness
const SOFFIT_T     = mm(60)    // underside panel thickness
const FLOOR_PANEL  = mm(40)    // thin bottom sill

// FlatRoof shared constants
const ROOF_OVERHANG = mm(220)  // forward overhang beyond front face
const ROOF_SIDE_OVH = mm(80)  // extra side overhang beyond cheeks
const ROOF_SLAB_T   = mm(220)  // flat slab thickness
const ROOF_FSC_H    = mm(160)  // front fascia drop height
const ROOF_FSC_T    = mm(40)   // front fascia thickness

// ─── Helper: create a triangular prism (side cheek) ────────────────────────
// Correct dormer cheek shape (side view / YZ plane):
//   A = front-bottom (Y=0,  Z=0)   ← base at roof level
//   B = front-top   (Y=H,  Z=0)   ← top of front wall
//   C = back-top    (Y=H,  Z=-D)  ← where flat roof meets roof slope
// Slope face: A→C (hypotenuse), matches pitched roof surface
export function makeCheekGeom(H: number, D: number): THREE.BufferGeometry {
  const positions = new Float32Array([
    // Front face (Z=0) — vertical rectangle A-B
    0,      0, 0,   SIDE_W, 0, 0,   0,      H, 0,
    SIDE_W, 0, 0,   SIDE_W, H, 0,   0,      H, 0,
    // Top face (Y=H) — horizontal rectangle B-C
    0,      H,  0,   SIDE_W, H,  0,   0,      H, -D,
    SIDE_W, H,  0,   SIDE_W, H, -D,   0,      H, -D,
    // Slope face — hypotenuse from A(0,0) to C(H,-D)
    0,      0, 0,   0,      H, -D,   SIDE_W, 0,  0,
    SIDE_W, 0, 0,   0,      H, -D,   SIDE_W, H, -D,
    // Left cap (X=0) — triangle A,B,C
    0, 0,  0,   0, H,  0,   0, H, -D,
    // Right cap (X=SIDE_W) — triangle A,B,C
    SIDE_W, 0,  0,   SIDE_W, H, -D,   SIDE_W, H, 0,
  ])
  // UV: u = normalised X (0‥1 across SIDE_W), v = normalised Y (0‥1 across H)
  const sw = SIDE_W
  const uvs = new Float32Array([
    // Front face
    0, 0,   sw/sw, 0,   0, 1,
    sw/sw, 0,   sw/sw, 1,   0, 1,
    // Top face
    0, 0,   sw/sw, 0,   0, 1,
    sw/sw, 0,   sw/sw, 1,   0, 1,
    // Slope face — v = y/H keeps lines horizontal in world space
    0, 0,   0, 1,   sw/sw, 0,
    sw/sw, 0,   0, 1,   sw/sw, 1,
    // Left cap
    0, 0,   0, 1,   1, 1,
    // Right cap
    0, 0,   1, 1,   0, 1,
  ])
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  g.computeVertexNormals()
  // Group 0: body faces (front, top, slope) — 18 verts
  // Group 1: left cap (X=0)                — 3 verts
  // Group 2: right cap (X=SIDE_W)          — 3 verts
  g.addGroup(0,  18, 0)
  g.addGroup(18,  3, 1)
  g.addGroup(21,  3, 2)
  return g
}

// ─── Roof Tile Texture Generator ──────────────────────────────────────────
function createRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Dark base color (slate/tile dark)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 512, 512)

  // Draw staggered tile pattern
  const tileW = 64
  const tileH = 40
  const gap = 2

  for (let row = 0; row < 512 / tileH + 2; row++) {
    const offset = (row % 2) * (tileW / 2)
    for (let col = -1; col < 512 / tileW + 1; col++) {
      const x = col * tileW + offset
      const y = row * tileH

      // Tile gradient
      const grad = ctx.createLinearGradient(x, y, x, y + tileH - gap)
      grad.addColorStop(0, '#2a2a2a')
      grad.addColorStop(0.5, '#1a1a1a')
      grad.addColorStop(1, '#0f0f0f')

      ctx.fillStyle = grad
      ctx.fillRect(x + gap, y + gap, tileW - gap * 2, tileH - gap)

      // Tile edge highlight
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

// ─── Cube with Roof Tile Texture ───────────────────────────────────────────
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

// ─── Sub-components ────────────────────────────────────────────────────────

export function FrontWall({ W, H, color, winW, winH, winYBottom, subWinWs, penantWs }: {
  W: number; H: number; color: string;
  winW?: number; winH?: number; winYBottom?: number;
  subWinWs?: number[]; penantWs?: number[];
}) {
  const animatedColor = useAnimatedColor(color, 0.25)
  // Outer material (colored) - front and sides
  const outerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.08, envMapIntensity: 0.6, color }))
  // Inner material (always white) - back face
  const innerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.08, envMapIntensity: 0.6, color: '#FFFFFF' }))
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

  if (!winW || !winH) {
    // Full wall without window - outside colored, inside white
    const fullWallMats = [
      outerMatRef.current, outerMatRef.current, outerMatRef.current,
      outerMatRef.current, outerMatRef.current, innerMatRef.current,
    ]
    return (
      <mesh position={[0, H / 2, 0]} castShadow material={fullWallMats}>
        <boxGeometry args={[W, H, FRONT_T]} />
      </mesh>
    )
  }
  const yBot  = winYBottom ?? (H - winH) / 2
  const botH  = yBot
  const topH  = H - yBot - winH
  const sideW = (W - winW) / 2
  const winCY = yBot + winH / 2

  // BoxGeometry group order: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z(front), 5=-Z(back)
  // Reveal faces per strip (inward face only, never group 4 = front):
  // Outside (colored): 0,1,2,3,4 | Inside (white): 5
  const o = outerMatRef.current  // outer/colored
  const i = innerMatRef.current  // inner/white
  const r = revealMat
  const bottomMats = [o, o, i, o, o, i]  // +Y (top of bottom strip) faces window - white
  const topMats    = [o, o, o, i, o, i]  // -Y (bottom of top strip) faces window - white
  const leftMats   = [i, o, o, o, o, i]  // +X (right of left strip) faces window - white
  const rightMats  = [o, i, o, o, o, i]  // -X (left of right strip) faces window - white
  const penantMats = [i, i, o, o, o, i]  // both sides face window openings - white

  // Build penant (divider) strips between window openings
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
      {/* Bottom strip — reveal on +Y */}
      <mesh position={[0, botH / 2, 0]} material={bottomMats} castShadow receiveShadow>
        <boxGeometry args={[W, botH, FRONT_T]} />
      </mesh>
      {/* Top strip — reveal on -Y */}
      <mesh position={[0, yBot + winH + topH / 2, 0]} material={topMats} castShadow receiveShadow>
        <boxGeometry args={[W, topH, FRONT_T]} />
      </mesh>
      {/* Left strip — reveal on +X */}
      <mesh position={[-(winW / 2 + sideW / 2), winCY, 0]} material={leftMats} castShadow receiveShadow>
        <boxGeometry args={[sideW, winH, FRONT_T]} />
      </mesh>
      {/* Right strip — reveal on -X */}
      <mesh position={[+(winW / 2 + sideW / 2), winCY, 0]} material={rightMats} castShadow receiveShadow>
        <boxGeometry args={[sideW, winH, FRONT_T]} />
      </mesh>
      {/* Penanten between windows */}
      {penants}
    </group>
  )
}

/** Smoothly interpolate color toward target each frame */
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
  W, H, frameColor, sashColor, panelCount = 2, hideInnerSash = false, insectScreenEnabled = false, ventGrillEnabled = false,
}: { W: number; H: number; frameColor: string; sashColor: string; panelCount?: number; hideInnerSash?: boolean; insectScreenEnabled?: boolean; ventGrillEnabled?: boolean }) {
  // Animate colors smoothly
  const animatedFrameColor = useAnimatedColor(frameColor, 0.25)
  const animatedSashColor = useAnimatedColor(sashColor, 0.25)

  // ── Dimensions (all in scene units, already mm→m via caller) ──────────────
  const OUTER_T   = mm(90)              // outer frame thickness (90 mm)
  const OUTER_D   = mm(80)              // outer frame depth (protrudes from wall)
  const LIP_T     = mm(10)              // inner raised lip thickness
  const LIP_D     = mm(14)             // lip extrusion depth (creates shadow line)
  const MULLION_W = mm(40)              // vertical mullion between panels
  const TRANSOM_H = mm(30)             // horizontal transom bar height
  const TRANSOM_RATIO = 0.35           // transom at 35% from top

  const innerW    = W - OUTER_T * 2
  const innerH    = H - OUTER_T * 2

  // Per-panel widths with mullions between
  const totalMullionW = MULLION_W * (panelCount - 1)
  const paneW = (innerW - totalMullionW) / panelCount

  // X centres of each panel
  const panelCXs: number[] = []
  for (let i = 0; i < panelCount; i++) {
    panelCXs.push(-innerW / 2 + paneW / 2 + i * (paneW + MULLION_W))
  }

  const zFront    = FRONT_T / 2 + 0.001

  // Create material refs that persist across renders
  // Outside materials (colored) - front face
  const frameOuterMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.08, envMapIntensity: 0.8, color: frameColor }))
  const lipOuterMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: frameColor }))
  const sashOuterMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: sashColor }))
  // Inside materials (always white) - back face
  const frameInnerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.08, envMapIntensity: 0.8, color: '#FFFFFF' }))
  const lipInnerMatRef   = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#FFFFFF' }))
  const sashInnerMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#FFFFFF' }))
  const fixedSashMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0.1, envMapIntensity: 0.9, color: '#F5F0EB' }))

  // Animate colors smoothly toward target
  useFrame(() => {
    frameOuterMatRef.current.color.lerp(animatedFrameColor, 0.12)
    lipOuterMatRef.current.color.lerp(animatedFrameColor, 0.12)
    sashOuterMatRef.current.color.lerp(animatedSashColor, 0.12)
    // Inner mats stay white — no update needed
  })

  // Material arrays for boxes: [right, left, top, bottom, front, back]
  // Sides use outer color, front uses outer color, back uses inner (white)
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
      {/* ── Outer frame — 4 border planks (thick, full depth) ── */}
      {/* Top */}
      <mesh position={[0,  innerH / 2 + OUTER_T / 2, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[W, OUTER_T, OUTER_D]} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -innerH / 2 - OUTER_T / 2, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[W, OUTER_T, OUTER_D]} />
      </mesh>
      {/* Left */}
      <mesh position={[-innerW / 2 - OUTER_T / 2, 0, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[OUTER_T, H, OUTER_D]} />
      </mesh>
      {/* Right */}
      <mesh position={[ innerW / 2 + OUTER_T / 2, 0, 0]} castShadow receiveShadow material={frameMats}>
        <boxGeometry args={[OUTER_T, H, OUTER_D]} />
      </mesh>

      {/* ── Inner raised lip — creates stepped shadow line ── */}
      {/* Top lip */}
      <mesh position={[0,  innerH / 2 - LIP_T / 2, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[innerW, LIP_T, OUTER_D + LIP_D]} />
      </mesh>
      {/* Bottom lip */}
      <mesh position={[0, -innerH / 2 + LIP_T / 2, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[innerW, LIP_T, OUTER_D + LIP_D]} />
      </mesh>
      {/* Left lip */}
      <mesh position={[-innerW / 2 + LIP_T / 2, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[LIP_T, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
      </mesh>
      {/* Right lip */}
      <mesh position={[ innerW / 2 - LIP_T / 2, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
        <boxGeometry args={[LIP_T, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
      </mesh>

      {/* ── Vertical mullions between panels ── */}
      {Array.from({ length: panelCount - 1 }, (_, i) => {
        const mx = -innerW / 2 + paneW + MULLION_W / 2 + i * (paneW + MULLION_W)
        return (
          <mesh key={`mul-${i}`} position={[mx, 0, LIP_D / 2]} castShadow receiveShadow material={lipMats}>
            <boxGeometry args={[MULLION_W, innerH - LIP_T * 2, OUTER_D + LIP_D]} />
          </mesh>
        )
      })}

      {/* ── Per-panel: inner sash frame + glass pane ── */}
      {panelCXs.map((cx, i) => {
        const openW  = paneW + LIP_T * 1.5      // extend over lip edges to fill corners
        const openH  = innerH + LIP_T * 1.5     // extend over lip edges top/bottom
        const SASH_T = mm(72)                    // sash bar thickness
        const SASH_D = mm(60)                    // sash bar depth
        const sashZ  = LIP_D * 0.7              // sits clearly in front of glass
        const isFirst = i === 0
        const isLast = i === panelCount - 1
        const isEven = i % 2 === 0
        const showSash = !hideInnerSash && (
          panelCount === 1 ||
          (panelCount === 2 && isFirst) ||
          (panelCount === 3 && (isFirst || isLast)) ||
          (panelCount === 4 && (isFirst || isLast)) ||
          (panelCount >= 5 && isEven)  // alternating: 0,2,4... for 5+
        )
        const glassW = showSash ? openW - SASH_T * 2 : openW
        const glassH = showSash ? openH - SASH_T * 2 : openH
        // sashMats array is used directly on mesh
        return (
          <group key={`panel-${i}`} position={[cx, 0, 0]}>
            {/* Inner sash — top */}
            {showSash && (
              <mesh position={[0, openH / 2 - SASH_T / 2, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[openW, SASH_T, SASH_D]} />
              </mesh>
            )}
            {/* Inner sash — bottom */}
            {showSash && (
              <mesh position={[0, -(openH / 2 - SASH_T / 2), sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[openW, SASH_T, SASH_D]} />
              </mesh>
            )}
            {/* Inner sash — left */}
            {showSash && (
              <mesh position={[-(openW / 2 - SASH_T / 2), 0, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[SASH_T, openH, SASH_D]} />
              </mesh>
            )}
            {/* Inner sash — right */}
            {showSash && (
              <mesh position={[openW / 2 - SASH_T / 2, 0, sashZ]} castShadow receiveShadow material={sashMats}>
                <boxGeometry args={[SASH_T, openH, SASH_D]} />
              </mesh>
            )}
            {/* Glass pane - black tinted when insect screen enabled, but ONLY on the
                tilt window (draaikiepraam) — the panel that has the sash. The normal
                window (no sash) stays clear. */}
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
            {/* Ventilation grille for panels without sash - only when enabled */}
            {ventGrillEnabled && !showSash && (
              <group position={[0, openH / 2 - mm(40), mm(15)]}>
                {/* Rotated box */}
                <mesh position={[0, 0, mm(20)]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow material={lipMats}>
                  <boxGeometry args={[openW - mm(20), mm(60), mm(30)]} />
                </mesh>
                {/* Grille housing */}
                <mesh castShadow receiveShadow material={lipMats}>
                  <boxGeometry args={[openW, mm(80), mm(25)]} />
                </mesh>
                {/* Horizontal slats */}
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

export function FlatRoof({ W, H, depth, color, isKader = false }: { W: number; H: number; depth: number; color: string; isKader?: boolean }) {
  const targetColorRef = useRef(new THREE.Color(color))
  // Front face material (colored) — only the visible front strip changes color
  const frontMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.08, envMapIntensity: 0.5, color }))
  // Top/sides material — RAL 9010 Wit
  const topSideMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, color: '#F7F9EF' }))
  // Inner material (white) for bottom face only
  const innerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.08, envMapIntensity: 0.5, color: '#FFFFFF' }))
  useEffect(() => { targetColorRef.current.set(color) }, [color])
  useFrame(() => { frontMatRef.current.color.lerp(targetColorRef.current, 0.25) })
  // Top/sides and inner stay fixed — no animation needed


  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const soffitMat = useMemo(() => {
    const { u, v } = woodRepeatFromSize(W, depth)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm, THREE.FrontSide)
  }, [woodCol, woodRgh, woodNrm, W, depth])

  // Kader: wider slab to match wider front wall and side extensions
  const totalW   = isKader ? W + SIDE_W * 2 + mm(295) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
  const slabLen  = depth + ROOF_OVERHANG
  const slabCtrZ = (ROOF_OVERHANG - depth) / 2

  return (
    <group position={[0, H, 0]}>
      {/* Slab box — only front face colored, top/sides grey, bottom white */}
      <mesh position={[0, ROOF_SLAB_T / 2, slabCtrZ]} castShadow material={[
        topSideMatRef.current, // 0: right face (grey)
        topSideMatRef.current, // 1: left face (grey)
        topSideMatRef.current, // 2: top face (grey)
        innerMatRef.current,   // 3: bottom face (white)
        frontMatRef.current,   // 4: front face (colored)
        topSideMatRef.current, // 5: back face (grey)
      ]}>
        <boxGeometry args={[totalW, ROOF_SLAB_T, slabLen]} />
      </mesh>
      {/* Soffit — restricted to window width only, not side cheeks/overhangs */}
      <mesh position={[0, -mm(2), -depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, depth]} />
        <primitive object={soffitMat} />
      </mesh>

      {/* Decorative soffit beams — evenly spaced within window width only */}
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

/** Generate roller shutter slat texture */
function createShutterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Background - dark gray base
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, 512, 512)

  // Horizontal slat lines - fewer = much thicker visible slats
  const slatCount = 4
  const gap = 4  // Gap between slats
  const slatHeight = (512 - (gap * slatCount)) / slatCount

  for (let i = 0; i < slatCount; i++) {
    const y = i * (slatHeight + gap)

    // Stronger gradient for more visible 3D effect
    const gradient = ctx.createLinearGradient(0, y, 0, y + slatHeight)
    gradient.addColorStop(0, '#6a6a6a')  // Lighter top
    gradient.addColorStop(0.2, '#4a4a4a')
    gradient.addColorStop(0.5, '#3a3a3a')  // Middle
    gradient.addColorStop(0.8, '#2a2a2a')
    gradient.addColorStop(1, '#0a0a0a')  // Darker bottom

    ctx.fillStyle = gradient
    ctx.fillRect(0, y, 512, slatHeight)

    // Strong highlight at top
    ctx.strokeStyle = '#8a8a8a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()

    // Dark shadow gap line at bottom
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
  texture.repeat.set(2.5, 2.5)  // Single texture instance, larger slats
  return texture
}

/** Roller shutter with side guide rails - covers window and animates down from top */
function RollerShutter({ W, winH, roofH, color, guideColor, openPercent }: { W: number; winH: number; roofH: number; color: string; guideColor: string; openPercent: number }) {
  const animatedColor = useAnimatedColor(color, 0.08)
  // Guides/housing keep their own colour (independent of the chosen shutter colour).
  // Darken slightly so the frame stays visible against a light window frame.
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
    // console.log(`Roller shutter active — window width: ${W.toFixed(2)} m`)
  }, [W])

  useEffect(() => {
    setTargetOpen(openPercent)
    setIsClosed(openPercent >= 90)
  }, [openPercent])

  useFrame((_, delta) => {
    // Only the shutter curtain (slats) takes the chosen shutter color.
    // The guides/housing/frame keep their own colour so the border doesn't change.
    matRef.current.color.lerp(animatedColor, 0.1)
    guideMatRef.current.color.lerp(animatedGuideColor, 0.1)
    const targetScale = targetOpen / 100
    setScale(prev => prev + (targetScale - prev) * Math.min(delta * 8, 1))

    // Adjust texture repeat to maintain consistent slat density as shutter grows/shrinks
    if (matRef.current.map) {
      // Even smaller slats: 10 repeats at full, 3 at 1/3
      const repeatY = Math.max(scale * 10, 3)
      matRef.current.map.repeat.set(1, repeatY)
    }
  })

  const zPos = FRONT_T / 2 + mm(60)  // in front of window frame

  // shutterOpen 0 = fully retracted (scale 0), 100 = fully down (scale 1)
  // Real roller shutter: curtain extends from housing at top
  const shutterH = winH * scale
  const curtainY = winH - shutterH / 2  // Curtain hangs from housing, extends downward

  const GUIDE_W = mm(45)
  const guideX = (W + mm(10)) / 2 + GUIDE_W / 2

  const TOP_FRAME_H = mm(20)  // Header to fill gap
  const HOUSING_D   = mm(60)   // Housing depth
  const HOUSING_H = Math.max(roofH - winH - TOP_FRAME_H, mm(60))  // fills from window top to roof

  return (
    <group>
      {/* Top header/frame - fills gap between housing and window */}
      <mesh position={[0, winH + TOP_FRAME_H / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[W + mm(10) + GUIDE_W * 2, TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      {/* Roller housing/cassette at top (above window) */}
      <mesh position={[0, winH + HOUSING_H / 2 + TOP_FRAME_H, zPos]} castShadow receiveShadow>
        <boxGeometry args={[W + mm(10) + GUIDE_W * 2, HOUSING_H, HOUSING_D]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      {/* Shutter curtain - extends down from housing as it unrolls */}
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

      {/* Left guide rail - extends through header to fill corner gap */}
      <mesh position={[-guideX, (winH + TOP_FRAME_H) / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[GUIDE_W, winH + TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>

      {/* Right guide rail - extends through header to fill corner gap */}
      <mesh position={[guideX, (winH + TOP_FRAME_H) / 2, zPos]} castShadow receiveShadow>
        <boxGeometry args={[GUIDE_W, winH + TOP_FRAME_H, mm(35)]} />
        <primitive object={guideMatRef.current} />
      </mesh>
    </group>
  )
}

/** Reusable box with animated color transition */
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

/** Fascia board on top of flat slab — only front face follows color, rest stays grey */
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
        greyMatRef.current,  // 0: right face
        greyMatRef.current,  // 1: left face
        greyMatRef.current,  // 2: top face
        greyMatRef.current,  // 3: bottom face
        frontMatRef.current, // 4: front face (colored)
        greyMatRef.current,  // 5: back face
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
    // Kader style always has flat surface - no horizontal lines
    if (isKader || claddingMaterial !== 'rondkantpanelen') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#c8c8c8'
      ctx.fillRect(0, 0, 256, 256)
      for (let y = 0; y <= 256; y += 64) {
        ctx.strokeStyle = 'rgba(30,30,30,0.5)'
        ctx.lineWidth = 5
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 2)
    return tex
  }, [claddingMaterial, isKader])

  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  const innerWoodMat = useMemo(() => {
    const slopeLen = Math.hypot(H, depth)
    const { u, v } = woodRepeatFromSize(SIDE_W, slopeLen)
    return createWoodMaterial(u, v, woodCol, woodRgh, woodNrm)
  }, [woodCol, woodRgh, woodNrm, H, depth])

  const bodyMatRef  = useRef(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.04, side: THREE.DoubleSide }))
  const outerMatRef = useRef(new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.04, side: THREE.DoubleSide }))

  useFrame(() => {
    const next = linesTex ?? null
    // Body faces — cladding color + lines
    bodyMatRef.current.color.lerp(animatedColor, 0.25)
    if (bodyMatRef.current.map !== next) { bodyMatRef.current.map = next; bodyMatRef.current.needsUpdate = true }
    // Outer cap (group 2 = right cap) — same as body
    outerMatRef.current.color.lerp(animatedColor, 0.25)
    if (outerMatRef.current.map !== next) { outerMatRef.current.map = next; outerMatRef.current.needsUpdate = true }
  })

  // group 0 = body, group 1 = left cap (inner) → wood, group 2 = right cap (outer) → cladding
  const mats = [bodyMatRef.current, innerWoodMat, outerMatRef.current]

  return (
    <group scale={[flipX, 1, 1]}>
      <mesh geometry={geom} material={mats} castShadow />
    </group>
  )
}

// ─── Roof surface (tilted dark tile plane behind/around dormer) ──────────────
export function RoofSurface({ W, H, depth, pitchDeg, sideExt, isKader, roofTileColor }: { W: number; H: number; depth: number; pitchDeg: number; sideExt?: number; isKader?: boolean; roofTileColor?: string }) {
  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  // Kader: extend roof further forward so full color applies to wider front
  const FORWARD     = isKader ? mm(900) : mm(700)
  const BACK        = depth + mm(300)
  // Kader: wider hole to match the wider front wall, hide tiles on sides
  const holeHW      = isKader ? (W + SIDE_W * 2 + mm(280)) / 2 : (W + SIDE_W * 2) / 2   // dormer half-width
  const _sideExt    = sideExt ?? holeHW       // fixed side extension (defaults to single-copy)
  const ROOF_W      = holeHW * 2 + _sideExt * 2
  const hw          = ROOF_W / 2
  const HOLE_Z_FRONT = ROOF_OVERHANG           // mm(220) — front of slab
  const HOLE_Z_BACK  = -depth                  // back of dormer

  // Clipping planes — cut tiles at all 4 edges of the roof plane
  const clipPlanes = useMemo(() => [
    new THREE.Plane(new THREE.Vector3(1,  0,  0),  hw),        // right edge
    new THREE.Plane(new THREE.Vector3(-1, 0,  0),  hw),        // left edge
    new THREE.Plane(new THREE.Vector3(0,  0, -1),  FORWARD),   // front edge
    new THREE.Plane(new THREE.Vector3(0,  0,  1),  BACK),      // back edge
  ], [hw, FORWARD, BACK])

  // NOTE: Staggered tiles removed - slope plane is now a single full plane
  // const tiles = useMemo(() => { ... }, [pitchRad, FORWARD, BACK, hw, holeHW, HOLE_Z_FRONT, HOLE_Z_BACK])

  const tileCol = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Color.png')
  const tileRgh = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Roughness.jpg.jpeg')
  const tileNrm = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_NormalGL.jpg (1).jpeg')
  const tileAO  = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_AmbientOcclusion.jpg.jpeg')
  const tileDsp = useTexture('/images/rooftile/RoofingTiles006_2K-JPG_Displacement.jpg.jpeg')

  // Wood texture for back panel
  const woodCol = useTexture('/images/window_wood/COL.jpg')
  const woodRgh = useTexture('/images/window_wood/ROUGH.jpg')
  const woodNrm = useTexture('/images/window_wood/NORMLG.jpg')

  // Calculate texture repeat based on plane dimensions (200mm tiles = more/smaller tiles)
  const uRepeat = (hw * 2) / mm(1200)
  const vRepeat = (FORWARD + BACK) / mm(1200)

  const tileMat = useMemo(() => {
    const repeat = (t: THREE.Texture, uRep: number, vRep: number) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(uRep, vRep)
      t.needsUpdate = true
      return t
    }
    const isRed = !!roofTileColor && roofTileColor.toLowerCase() !== '#ffffff'
    const mat = new THREE.MeshStandardMaterial({
      map:              repeat(tileCol.clone(), uRepeat, vRepeat),
      roughnessMap:     repeat(tileRgh.clone(), uRepeat, vRepeat),
      normalMap:        repeat(tileNrm.clone(), uRepeat, vRepeat),
      normalScale:      new THREE.Vector2(2, 2),
      aoMap:            repeat(tileAO.clone(), uRepeat, vRepeat),
      displacementMap:  repeat(tileDsp.clone(), uRepeat, vRepeat),
      displacementScale: 0.05,
      roughness:    0.7,
      metalness:    0.4,
      side:         THREE.FrontSide,
      // Tint the tile texture: red for "Rood", neutral for "Antraciet"
      color: new THREE.Color(roofTileColor || '#ffffff'),
    })
    // For the red roof, the base tile texture is very dark, so multiply-tint alone
    // stays muddy. Add an emissive glow (which ADDS light) to lift it into a bright terracotta.
    if (isRed) {
      mat.emissive = new THREE.Color('#D06A2E')
      mat.emissiveIntensity = 0.46
    }
    return mat
  }, [tileCol, tileRgh, tileNrm, tileAO, tileDsp, uRepeat, vRepeat, roofTileColor])

  const tileMatDouble = useMemo(() => {
    const m = tileMat.clone()
    m.side = THREE.DoubleSide
    return m
  }, [tileMat])

  // Single plane with hole where dormer is located
  const fullPlane = useMemo(() => {
    const tan = Math.tan(pitchRad)
    const DROP = mm(5)
    const segs = 64
    const xStep = (hw * 2) / segs
    const zStep = (FORWARD + BACK) / segs

    // Hole bounds (dormer area - no plane here)
    const holeXMin = -holeHW
    const holeXMax = holeHW
    const holeZMin = HOLE_Z_BACK
    const holeZMax = 0  // Front wall position, not overhang

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
        // Calculate world positions for this cell
        const x = -hw + col * xStep
        const z = FORWARD - row * zStep
        const nextX = x + xStep
        const nextZ = z - zStep

        // Skip triangles that fall inside the hole (dormer area)
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

  // Create 4 strips around dormer (left, right, front, back) - window area stays visible
  const backPanels = useMemo(() => {
    const tan = Math.tan(pitchRad)
    const lift = mm(40)  // distance behind slope
    const thick = mm(50)

    // Same hole bounds as roof plane
    const holeXMin = -holeHW
    const holeXMax = holeHW
    const holeZFront = 0
    const holeZBack = HOLE_Z_BACK

    // Calculate Y position at given Z (behind slope)
    const getY = (z: number) => -z * tan - lift

    // Convert Z span to diagonal length for rotated box
    const getLength = (z1: number, z2: number) => Math.abs(z2 - z1) / Math.cos(pitchRad)

    // Center Z for positioning
    const getCenterZ = (z1: number, z2: number) => (z1 + z2) / 2

    // Average Y for a Z range
    const getCenterY = (z1: number, z2: number) => (getY(z1) + getY(z2)) / 2

    const panels = [
      // Left strip (outside dormer width)
      {
        pos: [-(holeHW + (hw - holeHW) / 2), getCenterY(FORWARD, -BACK), (FORWARD - BACK) / 2] as [number, number, number],
        size: [(hw - holeHW), thick, getLength(FORWARD, -BACK)] as [number, number, number],
      },
      // Right strip (outside dormer width)
      {
        pos: [(holeHW + (hw - holeHW) / 2), getCenterY(FORWARD, -BACK), (FORWARD - BACK) / 2] as [number, number, number],
        size: [(hw - holeHW), thick, getLength(FORWARD, -BACK)] as [number, number, number],
      },
      // Front strip (between dormer front and roof front) - only if space exists
      ...(FORWARD > holeZFront + mm(50) ? [{
        pos: [0, getCenterY(holeZFront, FORWARD), getCenterZ(holeZFront, FORWARD)] as [number, number, number],
        size: [holeHW * 2, thick, getLength(holeZFront, FORWARD)] as [number, number, number],
      }] : []),
      // Back strip (between dormer back and roof back)
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
      {/* Full slope plane */}
      <mesh geometry={fullPlane} material={tileMat} castShadow receiveShadow />

      {/* Back panels - strips around dormer so window stays visible */}
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

      {/* Vent pipe cylinder at left corner of front overhang — hide for kader style */}
      {!isKader && (() => {
        // Position at left side edge of the front overhang (where red mark is)
        const slabTopY = H + ROOF_SLAB_T
        const slabHalfLen = (depth + ROOF_OVERHANG) / 2
        const slabCtrZ = (ROOF_OVERHANG - depth) / 2
        const overhangFrontZ = slabCtrZ + slabHalfLen
        // Left edge X: total width includes cheeks and side overhang
        // Kader: use wider front wall width
        const totalHalfW = isKader ? (W + SIDE_W * 2 + mm(280)) / 2 : (W + (SIDE_W + ROOF_SIDE_OVH) * 2) / 2
        const pipeX = -totalHalfW + mm(40) // near left edge, inset slightly
        const overhangBackZ = slabCtrZ - slabHalfLen // back edge of slab
        const pipeZ = overhangBackZ + mm(500) // more forward from back corner
        const pipeHeight = mm(250)
        const pipeRadius = mm(35) // wider pipe
        const extraDown = mm(50) // extra downward offset

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

// ─── Pipe panel GLB at front of roof slope ──────────────────────────────────
export function PipePanel({ pitchRad, W, clipHW, isKader = false }: { pitchRad: number; W: number; clipHW: number; isKader?: boolean }) {
  const { scene } = useGLTF('/models/pipepanel.glb')
  const cloned = useMemo(() => scene.clone(), [scene])
  // Kader: extend further forward to match roof surface
  const FORWARD = isKader ? mm(1050) : mm(850)
  const ATTACH_Z = isKader ? mm(900) : mm(700)    // tile front-edge Z — Y calculated here, not at pipe centre
  const totalW  = isKader ? W + SIDE_W * 2 + mm(300) : W + (SIDE_W + ROOF_SIDE_OVH) * 2   // dormer width + fixed overhangs
  const planeBottomY = -ATTACH_Z * Math.tan(pitchRad)

  const clipPlanes = useMemo(() => [
    new THREE.Plane(new THREE.Vector3( 1, 0, 0),  clipHW),   // x >= -clipHW
    new THREE.Plane(new THREE.Vector3(-1, 0, 0),  clipHW),   // x <=  clipHW
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


// ─── Full-plane back cover (same vertex layout as RoofSurface base plane) ────
function SlopeBackPanel({ W, depth, pitchRad, sideExt }: { W: number; depth: number; pitchRad: number; sideExt?: number }) {
  const FORWARD      = mm(700)
  const BACK         = depth + mm(300)
  const holeHW       = (W + SIDE_W * 2) / 2      // dormer half-width
  const _sideExt     = sideExt ?? holeHW
  const hw           = holeHW + _sideExt          // = ROOF_W / 2
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

    const makeQuadLifted = (x1: number, x2: number, z1: number, z2: number, liftY: number) => {
      const yL = (z: number) => -z * tan + liftY
      const verts = new Float32Array([
        x1, yL(z1), z1,  x2, yL(z1), z1,  x1, yL(z2), z2,
        x2, yL(z1), z1,  x2, yL(z2), z2,  x1, yL(z2), z2,
      ])
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      g.computeVertexNormals()
      return g
    }

    return [
      makeQuad(-hw,     -holeHW,    FORWARD,     -BACK),                      // left strip
      makeQuad(+holeHW, +hw,        FORWARD,     -BACK),                      // right strip
      makeQuad(-holeHW, +holeHW,    FORWARD,     HOLE_Z_FRONT),               // centre-front
      makeQuad(-holeHW, +holeHW,    HOLE_Z_BACK, -BACK),                      // centre-back
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

// ─── Main component ─────────────────────────────────────────────────────────
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
  } = config

  const pitchRad = Math.max((pitchDeg * Math.PI) / 180, 0.01)

  const panelCount  = Math.max(1, windowCopies ?? 1)

  // Per-window widths and spacings (penanten)
  const rawWidths   = config.windowWidths?.length === panelCount
    ? config.windowWidths
    : Array.from({ length: panelCount }, () => windowWidth)
  const rawSpacings = config.spacings ?? [200, 200, 200, 200]

  const W_single    = mm(windowWidth)                  // reference single-copy width (for sideExt)
  const subWinWs    = rawWidths.map(w => mm(w) - mm(40))   // per-window opening width
  const penantWs    = Array.from({ length: panelCount - 1 }, (_, i) => mm(rawSpacings[i] ?? 200))

  // Window widths (direct from config - no animation to keep sync with wall)
  const winW  = subWinWs.reduce((s, w) => s + w, 0) + penantWs.reduce((s, p) => s + p, 0)
  const W     = rawWidths.reduce((s, w) => s + mm(w), 0) + penantWs.reduce((s, p) => s + p, 0)

  // X centre of each window opening relative to dormer centre
  const panelXs: number[] = []
  let cursor = -winW / 2
  for (let i = 0; i < panelCount; i++) {
    panelXs.push(cursor + subWinWs[i] / 2)
    cursor += subWinWs[i] + (penantWs[i] ?? 0)
  }

  const H         = mm(windowHeight)                   // front wall height
  const cheekH    = H + ROOF_SLAB_T + mm(10)           // cheek height covers full slab + margin
  const depth     = cheekH / Math.tan(pitchRad)        // depth so cheek slope = roof pitch exactly

  const winYBottom  = mm(40) + mm(lintelLevel)         // bottom of window opening
  const winH        = H - winYBottom - mm(40)          // window opening height

  const halfW = W / 2

  // Roof tile color: "rood" tints the tile texture red, "antraciet" keeps it neutral (dark)
  const roofTileTint = config.roofTileColor === 'antraciet' ? '#ffffff' : '#EC8A4A'

  return (
    <group position={[0, -H / 2, 0]}>
      {/* ── Roof surface (rendered first, behind everything) ── */}
      <RoofSurface W={W} H={H} depth={depth} pitchDeg={pitchDeg} sideExt={(W_single + SIDE_W * 2) / 2} isKader={styleType === 'kader'} roofTileColor={roofTileTint} />

      {/* ── Pipe panel at front of slope ── */}
      <PipePanel pitchRad={pitchRad} W={W} clipHW={styleType === 'kader' ? (W + SIDE_W * 2 + mm(280)) / 2 + (W_single + SIDE_W * 2) / 2 : (W + SIDE_W * 2) / 2 + (W_single + SIDE_W * 2) / 2} isKader={styleType === 'kader'} />

      {/* ── Front wall ── */}
      <FrontWall
        W={styleType === 'kader' ? W + SIDE_W * 2 + mm(280) : W + SIDE_W * 2 - mm(4)} H={H} color={frontColor}
        winW={winW} winH={winH} winYBottom={winYBottom}
        subWinWs={subWinWs} penantWs={penantWs}
      />

      {/* ── Window frames + glass + roller shutters (one per paneell) ── */}
      <group position={[0, winYBottom, 0]}>
        {panelXs.map((xOff, i) => {
          const copyPanelCount = rawWidths[i] > 4100 ? 5 : rawWidths[i] > 3450 ? 4 : rawWidths[i] > 2100 ? 3 : rawWidths[i] <= 1100 ? 1 : 2
          const wWidth = subWinWs[i]
          return (
            <group key={i} position={[xOff, 0, 0]}>
              <WindowFrame
                W={wWidth}
                H={winH}
                frameColor={frameColor}
                sashColor={sashColor}
                panelCount={copyPanelCount}
                hideInnerSash={false}
                insectScreenEnabled={insectScreenEnabled}
                ventGrillEnabled={config.ventGrillEnabled}
              />
              {/* Roller shutter with animated scale from top */}
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
            </group>
          )
        })}
      </group>

      {/* ── Flat roof slab — kader: clamped to side walls, traditional: full overhang ── */}
      <FlatRoof W={W} H={H} depth={depth} color={fasciaColor} isKader={styleType === 'kader'} />

      {/* ── Box on top of flat slab — fascia board (animated color) ── */}
      <FasciaBoard
        W={W}
        H={H}
        depth={depth}
        color={fasciaColor}
        isKader={styleType === 'kader'}
      />

      {/* ── Black plane on top of roof slab ── */}
      {(() => {
        // Calculate slab dimensions (same as FlatRoof)
        const isKaderStyle = styleType === 'kader'
        const totalW = isKaderStyle ? W + SIDE_W * 2 + mm(295) : W + (SIDE_W + ROOF_SIDE_OVH) * 2
        const slabLen = depth + ROOF_OVERHANG
        const slabCtrZ = (ROOF_OVERHANG - depth) / 2
        // Position at top of slab - H is the base, ROOF_SLAB_T is slab thickness
        const slabTopY = H + ROOF_SLAB_T + mm(50)
        return (
          <mesh position={[0, slabTopY, slabCtrZ]} castShadow receiveShadow>
            <boxGeometry args={[totalW - mm(150), mm(20), slabLen - mm(150)]} />
            <meshStandardMaterial color="#3f3f3f" roughness={0.9} metalness={0.0} />
          </mesh>
        )
      })()}

      {/* ── Right side cheek ── */}
      <group position={[halfW + (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="right" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} />
        {/* Kader: extend side wall forward to match slab overhang — inset slightly to avoid Z-fighting */}
        {styleType === 'kader' && (
          <AnimatedBox
            position={[SIDE_W / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[SIDE_W + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
      </group>

      {/* ── Left side cheek — group at -halfW so scale-flip puts it at -(halfW+SIDE_W) ── */}
      <group position={[-halfW - (styleType === 'kader' ? mm(150) : 0), 0, styleType === 'kader' ? -mm(10) : 0]}>
        <SideCheek H={cheekH} depth={depth} color={frontColor} side="left" claddingMaterial={claddingMaterial} isKader={styleType === 'kader'} />
        {/* Kader: extend side wall forward to match slab overhang — inset slightly to avoid Z-fighting */}
        {styleType === 'kader' && (
          <AnimatedBox
            position={[-SIDE_W / 2, (H + ROOF_SLAB_T) / 2, (ROOF_OVERHANG + mm(2)) / 2]}
            size={[SIDE_W + mm(2), H + ROOF_SLAB_T + mm(2), ROOF_OVERHANG + mm(4)]}
            color={frontColor}
            roughness={0.35} metalness={0.05}
          />
        )}
      </group>
    </group>
  )
}