import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';

/**
 * Handles Step 2 UI (labeled as Hellingshoek).
 * Now performs the Horizontal Scaling (Width) logic as requested.
 */
export function processStep2Pitch(
  obj: THREE.Object3D,
  context: ProcessorContext,
  scene: THREE.Object3D,
  windowScaleX: number
) {
  const { modelHalfWidth } = context;

  // We only scale/shift TOP-LEVEL structural components to avoid "exploding" the model.
  const isTopLevel = obj.parent === scene || obj.parent?.name === 'kaderglb' || obj.parent?.name === 'Assembly-131' || obj.parent?.name.includes('Assembly-1');

  if (isTopLevel) {
    const isLeftSide = obj.position.x < -0.05;
    const isRightSide = obj.position.x > 0.05;
    const isCenter = !isLeftSide && !isRightSide;

    if (isCenter) {
      obj.scale.x *= windowScaleX;
    } else if (isRightSide) {
      obj.position.x += (windowScaleX - 1) * modelHalfWidth;
    } else if (isLeftSide) {
      obj.position.x -= (windowScaleX - 1) * modelHalfWidth;
    }
  }

  return false;
}
