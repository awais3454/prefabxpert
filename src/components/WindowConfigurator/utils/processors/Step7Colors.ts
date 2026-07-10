import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';

/**
 * Handles Step 7: Color Application.
 */
export function processStep7Colors(
  obj: THREE.Object3D,
  context: ProcessorContext,
  mat: THREE.MeshStandardMaterial,
  frameColorObj: THREE.Color,
  sashColorObj: THREE.Color
) {
  const { objName, matName } = context;

  if (matName.includes('glass') || matName.includes('translucent')) return;

  if (mat.color) {
    const isSash = matName.includes('sash') || objName.includes('gutter') || objName.includes('drain') || matName.includes('steel_smoke') || matName.includes('m06');
    if (isSash) {
      mat.color.set(sashColorObj);
    } else {
      mat.color.set(frameColorObj);
    }
    mat.needsUpdate = true;
  }
}
