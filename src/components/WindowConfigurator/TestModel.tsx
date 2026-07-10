import * as THREE from 'three'
import React, { useEffect, useRef, useMemo } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { GLTF } from 'three-stdlib'
import { WindowConfig } from './types'
import { ProceduralDormer } from './DormerGeometry'

type GLTFResult = GLTF & {
  nodes: {
    Geom3D_3: THREE.Mesh
    Geom3D_4: THREE.Mesh
    Geom3D_5: THREE.Mesh
    Geom3D_6: THREE.Mesh
    Geom3D_7: THREE.Mesh
    Geom3D_8: THREE.Mesh
    Geom3D_9: THREE.Mesh
    Geom3D_10: THREE.Mesh
    Geom3D_11: THREE.Mesh
    Geom3D_12: THREE.Mesh
    Geom3D_13: THREE.Mesh
    Geom3D_14: THREE.Mesh
    Geom3D_15: THREE.Mesh
  }
  materials: {
    H01_Misty_Ice: THREE.MeshStandardMaterial
    E05_Leaf_Glow: THREE.MeshStandardMaterial
    K02_Rosy_Glow: THREE.MeshStandardMaterial
    L07_Raspberry_Rush: THREE.MeshStandardMaterial
    E08_Lime_Depth: THREE.MeshStandardMaterial
    J03_Orchid_Glow: THREE.MeshStandardMaterial
    J02_Lavender_Veil: THREE.MeshStandardMaterial
    L02_Bubblegum_Pop: THREE.MeshStandardMaterial
    E04_Green_Bloom: THREE.MeshStandardMaterial
    ['[Translucent Glass Gray]']: THREE.MeshStandardMaterial
    Glass_Basic_01: THREE.MeshStandardMaterial
  }
  animations: THREE.AnimationClip[]
}

export function KaderModel({ config, ...props }: { config: WindowConfig } & JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/kader.glb') as GLTFResult
  const rotationGroup = useRef<THREE.Group>(null)
  const targetRotation = useRef(0)

  // Base dimensions of the GLTF model (mm)
  const BASE_WIDTH = 2400
  const BASE_HEIGHT = 1200

  const effectiveHeight = Math.max(300, config.windowHeight - config.lintelLevel)
  const scaleW = config.windowWidth / BASE_WIDTH
  const scaleH = effectiveHeight / BASE_HEIGHT

  // Sync colors & scale with config
  useEffect(() => {
    // Frame / outer frame
    if (materials.L07_Raspberry_Rush) materials.L07_Raspberry_Rush.color.set(config.frameColor)
    if (materials.K02_Rosy_Glow) materials.K02_Rosy_Glow.color.set(config.frameColor)
    // Sash
    if (materials.L02_Bubblegum_Pop) materials.L02_Bubblegum_Pop.color.set(config.sashColor)
    if (materials.E04_Green_Bloom) materials.E04_Green_Bloom.color.set(config.sashColor)
    if (materials.J03_Orchid_Glow) materials.J03_Orchid_Glow.color.set(config.sashColor)
    if (materials.J02_Lavender_Veil) materials.J02_Lavender_Veil.color.set(config.sashColor)
    // Side cheeks / cladding
    if (materials.E05_Leaf_Glow) materials.E05_Leaf_Glow.color.set(config.sideColor)
    if (materials.H01_Misty_Ice) materials.H01_Misty_Ice.color.set(config.sideColor)
    // Fascia / front header board
    if (materials.E08_Lime_Depth) materials.E08_Lime_Depth.color.set(config.fasciaColor)
  }, [materials, config.frameColor, config.sashColor, config.sideColor, config.fasciaColor])

  useFrame((state, delta) => {
    // Smoothly interpolate rotation (pitch)
    const pitchRad = ((45 - config.pitchDeg) * Math.PI) / 180
    targetRotation.current = THREE.MathUtils.lerp(targetRotation.current, pitchRad, delta * 6)
    if (rotationGroup.current) {
      rotationGroup.current.rotation.x = targetRotation.current
    }
  })

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Center top>
          <group scale={[0.001 * scaleW, 0.001 * scaleH, 0.001]} ref={rotationGroup}>
            <group position={[-2366.008, 428, 774.063]} scale={25.4}>
              <mesh geometry={nodes.Geom3D_10.geometry} material={materials.L02_Bubblegum_Pop} />
              <mesh geometry={nodes.Geom3D_11.geometry} material={materials.E04_Green_Bloom} />
            </group>
            <group position={[-601.763, 856.549, 938.677]} scale={25.4}>
              <mesh geometry={nodes.Geom3D_14.geometry} material={materials['[Translucent Glass Gray]']} />
              <mesh geometry={nodes.Geom3D_15.geometry} material={materials.Glass_Basic_01} />
            </group>
            <mesh geometry={nodes.Geom3D_3.geometry} material={materials.H01_Misty_Ice} position={[-2945.235, 0, 261.806]} scale={25.4} />
            <mesh geometry={nodes.Geom3D_4.geometry} material={materials.E05_Leaf_Glow} position={[-2483.855, 438, 746.054]} scale={25.4} />
            <mesh geometry={nodes.Geom3D_5.geometry} material={materials.K02_Rosy_Glow} position={[-2514.812, 348, 2433.574]} scale={25.4} />
            <mesh geometry={nodes.Geom3D_6.geometry} material={materials.L07_Raspberry_Rush} position={[-2691.54, 347, 2609.644]} scale={25.4} />
            <mesh geometry={nodes.Geom3D_7.geometry} material={materials.E08_Lime_Depth} position={[-645.686, 1325, 954.927]} rotation={[-Math.PI, 0, Math.PI / 2]} scale={-25.4} />
            <mesh geometry={nodes.Geom3D_8.geometry} material={materials.J03_Orchid_Glow} position={[-646.186, 2878.451, 1002.476]} rotation={[0, 0, -Math.PI / 2]} scale={[25.4, 66.548, 25.4]} />
            <mesh geometry={nodes.Geom3D_9.geometry} material={materials.J02_Lavender_Veil} position={[-646.186, 1371.549, 1002.476]} rotation={[0, 0, -Math.PI / 2]} scale={[-25.4, 66.548, 25.4]} />
            <mesh geometry={nodes.Geom3D_12.geometry} material={materials.E08_Lime_Depth} position={[-707.686, 2100, 877.476]} scale={25.4} />
            <mesh geometry={nodes.Geom3D_13.geometry} material={materials.E08_Lime_Depth} position={[-708.686, 744, 829.927]} scale={25.4} />
          </group>
        </Center>
      </group>
    </group>
  )
}

// ─── Traditional model (window1.glb) ─────────────────────────────────────────
export function TraditionalModel({ config, ...props }: { config: WindowConfig } & JSX.IntrinsicElements['group']) {
  const gltf = useGLTF('/models/window1.glb') as GLTF
  const curPitch = useRef(0)
  const initialRotationY = useRef<number | null>(null)
  const initialScaleX = useRef<number | null>(null)
  const curScale = useRef(1)

  // Clone scene once so we don't mutate the cached original
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  // Find Geom3D.025 — try multiple name variants since exporters differ on dot vs underscore
  const cheekMesh = useMemo(() => {
    const candidates = ['Geom3D.025', 'Geom3D_025', 'Geom3D025']
    let found: THREE.Object3D | null = null
    for (const name of candidates) {
      const obj = scene.getObjectByName(name)
      if (obj) { found = obj; break }
    }
    // Fallback: scan all objects for name containing '025'
    if (!found) {
      scene.traverse((obj) => {
        if (!found && obj.name.includes('025')) found = obj
      })
    }
    if (found) {
      initialRotationY.current = found.rotation.y
    }
    return found
  }, [scene])


  // Find Geom3D_Defintion12_Geom3D — the filler mesh that must scale to cover gaps
  const fillerMesh = useMemo(() => {
    let found: THREE.Object3D | null = null
    // Broad scan — match anything containing 'Defintion12' OR 'Definition12' OR 'Defin'
    scene.traverse((obj) => {
      if (!found && (
        obj.name.includes('Defintion12') ||
        obj.name.includes('Definition12') ||
        obj.name === 'Geom3D_Defintion12_Geom3D'
      )) found = obj
    })
    if (found) {
      initialScaleX.current = found.scale.x
      curScale.current = found.scale.x
    }
    return found
  }, [scene])

  // Traverse and apply colors whenever config colors change
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return
        const name = mat.name.toLowerCase()
        if (name.includes('glass') || name.includes('translucent')) return
        if (name.includes('fascia') || name.includes('lime') || name.includes('front')) {
          mat.color.set(config.fasciaColor); return
        }
        if (name.includes('side') || name.includes('cheek') || name.includes('ice') || name.includes('leaf') || name.includes('wall')) {
          mat.color.set(config.sideColor); return
        }
        if (name.includes('sash') || name.includes('bubblegum') || name.includes('orchid') || name.includes('lavender') || name.includes('green_bloom')) {
          mat.color.set(config.sashColor); return
        }
        mat.color.set(config.frameColor)
      })
    })
  }, [scene, config.frameColor, config.sashColor, config.sideColor, config.fasciaColor])

  // Initialise curPitch to match the baked rotation once mesh is found
  useEffect(() => {
    if (initialRotationY.current !== null) {
      curPitch.current = initialRotationY.current
    }
  }, [cheekMesh])

  // Animate Geom3D.025 rotation + Geom3D_Defintion12_Geom3D scale to close gaps
  useFrame((_, delta) => {
    const DESIGN_PITCH = 45
    const deltaRad = ((config.pitchDeg - DESIGN_PITCH) * Math.PI) / 180

    // ── Cheek panel rotation (Y axis) ──────────────────────────────────
    if (cheekMesh && initialRotationY.current !== null) {
      const targetY = initialRotationY.current + deltaRad
      curPitch.current = THREE.MathUtils.lerp(curPitch.current, targetY, delta * 5)
      cheekMesh.rotation.y = curPitch.current
    }

    // ── Filler mesh scale to fill gap caused by rotation ───────────────
    if (fillerMesh && initialScaleX.current !== null) {
      const compensation = Math.abs(deltaRad) < 0.001 ? 1 : 1 / Math.cos(deltaRad)
      const targetScale = initialScaleX.current * compensation
      curScale.current = THREE.MathUtils.lerp(curScale.current, targetScale, delta * 5)
      // Scale all axes — remove axes that look wrong after testing
      fillerMesh.scale.x = curScale.current
      fillerMesh.scale.y = curScale.current
      fillerMesh.scale.z = curScale.current
    }
  })

  return (
    <group {...props} dispose={null}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/models/window1.glb')

// ─── Unified component — always uses ProceduralDormer (kader style adjusts slab width) ──
export function DormerScene({ config, ...props }: { config: WindowConfig } & JSX.IntrinsicElements['group']) {
  return (
    <group {...props}>
      <ProceduralDormer config={config} />
    </group>
  )
}
