import { useMemo } from "react";
import * as THREE from "three";
import { WindowConfig, FRAME_CONSTANTS, computeEffectiveHeight } from "./types";
import { computePitchClipPlane } from "./clipPlane";

const mm = (v: number) => v / 1000;

interface SingleInsectScreenProps {
  windowWidth: number;
  effectiveHeight: number;
  config: WindowConfig;
  positionX: number;
  sillY: number;
  material: THREE.Material;
}

function SingleInsectScreen({ windowWidth, effectiveHeight, config, positionX, sillY, material }: SingleInsectScreenProps) {
  const { outerFrameThickness } = FRAME_CONSTANTS;
  const { insectScreenOffset, insectScreenDepth } = config;

  const screenW = mm(windowWidth - outerFrameThickness * 2);
  const screenH = mm(effectiveHeight - outerFrameThickness * 2);
  const sd = mm(insectScreenDepth);

  const cx = mm(positionX);
  const cy = mm(sillY + effectiveHeight / 2);
  const wallDepthHalf = mm(200) / 2;
  const zPos = wallDepthHalf + mm(insectScreenOffset);

  return (
    <mesh position={[cx, cy, zPos]} material={material}>
      <boxGeometry args={[screenW, screenH, sd]} />
    </mesh>
  );
}

export function InsectScreenRow({ config }: { config: WindowConfig }) {
  const { windowWidth, windowCopies, spacings, wallSideOffset, lintelLevel, insectScreenEnabled } = config;
  const effectiveHeight = computeEffectiveHeight(config);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const screenMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#444444"), // Keeping the mesh dark
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: config.insectScreenOpacity,
      side: THREE.DoubleSide,
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, config.insectScreenOpacity]);

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

  if (!insectScreenEnabled) return null;

  const sillY = lintelLevel;

  return (
    <group>
      {positions.map((px, i) => (
        <SingleInsectScreen
          key={`screen-${i}`}
          windowWidth={windowWidth}
          effectiveHeight={effectiveHeight}
          config={config}
          positionX={px}
          sillY={sillY}
          material={screenMat}
        />
      ))}
    </group>
  );
}
