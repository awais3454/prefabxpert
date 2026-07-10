import * as THREE from 'three'
import { useRef, useLayoutEffect, useMemo, forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { WindowConfig, StyleType, FRONT_WALL_THICKNESS } from './types'
import { processWindowModel } from './utils/modelProcessor'
import { computeWallLayout } from './pitchGeometry'

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh | THREE.Object3D>
  materials: Record<string, THREE.MeshStandardMaterial>
}

export const modelStore = {
  frameColor: '#ffffff',
  styleType: 'traditional' as StyleType,
}

export function useModelSync(config: WindowConfig) {
  useLayoutEffect(() => {
    modelStore.frameColor = config.frameColor || '#ffffff';
    modelStore.styleType = config.styleType || 'traditional';
  }, [config.frameColor, config.styleType]);
}

/**
 * Compute the world-space offset for the dormer based on normalized (0–1) coordinates
 * on the roof plane. 0.5/0.5 = centered (default).
 */
function computeRoofPlaneOffset(config: WindowConfig): [number, number, number] {
  const offsetX = config.dormerOffsetX ?? 0.5;
  const offsetY = config.dormerOffsetY ?? 0.5;

  // Roof plane dimensions from wall layout
  const layout = computeWallLayout(config);
  const pitchRad = (config.pitchDeg * Math.PI) / 180;
  const cosPitch = Math.max(Math.cos(pitchRad), 1e-6);
  const sinPitch = Math.sin(pitchRad);

  // Total roof width with generous margin
  const mm = (v: number) => v / 1000;
  const roofMargin = mm(config.roofOffset ?? 2000);
  const bodyHalfWidth = mm(layout.totalWallWidth) / 2;
  const roofHalfWidth = bodyHalfWidth + roofMargin;

  // Total slope length of roof
  const totalDepth = mm(FRONT_WALL_THICKNESS + layout.backExtrusionDepth);
  const slopeLength = totalDepth / cosPitch + roofMargin * 2;

  // Map normalized coords to local offsets relative to center
  const localX = (offsetX - 0.5) * roofHalfWidth * 2;
  // offsetY: 0 = bottom of slope (eave), 1 = top of slope (ridge)
  const localSlope = (offsetY - 0.5) * slopeLength;

  // Project slope offset back to world Y and Z
  const worldY = localSlope * sinPitch;
  const worldZ = -localSlope * cosPitch;

  return [localX, worldY, worldZ];
}

type RealModelProps = JSX.IntrinsicElements['group'] & {
  styleType?: StyleType;
  frameColor?: string;
  config?: WindowConfig;
}

export const RealModel = forwardRef<THREE.Group, RealModelProps>(function RealModel({ styleType = 'traditional', frameColor = '#ffffff', config, ...props }, forwardedRef) {
  const internalRef = useRef<THREE.Group>(null)
  const groupRef = forwardedRef || internalRef
  const windowModel = useGLTF('/models/window.glb') as GLTFResult

  const isKader = styleType === 'kader'
  const activeGLTF = windowModel

  const {
    windowHeight = 1200,
    windowWidth = 1200,
    lintelLevel = 0,
    pitchDeg = 35,
  } = config || {}

  const BASE_HEIGHT = 1200
  const BASE_WIDTH = 1200

  const scaleY = windowHeight / BASE_HEIGHT
  const windowScaleX = windowWidth / BASE_WIDTH

  // Sill height in meters for the mesh and clipping plane
  const sillHeightInMeters = lintelLevel / 1000;

  const sillClipPlane = useMemo(() => {
    if (lintelLevel <= 0) return null;
    return new THREE.Plane(new THREE.Vector3(0, 1, 0), -sillHeightInMeters);
  }, [sillHeightInMeters]);

  const processedScene = useMemo(() => {
    if (!activeGLTF || !activeGLTF.scene) return null;

    const scene = activeGLTF.scene.clone();
    return processWindowModel(
      scene,
      config,
      activeGLTF,
      frameColor,
      windowScaleX,
      sillClipPlane
    );
  }, [activeGLTF, frameColor, sillClipPlane, windowScaleX, config?.sashColor, config?.ventGrillEnabled, config?.shutterEnabled, config?.insectScreenEnabled, config?.styleType, config?.pitchDeg]);

  const sectionWidth = 4.0 * windowScaleX;

  // Compute roof-relative offset from normalized coordinates
  const [offX, offY, offZ] = useMemo(() => {
    if (!config) return [0, 0, 0] as [number, number, number];
    return computeRoofPlaneOffset(config);
  }, [config?.dormerOffsetX, config?.dormerOffsetY, config?.pitchDeg, config?.roofOffset, config?.windowWidth, config?.windowCopies, config?.windowHeight, config?.wallSideOffset]);

  return (
    <group
      {...props}
      ref={groupRef}
      dispose={null}
    >
      <group position={[offX, offY, offZ]}>
        <primitive
          key={`${styleType}-main`}
          object={processedScene}
          position={[0, 0, 0]}
          scale-y={scaleY}
        />

        {/* Sill grows UP from y=0 */}
        {sillHeightInMeters > 0 && (
          <mesh position={[0, sillHeightInMeters / 2, 0]}>
            <boxGeometry args={[sectionWidth, sillHeightInMeters, 0.15]} />
            <meshStandardMaterial color={config?.frontColor || frameColor} />
          </mesh>
        )}
      </group>
    </group>
  );
});

useGLTF.preload('/models/window.glb')
