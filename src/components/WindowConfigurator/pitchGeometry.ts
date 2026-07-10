import { WindowConfig, computeEffectiveHeight, FRONT_WALL_THICKNESS } from "./types";

export interface WallLayout {
  totalWallWidth: number;
  totalWallHeight: number;
  wallBottomY: number;
  windowPositions: number[];
  holeTop: number;
  holeBottom: number;
  frontFaceZ: number;
  backFaceZ: number;
  frontTopYWorld: number;
  backTopYWorld: number;
  cutBackYWorld: number;
  slopeEnabled: boolean;
  hingeY: number;
  backExtrusionDepth: number;
}

export function computeWallLayout(config: WindowConfig): WallLayout {
  const { windowWidth, windowCopies, spacings, wallSideOffset } = config;
  const wallThickness = FRONT_WALL_THICKNESS;
  const effectiveHeight = computeEffectiveHeight(config);

  const slopeEnabled = config.roofEnabled;
  const backExtrusionDepth = slopeEnabled ? 4500 : 0;

  // FIX: Safely grab spacings or default to 100mm to prevent NaN crashes
  const safeSpacings = spacings || [];
  const getSpacing = (index: number) => safeSpacings[index] !== undefined ? safeSpacings[index] : 100;

  let totalSpacing = 0;
  for (let i = 0; i < windowCopies - 1; i++) {
    totalSpacing += getSpacing(i);
  }

  const totalContentWidth = (windowCopies * windowWidth) + totalSpacing;
  const totalWallWidth = (wallSideOffset * 2) + totalContentWidth;
  const totalWallHeight = wallSideOffset + config.windowHeight + wallSideOffset;
  const wallBottomY = -wallSideOffset;

  const startX = wallSideOffset;
  const windowPositions: number[] = [];
  let x = startX;

  // FIX: Safely calculate positions without throwing NaN
  for (let i = 0; i < windowCopies; i++) {
    windowPositions.push(x);
    if (i < windowCopies - 1) {
      x += windowWidth + getSpacing(i);
    }
  }

  const holeTop = wallSideOffset + config.windowHeight;
  const holeBottom = holeTop - effectiveHeight;

  const frontFaceZ = -(wallThickness / 2);
  const backFaceZ = slopeEnabled && backExtrusionDepth > 0 ? frontFaceZ - backExtrusionDepth : frontFaceZ;

  const frontTopYWorld = wallBottomY + totalWallHeight;
  const hingeY = wallBottomY;

  const pitchRad = (config.pitchDeg * Math.PI) / 180;
  const anchorZ = frontFaceZ + wallThickness;
  const totalDepthFromAnchor = backExtrusionDepth + wallThickness;
  const rise = slopeEnabled ? Math.tan(pitchRad) * totalDepthFromAnchor : 0;
  const backTopYWorld = slopeEnabled ? hingeY + rise : frontTopYWorld;
  const cutBackYWorld = slopeEnabled
    ? Math.min(frontTopYWorld, backTopYWorld)
    : frontTopYWorld;

  return {
    totalWallWidth,
    totalWallHeight,
    wallBottomY,
    windowPositions,
    holeTop,
    holeBottom,
    frontFaceZ,
    backFaceZ,
    frontTopYWorld,
    backTopYWorld,
    cutBackYWorld,
    slopeEnabled,
    hingeY,
    backExtrusionDepth,
  };
}