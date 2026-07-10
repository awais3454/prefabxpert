import * as THREE from 'three';
import { WindowConfig } from '../types';
import { setupMaterial, ProcessorContext } from './processors/SharedLogic';
import { processStep1Style } from './processors/Step1Style';
import { processStep2Pitch } from './processors/Step2Pitch';
import { processStep3Hoogte } from './processors/Step3Hoogte';
import { processStep4Panels } from './processors/Step4Panels';
import { processStep5Breedte } from './processors/Step5Breedte';
import { processStep6Bekleding } from './processors/Step6Bekleding';
import { processStep7Colors } from './processors/Step7Colors';
import { processStep8Options } from './processors/Step8Options';
import { processStep9Positie } from './processors/Step9Positie';
import { processStep10Request } from './processors/Step10Request';

/**
 * Orchestrates the model processing by calling individual step handlers.
 * Each configuration step (1-10) has its own dedicated logic file.
 */
export function processWindowModel(
  scene: THREE.Object3D,
  config: WindowConfig | undefined,
  activeGLTF: any,
  frameColor: string,
  windowScaleX: number,
  sillClipPlane: THREE.Plane | null
) {
  scene.rotation.set(0, 0, 0);

  const isKader = config?.styleType === 'kader';
  const frameColorObj = new THREE.Color(frameColor);
  const sashColorObj = new THREE.Color(config?.sashColor || '#ffffff');

  // 1. VISIBILITY & INITIAL BOX SETUP
  // Reset all objects to visible before processing to avoid "permanent hide" bugs
  scene.traverse((obj) => {
    obj.visible = true;
  });

  // 1.2 First pass: Visibility based on style
  // This must happen BEFORE calculating the box for width logic
  scene.traverse((obj) => {
    const objName = (obj.name || '').toLowerCase();
    const pName = (obj.parent?.name || '').toLowerCase();
    const context: ProcessorContext = {
      objName,
      pName,
      matName: '',
      isKader,
      modelHalfWidth: 0,
      windowHeight: config?.windowHeight || 1200,
      lintelLevel: config?.lintelLevel || 0,
      pitchDeg: config?.pitchDeg || 35
    };
    processStep1Style(obj, context);
  });

  // 1.3 Calculate the initial half-width for Step 5 Breedte logic
  // IMPORTANT: Only consider visible frame and glass for the reference width.
  const initialBox = new THREE.Box3();
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && obj.visible) {
      const name = obj.name.toLowerCase();
      const isCorePart = name.includes('frame') || name.includes('glass') || name.includes('kozijn') || name.includes('sash') || name.includes('glas') || name.includes('box');
      if (isCorePart) {
        initialBox.expandByObject(obj);
      }
    }
  });

  // Fallback if no core parts found
  if (initialBox.isEmpty()) {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && obj.visible) initialBox.expandByObject(obj);
    });
  }

  const modelHalfWidth = isFinite(initialBox.min.x) ? (initialBox.max.x - initialBox.min.x) / 2 : 0;

  // 1.4 Apply Assembly processing (Step 5 Breedte & Step 2 Pitch) at TOP LEVEL ONLY
  // This ensures both steps operate on the same structural context (left/right/center).
  scene.children.forEach((child) => {
    const childContext: ProcessorContext = {
      objName: child.name.toLowerCase(),
      pName: 'scene',
      matName: '',
      isKader,
      modelHalfWidth,
      windowHeight: config?.windowHeight || 1200,
      lintelLevel: config?.lintelLevel || 0,
      pitchDeg: config?.pitchDeg || 35
    };

    // 1.4.1 Horizontal Scaling (Now Step 2 "Hellingshoek")
    processStep2Pitch(child, childContext, scene, windowScaleX);

    // 1.4.2 Vertical Shearing (Now Step 5 "Breedte")
    processStep5Breedte(child, childContext, scene);
  });

  // 2. SCENE TRAVERSAL
  scene.traverse((obj) => {
    // PRE-PROCESSING: Build context for this object
    const objName = (obj.name || '').toLowerCase();
    const pName = (obj.parent?.name || '').toLowerCase();

    let matName = '';
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const tempMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (tempMat) matName = (tempMat.name || '').toLowerCase();
    }

    const context: ProcessorContext = {
      objName,
      pName,
      matName,
      isKader,
      modelHalfWidth,
      windowHeight: config?.windowHeight || 1200,
      lintelLevel: config?.lintelLevel || 0,
      pitchDeg: config?.pitchDeg || 35
    };

    // UTILITY: Hide internal view elements
    if (objName.includes('active_view')) {
      obj.visible = false;
      return;
    }

    // --- STEP 1: STYLE ---
    if (processStep1Style(obj, context)) return;

    // --- STEP 3: HOOGTE ---
    processStep3Hoogte(obj, context);

    // --- STEP 4: PANELEN ---
    processStep4Panels(obj, context);

    // --- STEP 6: BEKLEDING ---
    processStep6Bekleding(obj, context);

    // --- STEP 8: OPTIONS (VENT/BLIND VISIBILITY) ---
    processStep8Options(obj, context, config);

    // --- STEP 9: POSITIE ---
    processStep9Positie(obj, context);

    // --- STEP 10: REQUEST ---
    processStep10Request(obj, context);

    // --- MATERIAL & COLOR PROCESSING ---
    if (!(obj as THREE.Mesh).isMesh) return;

    const mesh = obj as THREE.Mesh;
    const mat = setupMaterial(mesh);
    if (!mat) return;

    // Additional Setup
    if (objName.includes('blind') || objName.includes('roll')) {
      mesh.frustumCulled = false;
    }

    // --- STEP 7: COLORS ---
    processStep7Colors(obj, context, mat, frameColorObj, sashColorObj);
  });

  // 3. FINAL CENTERING (DEFERRED)
  // We calculate the center AFTER all scaling (width/height) and visibility changes are complete.
  const finalBox = new THREE.Box3();
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && obj.visible) {
      finalBox.expandByObject(obj);
    }
  });

  const centerX = isFinite(finalBox.min.x) ? (finalBox.max.x + finalBox.min.x) / 2 : 0;
  const centerY = isFinite(finalBox.min.y) ? (finalBox.max.y + finalBox.min.y) / 2 : 0;
  const centerZ = isFinite(finalBox.min.z) ? (finalBox.max.z + finalBox.min.z) / 2 : 0;

  // Pivot the entire scene around its final visual center
  // Note: We shift the whole scene BACKWARDS by exactly what we detected to keep it centered at ORIGIN.
  scene.position.set(-centerX, -centerY, -centerZ);

  return scene;
}
