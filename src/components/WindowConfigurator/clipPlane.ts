import * as THREE from "three";
import { WindowConfig, FRONT_WALL_THICKNESS } from "./types";
import { computeWallLayout } from "./pitchGeometry";

const mm = (v: number) => v / 1000;

/**
 * Computes the pitch clipping plane in world space.
 * Everything on the NEGATIVE side of this plane (below the roof) is discarded.
 * Everything on the POSITIVE side (above the roof / exterior) is kept.
 */
export function computePitchClipPlane(config: WindowConfig): THREE.Plane | null {
  if (!config.roofEnabled) return null;

  const layout = computeWallLayout(config);
  const pitchRad = (config.pitchDeg * Math.PI) / 180;

  // Normal perpendicular to the pitched roof surface, pointing "outward" (exterior/sky side)
  const normal = new THREE.Vector3(0, Math.cos(pitchRad), Math.sin(pitchRad));

  // Anchor point: top-front edge of the front wall (hinge point of the roof)
  const anchorZ = layout.frontFaceZ + FRONT_WALL_THICKNESS;
  const point = new THREE.Vector3(0, mm(layout.hingeY), mm(anchorZ));

  // Offset 50mm along A→B direction (inward, opposite to outward normal)
  const PLANE_OFFSET = 50; // mm
  point.add(normal.clone().multiplyScalar(-mm(PLANE_OFFSET)));

  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, point);
}

/**
 * Applies the pitch clipping plane to a material.
 * Mutates the material in place and returns it.
 */
export function applyClipPlane(material: THREE.Material, clipPlane: THREE.Plane | null): THREE.Material {
  if (clipPlane) {
    material.clippingPlanes = [clipPlane];
  } else {
    material.clippingPlanes = [];
  }
  return material;
}