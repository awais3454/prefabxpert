import * as THREE from "three";
import { WindowConfig, FRONT_WALL_THICKNESS, BACK_WALL_THICKNESS } from "./types";
import { computeWallLayout } from "./pitchGeometry";

const mm = (value: number) => value / 1000;
const OPENING_CLEARANCE = 20;
const EPSILON = 1e-6;

export interface RoofPlaneBounds {
  left: number;
  right: number;
  front: number;
  back: number;
}

export interface RoofPlaneProfile {
  outer: RoofPlaneBounds;
  opening: RoofPlaneBounds;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

function appendRectangle(shape: THREE.Shape | THREE.Path, bounds: RoofPlaneBounds, reverse = false) {
  if (reverse) {
    shape.moveTo(bounds.left, bounds.front);
    shape.lineTo(bounds.left, bounds.back);
    shape.lineTo(bounds.right, bounds.back);
    shape.lineTo(bounds.right, bounds.front);
    shape.closePath();
    return;
  }

  shape.moveTo(bounds.left, bounds.front);
  shape.lineTo(bounds.right, bounds.front);
  shape.lineTo(bounds.right, bounds.back);
  shape.lineTo(bounds.left, bounds.back);
  shape.closePath();
}

function remapShapeGeometryToPlane(geometry: THREE.ShapeGeometry) {
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setXYZ(i, x, 0, y);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function hasValidOpening(outer: RoofPlaneBounds, opening: RoofPlaneBounds) {
  return (
    opening.right - opening.left > EPSILON &&
    opening.front - opening.back > EPSILON &&
    opening.left > outer.left + EPSILON &&
    opening.right < outer.right - EPSILON &&
    opening.front < outer.front - EPSILON &&
    opening.back > outer.back + EPSILON
  );
}

export function computeRoofPlaneProfile(config: WindowConfig): RoofPlaneProfile | null {
  if (!config.roofEnabled) return null;

  const layout = computeWallLayout(config);
  const pitchRad = (config.pitchDeg * Math.PI) / 180;
  const cosPitch = Math.max(Math.cos(pitchRad), EPSILON);
  const bodyHalfWidth = mm(layout.totalWallWidth) / 2;
  const totalBodyDepth = mm(FRONT_WALL_THICKNESS + layout.backExtrusionDepth);

  // Safe fallback if roofOffset is undefined
  const planeMargin = config.roofOffset !== undefined ? mm(config.roofOffset) : mm(2000);
  const openingClearance = mm(OPENING_CLEARANCE);

  const firstWindowLeft = mm(layout.windowPositions[0]) - bodyHalfWidth;
  const lastWindowRight = mm(
    layout.windowPositions[config.windowCopies - 1] + config.windowWidth,
  ) - bodyHalfWidth;

  const outer: RoofPlaneBounds = {
    left: -bodyHalfWidth - planeMargin,
    right: bodyHalfWidth + planeMargin,
    front: planeMargin,
    back: -(totalBodyDepth / cosPitch) - planeMargin,
  };

  // Account for 50mm plane offset along normal when projecting world edges to plane-local
  const OFFSET_MM = 50;
  const tanPitch = Math.sin(pitchRad) / cosPitch;
  const offsetCorrection = mm(OFFSET_MM) * tanPitch;

  const opening: RoofPlaneBounds = {
    left: firstWindowLeft - openingClearance,
    right: lastWindowRight + openingClearance,
    front: -(mm(FRONT_WALL_THICKNESS) / cosPitch) + offsetCorrection,
    back: -(mm(FRONT_WALL_THICKNESS + layout.backExtrusionDepth - BACK_WALL_THICKNESS) / cosPitch) + offsetCorrection,
  };

  const anchorZ = layout.frontFaceZ + FRONT_WALL_THICKNESS;

  // Offset 50mm along A→B direction (inward, opposite to outward normal)
  const PLANE_OFFSET = 50; // mm
  const normal = new THREE.Vector3(0, Math.cos(pitchRad), Math.sin(pitchRad));
  const position = new THREE.Vector3(0, mm(layout.hingeY), mm(anchorZ));
  position.add(normal.clone().multiplyScalar(-mm(PLANE_OFFSET)));

  return {
    outer,
    opening,
    position,
    rotation: new THREE.Euler(pitchRad, 0, 0),
  };
}

export function buildRoofPlaneGeometry(config: WindowConfig) {
  const profile = computeRoofPlaneProfile(config);
  if (!profile) return null;

  const shape = new THREE.Shape();
  appendRectangle(shape, profile.outer);

  if (hasValidOpening(profile.outer, profile.opening)) {
    const hole = new THREE.Path();
    appendRectangle(hole, profile.opening, true);
    shape.holes.push(hole);
  }

  const geometry = remapShapeGeometryToPlane(new THREE.ShapeGeometry(shape));

  return {
    geometry,
    position: profile.position,
    rotation: profile.rotation,
  };
}