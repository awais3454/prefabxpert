import * as THREE from 'three';

/**
 * Shared context for step processors to avoid redundant lookups.
 */
export interface ProcessorContext {
  objName: string;
  pName: string;
  matName: string;
  isKader: boolean;
  modelHalfWidth: number;
  windowHeight: number;
  lintelLevel: number;
  pitchDeg: number;
}

/**
 * Common material setup used by all meshes.
 */
export function setupMaterial(mesh: THREE.Mesh): THREE.MeshStandardMaterial | null {
  const currentMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (!currentMat) return null;

  const mat = (currentMat as THREE.MeshStandardMaterial).clone();
  mesh.material = mat;
  mat.side = THREE.DoubleSide;
  return mat;
}
