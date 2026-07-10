import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { WindowConfig } from "./types";
import { buildRoofPlaneGeometry } from "./roofGeometry";
import { computePitchClipPlane } from "./clipPlane";

export function RoofModel({ config }: { config: WindowConfig }) {
  const { fasciaColor } = config;
  const roofPlane = useMemo(() => buildRoofPlaneGeometry(config), [config]);

  const tileTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base color (Anthracite / Charcoal matching high-fi models)
      ctx.fillStyle = '#262626';
      ctx.fillRect(0, 0, 128, 128);

      // Tile highlights/shadows
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 2;
      for (let y = 0; y <= 128; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(32, y - 10, 96, y + 10, 128, y);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(0, y + 2);
        ctx.bezierCurveTo(32, y - 8, 96, y + 12, 128, y + 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 18);
    return tex;
  }, []);

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const roofMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: tileTexture,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.FrontSide, // Only render top side — no black underside when viewed from below
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [tileTexture, clipPlane]);

  useEffect(() => {
    return () => {
      roofPlane?.geometry.dispose();
    };
  }, [roofPlane]);

  if (!roofPlane) return null;

  return (
    <mesh
      geometry={roofPlane.geometry}
      material={roofMat}
      position={roofPlane.position}
      rotation={roofPlane.rotation}
    />
  );
}
