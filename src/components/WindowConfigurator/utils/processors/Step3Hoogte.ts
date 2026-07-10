import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';

/**
 * Handles Step 3: Hoogte (Height).
 * Most height logic is currently handled by the scale-y on the primitive,
 * but this is ready for mesh-specific vertical logic.
 */
export function processStep3Hoogte(obj: THREE.Object3D, context: ProcessorContext) {
  return false;
}
