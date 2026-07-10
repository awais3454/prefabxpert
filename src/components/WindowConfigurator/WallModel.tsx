import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { WindowConfig, FRONT_WALL_THICKNESS } from "./types";
import { computeWallLayout } from "./pitchGeometry";
import { computePitchClipPlane } from "./clipPlane";

const mm = (v: number) => v / 1000;

function buildWallShape(totalWallWidth: number, totalWallHeight: number, windowPositions: number[], windowWidth: number, holeBottom: number, holeTop: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(mm(totalWallWidth), 0);
  shape.lineTo(mm(totalWallWidth), mm(totalWallHeight));
  shape.lineTo(0, mm(totalWallHeight));
  shape.closePath();

  for (const wx of windowPositions) {
    const holePath = new THREE.Path();
    holePath.moveTo(mm(wx), mm(holeBottom));
    holePath.lineTo(mm(wx + windowWidth), mm(holeBottom));
    holePath.lineTo(mm(wx + windowWidth), mm(holeTop));
    holePath.lineTo(mm(wx), mm(holeTop));
    holePath.closePath();
    shape.holes.push(holePath);
  }

  return shape;
}

function buildCladdingTexture(color: string, materialType: 'rondkantpanelen' | 'hpl', isKader: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    // Kader style always has flat surface - no horizontal lines
    if (!isKader && materialType === 'rondkantpanelen') {
      for (let y = 0; y <= 256; y += 32) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.moveTo(0, y + 2); ctx.lineTo(256, y + 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      }
    } else if (!isKader) {
      // HPL material for traditional style
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, 256, 256);
      ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(128, 256); ctx.stroke();
    }
    // Kader style: no additional texture lines - flat surface
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  return tex;
}

function useWallMaterials(color: string, materialType: 'rondkantpanelen' | 'hpl', isKader: boolean = false, clippingPlanes?: THREE.Plane[]) {
  const woodCol  = useTexture('/images/window_wood/COL.jpg');
  const woodRgh  = useTexture('/images/window_wood/ROUGH.jpg');
  const woodNrm  = useTexture('/images/window_wood/NORMLG.jpg');

  return useMemo(() => {
    const faceTex = buildCladdingTexture(color, materialType, isKader);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex, roughness: 0.7, metalness: 0.02,
      side: THREE.DoubleSide, clippingPlanes,
    });

    const wc = woodCol.clone(); wc.wrapS = wc.wrapT = THREE.RepeatWrapping; wc.repeat.set(1, 1); wc.needsUpdate = true;
    const wr = woodRgh.clone(); wr.wrapS = wr.wrapT = THREE.RepeatWrapping; wr.repeat.set(1, 1); wr.needsUpdate = true;
    const wn = woodNrm.clone(); wn.wrapS = wn.wrapT = THREE.RepeatWrapping; wn.repeat.set(1, 1); wn.needsUpdate = true;
    const revealMat = new THREE.MeshStandardMaterial({
      map: wc, roughnessMap: wr, normalMap: wn,
      roughness: 0.8, metalness: 0.0,
      side: THREE.DoubleSide, clippingPlanes,
    });

    return [faceMat, revealMat] as THREE.Material[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, materialType, isKader, woodCol, woodRgh, woodNrm, clippingPlanes]);
}

function FrontWall({ config }: { config: WindowConfig }) {
  const { windowWidth, frontColor, claddingMaterial, styleType } = config;
  const isKader = styleType === 'kader';
  const wallThickness = FRONT_WALL_THICKNESS;

  const { geometry } = useMemo(() => {
    const { totalWallWidth, totalWallHeight, wallBottomY, windowPositions, holeTop, holeBottom } = computeWallLayout(config);
    const shape = buildWallShape(totalWallWidth, totalWallHeight, windowPositions, windowWidth, holeBottom, holeTop);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: mm(wallThickness),
      bevelEnabled: false,
    });

    geo.translate(-mm(totalWallWidth) / 2, mm(wallBottomY), -mm(wallThickness) / 2);

    return { geometry: geo };
  }, [config, windowWidth]);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const materials = useWallMaterials(frontColor, claddingMaterial, isKader, clipPlane ? [clipPlane] : undefined);

  return <mesh geometry={geometry} material={materials} />;
}

function BackExtrusion({ config }: { config: WindowConfig }) {
  const { windowWidth, sideColor, claddingMaterial, styleType } = config;
  const isKader = styleType === 'kader';

  const { geometry } = useMemo(() => {
    const layout = computeWallLayout(config);
    const {
      totalWallWidth,
      totalWallHeight,
      wallBottomY,
      windowPositions,
      holeTop,
      holeBottom,
      frontFaceZ,
      backExtrusionDepth,
    } = layout;

    if (backExtrusionDepth <= 0) return { geometry: null };

    // "Infinite" Height: We make the side walls 20m tall so they always hit the roof even at 75 deg
    const INFINITE_HEIGHT = 20000; // 20 meters
    const shape = buildWallShape(totalWallWidth, INFINITE_HEIGHT, windowPositions, windowWidth, holeBottom, holeTop);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: mm(backExtrusionDepth),
      bevelEnabled: false,
    });

    // We shift it DOWN so it plunges through the house roof
    geo.translate(-mm(totalWallWidth) / 2, mm(wallBottomY) - mm(INFINITE_HEIGHT - totalWallHeight), mm(frontFaceZ) - mm(backExtrusionDepth));

    return { geometry: geo };
  }, [config, windowWidth]);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  if (!geometry) return null;
  const materials = useWallMaterials(sideColor, claddingMaterial, isKader, clipPlane ? [clipPlane] : undefined);

  return <mesh geometry={geometry} material={materials} />;
}

export function WallModel({ config }: { config: WindowConfig }) {
  const layout = computeWallLayout(config);
  return (
    <group name="WallSystem">
      <FrontWall config={config} />
      {layout.slopeEnabled && layout.backExtrusionDepth > 0 && <BackExtrusion config={config} />}
    </group>
  );
}


