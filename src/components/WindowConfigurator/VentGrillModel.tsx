import { useMemo } from "react";
import * as THREE from "three";
import { WindowConfig, computeEffectiveHeight } from "./types";
import { computePitchClipPlane } from "./clipPlane";

const mm = (v: number) => v / 1000;

interface SingleVentGrillProps {
  windowWidth: number;
  effectiveHeight: number;
  config: WindowConfig;
  positionX: number;
  sillY: number;
  grillMat: THREE.Material;
  louverMat: THREE.Material;
}

function SingleVentGrill({ windowWidth, effectiveHeight, config, positionX, sillY, grillMat, louverMat }: SingleVentGrillProps) {
  const { ventGrillHeight, ventGrillDepth, ventGrillOffsetFromTop, ventGrillInset } = config;

  const grillW = mm(windowWidth - 2 * ventGrillInset);
  const grillH = mm(ventGrillHeight);
  const grillD = mm(ventGrillDepth);

  const cx = mm(positionX);
  const windowTopY = mm(sillY + effectiveHeight);
  const grillCenterY = windowTopY - mm(ventGrillOffsetFromTop) - grillH / 2;

  const wallDepthHalf = mm(200) / 2;
  const zPos = wallDepthHalf + grillD / 2;

  const louvers = useMemo(() => {
    const louverH = 4;
    const gap = 6;
    const step = louverH + gap;
    const count = Math.floor(ventGrillHeight / step);
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      const y = grillH / 2 - mm(step * i + louverH / 2 + gap / 2);
      result.push(y);
    }
    return result;
  }, [ventGrillHeight, grillH]);

  return (
    <group position={[cx, grillCenterY, zPos]}>
      <mesh material={grillMat}>
        <boxGeometry args={[grillW, grillH, grillD]} />
      </mesh>
      {louvers.map((y, i) => (
        <mesh key={`louver-${i}`} position={[0, y, grillD / 2 + 0.001]} material={louverMat}>
          <boxGeometry args={[grillW * 0.92, mm(3), mm(2)]} />
        </mesh>
      ))}
    </group>
  );
}

export function VentGrillRow({ config }: { config: WindowConfig }) {
  const { windowWidth, windowCopies, spacings, wallSideOffset, lintelLevel, ventGrillEnabled } = config;
  const effectiveHeight = computeEffectiveHeight(config);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const grillMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.frameColor),
      roughness: 0.2,
      metalness: 0.3
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, config.frameColor]);

  const louverMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.frameColor).multiplyScalar(0.8),
      roughness: 0.4,
      metalness: 0.2
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, config.frameColor]);

  const positions = useMemo(() => {
    const totalContentWidth =
      windowCopies * windowWidth +
      spacings.slice(0, windowCopies - 1).reduce((a, b) => a + b, 0);
    const totalWallWidth = wallSideOffset * 2 + totalContentWidth;
    const startX = -totalWallWidth / 2 + wallSideOffset + windowWidth / 2;

    const pos: number[] = [];
    let x = startX;
    for (let i = 0; i < windowCopies; i++) {
      pos.push(x);
      if (i < windowCopies - 1) {
        x += windowWidth / 2 + spacings[i] + windowWidth / 2;
      }
    }
    return pos;
  }, [windowWidth, windowCopies, spacings, wallSideOffset]);

  if (!ventGrillEnabled) return null;

  const sillY = lintelLevel;

  return (
    <group>
      {positions.map((px, i) => (
        <SingleVentGrill
          key={`vent-${i}`}
          windowWidth={windowWidth}
          effectiveHeight={effectiveHeight}
          config={config}
          positionX={px}
          sillY={sillY}
          grillMat={grillMat}
          louverMat={louverMat}
        />
      ))}
    </group>
  );
}
