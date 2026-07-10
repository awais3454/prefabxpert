import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';

/**
 * Handles Step 5 UI (labeled as Breedte).
 * Now performs the Pitch Shearing logic with a fixed stable pivot.
 */
export function processStep5Breedte(
  obj: THREE.Object3D,
  context: ProcessorContext,
  scene: THREE.Object3D
) {
  const { pitchDeg } = context;

  // Mirroring Step 5's structural check
  const isTopLevel = obj.parent === scene || obj.parent?.name === 'kaderglb' || obj.parent?.name === 'Assembly-131' || obj.parent?.name.includes('Assembly-1');

  if (isTopLevel && pitchDeg !== 0) {
    const pitchRad = (pitchDeg * Math.PI) / 180;
    const s = Math.tan(pitchRad);

    // FIXED PIVOT: Using a fixed Z-offset (0.075) to ensure stability.
    // This prevents the side panels from "sidding down" or shifting unevenly when the model scales in width.
    const zFront = 0.075; 

    // Apply shear to ALL top-level structural elements
    const matrix = new THREE.Matrix4();
    matrix.set(
      1, 0, 0, 0,
      0, 1, s, -s * zFront,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    obj.applyMatrix4(matrix);
  }

  return false;
}
