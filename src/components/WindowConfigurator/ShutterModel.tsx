import { useMemo } from "react";
import * as THREE from "three";
import { WindowConfig, FRAME_CONSTANTS, computeEffectiveHeight } from "./types";
import { computePitchClipPlane } from "./clipPlane";

const mm = (v: number) => v / 1000;

interface SingleShutterProps {
  windowWidth: number;
  effectiveHeight: number;
  config: WindowConfig;
  positionX: number;
  sillY: number;
  shutterMat: THREE.Material;
  guideMat: THREE.Material;
  boxMat: THREE.Material;
}

function SingleShutter({ windowWidth, effectiveHeight, config, positionX, sillY, shutterMat, guideMat, boxMat }: SingleShutterProps) {
  const {
    shutterOpen, slatHeight, slatDepth, guideWidth, boxHeight, shutterOffset,
    trimEnabled,
  } = config;

  const shutterWidth = windowWidth;
  const wallDepthHalf = mm(200) / 2;

  const trimFrontZ = trimEnabled
    ? wallDepthHalf + mm(config.trimDepth)
    : wallDepthHalf;
  const baseZ = trimFrontZ + mm(shutterOffset);

  const windowTopY = mm(sillY + effectiveHeight);
  const boxCenterY = windowTopY + mm(boxHeight) / 2;

  const maxDropHeight = effectiveHeight;
  const dropHeight = (shutterOpen / 100) * maxDropHeight;

  const cx = mm(positionX);

  const slats = useMemo(() => {
    if (dropHeight <= 0) return [];
    const gap = 1;
    const slatStep = slatHeight + gap;
    const count = Math.floor(dropHeight / slatStep);
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      const y = windowTopY - mm(slatStep * i + slatHeight / 2);
      result.push(y);
    }
    return result;
  }, [dropHeight, slatHeight, windowTopY]);

  const sw = mm(shutterWidth - 2 * guideWidth);
  const sh = mm(slatHeight);
  const sd = mm(slatDepth);
  const gw = mm(guideWidth);
  const fullW = mm(shutterWidth);
  const bh = mm(boxHeight);
  const guideH = mm(effectiveHeight);

  return (
    <group position={[cx, 0, baseZ]}>
      <mesh position={[0, boxCenterY, sd / 2]} material={boxMat}>
        <boxGeometry args={[fullW, bh, sd * 1.5]} />
      </mesh>
      <mesh position={[-fullW / 2 + gw / 2, windowTopY - guideH / 2, sd / 2]} material={guideMat}>
        <boxGeometry args={[gw, guideH, sd]} />
      </mesh>
      <mesh position={[fullW / 2 - gw / 2, windowTopY - guideH / 2, sd / 2]} material={guideMat}>
        <boxGeometry args={[gw, guideH, sd]} />
      </mesh>
      {slats.map((y, i) => (
        <mesh key={`slat-${i}`} position={[0, y, sd / 2]} material={shutterMat}>
          <boxGeometry args={[sw, sh, sd]} />
        </mesh>
      ))}
    </group>
  );
}

export function ShutterRow({ config }: { config: WindowConfig }) {
  const {
    windowWidth, windowCopies, spacings, wallSideOffset, lintelLevel, shutterEnabled, frontColor
  } = config;
  const effectiveHeight = computeEffectiveHeight(config);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const shutterMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frontColor).multiplyScalar(0.9),
      roughness: 0.4,
      metalness: 0.2
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, frontColor]);

  const guideMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frontColor),
      roughness: 0.3,
      metalness: 0.3
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, frontColor]);

  const boxMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frontColor),
      roughness: 0.3,
      metalness: 0.3
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, frontColor]);

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

  if (!shutterEnabled) return null;

  const sillY = lintelLevel;

  return (
    <group>
      {positions.map((px, i) => (
        <SingleShutter
          key={`shutter-${i}`}
          windowWidth={windowWidth}
          effectiveHeight={effectiveHeight}
          config={config}
          positionX={px}
          sillY={sillY}
          shutterMat={shutterMat}
          guideMat={guideMat}
          boxMat={boxMat}
        />
      ))}
    </group>
  );
}
