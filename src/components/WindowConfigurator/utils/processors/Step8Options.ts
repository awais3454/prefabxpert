import * as THREE from 'three';
import { ProcessorContext } from './SharedLogic';
import { WindowConfig } from '../../types';

/**
 * Handles Step 8: Extra Options visibility (Vent, Blind, Screen).
 */
export function processStep8Options(
  obj: THREE.Object3D,
  context: ProcessorContext,
  config: WindowConfig | undefined
) {
  const { objName, pName, matName } = context;

  const isVent = objName.includes('vent') || pName.includes('vent') || objName.includes('grid') || matName.includes('sapphire');
  const isBlind = objName.includes('blind') || objName.includes('roll') || pName.includes('roll') || pName.includes('rol') || objName.includes('shutter') || objName.includes('luik') || objName.includes('screen') || objName.includes('doek') || objName.includes('kast') || objName.includes('zon') || objName.includes('aanbouw');
  const isHor = objName.includes('insect') || pName.includes('insect') || objName.includes('hor') || objName.includes('screen') || objName.includes('gaas');

  if (isVent) {
    obj.visible = !!config?.ventGrillEnabled;
  } else if (isBlind) {
    obj.visible = !!config?.shutterEnabled;
  } else if (isHor) {
    obj.visible = false;
  }

  return isVent || isBlind || isHor;
}
