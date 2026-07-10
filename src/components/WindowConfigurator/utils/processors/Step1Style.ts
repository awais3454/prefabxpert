import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';

/**
 * Handles Step 1: Visibility of Kader vs Traditional parts.
 */
export function processStep1Style(obj: THREE.Object3D, context: ProcessorContext) {
  const { objName, pName, isKader } = context;

  const isKaderPart = objName.includes('kader') || pName.includes('kader');
  const isTraditionalPart = objName.includes('traditioneel') || objName.includes('traditional');
  const isShinglePart = objName.includes('shingle') || objName.includes('tile') || objName.includes('pannen') || objName.includes('dakpan');
  const isWindowPart = objName.includes('frame') || objName.includes('glass') || objName.includes('sash') || objName.includes('kozijn') || objName.includes('glas') || objName.includes('divider') || objName.includes('mullion') || objName.includes('tussenstijl') || objName.includes('sill') || objName.includes('waterslag') || objName.includes('trim') || objName.includes('lijst');
  const isKaderBox = objName.includes('frame_front_kader') || objName.includes('box_frame') || objName.includes('frame_kader');

  if (isKader) {
    if (isTraditionalPart) {
      obj.visible = false;
      return true; // Handled
    }
    if (objName.includes('drain')) {
      obj.visible = false;
      return true;
    }
  } else {
    const isStructuralKader = isKaderPart && !objName.includes('assembly') && objName !== 'kaderglb' && !isKaderBox;
    if (isStructuralKader && !isShinglePart && !isWindowPart) {
      obj.visible = false;
      return true;
    }
  }

  return false;
}
