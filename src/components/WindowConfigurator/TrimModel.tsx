import { useMemo } from "react";
import * as THREE from "three";
import { WindowConfig, FRAME_CONSTANTS, computeEffectiveHeight } from "./types";
import { computePitchClipPlane } from "./clipPlane";

const mm = (v: number) => v / 1000;

interface TrimBoxProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  material: THREE.Material;
}

function TrimBox({ width, height, depth, position, material }: TrimBoxProps) {
  return (
    <mesh position={position} material={material}>
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  );
}

interface SingleTrimProps {
  windowWidth: number;
  effectiveHeight: number;
  trimThickness: number;
  trimDepth: number;
  trimOffset: number;
  positionX: number;
  sillY: number;
  wallBoxDepth: number;
  material: THREE.Material;
}

function SingleTrim({
  windowWidth,
  effectiveHeight,
  trimThickness,
  trimDepth,
  trimOffset,
  positionX,
  sillY,
  wallBoxDepth,
  material,
}: SingleTrimProps) {
  const trimOuterW = windowWidth + 2 * (trimOffset + trimThickness);
  const trimOuterH = effectiveHeight + 2 * (trimOffset + trimThickness);

  const cx = mm(positionX);
  const cy = mm(sillY + effectiveHeight / 2);
  const td = mm(trimDepth);
  const tt = mm(trimThickness);
  const tow = mm(trimOuterW);
  const toh = mm(trimOuterH);
  const wallDepthHalf = mm(wallBoxDepth) / 2;
  const zPos = wallDepthHalf + td / 2;

  const innerH = toh - 2 * tt;

  return (
    <group position={[cx, cy, zPos]}>
      <TrimBox width={tow} height={tt} depth={td} position={[0, toh / 2 - tt / 2, 0]} material={material} />
      <TrimBox width={tow} height={tt} depth={td} position={[0, -toh / 2 + tt / 2, 0]} material={material} />
      <TrimBox width={tt} height={innerH} depth={td} position={[-tow / 2 + tt / 2, 0, 0]} material={material} />
      <TrimBox width={tt} height={innerH} depth={td} position={[tow / 2 - tt / 2, 0, 0]} material={material} />
    </group>
  );
}

export function TrimRow({ config }: { config: WindowConfig }) {
  const {
    windowWidth,
    windowCopies,
    spacings,
    wallSideOffset,
    lintelLevel,
    trimThickness,
    trimDepth,
    trimOffset,
    trimEnabled,
  } = config;
  const effectiveHeight = computeEffectiveHeight(config);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const trimMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.frameColor),
      roughness: 0.4,
      metalness: 0.1,
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

  if (!trimEnabled) return null;

  const sillY = lintelLevel;

  return (
    <group>
      {positions.map((px, i) => (
        <SingleTrim
          key={`trim-${i}`}
          windowWidth={windowWidth}
          effectiveHeight={effectiveHeight}
          trimThickness={trimThickness}
          trimDepth={trimDepth}
          trimOffset={trimOffset}
          positionX={px}
          sillY={sillY}
          wallBoxDepth={200}
          material={trimMat}
        />
      ))}
    </group>
  );
}
