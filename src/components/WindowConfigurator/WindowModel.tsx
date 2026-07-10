import { useMemo } from "react";
import * as THREE from "three";
import { WindowConfig, FRAME_CONSTANTS, computeEffectiveHeight } from "./types";
import { computePitchClipPlane } from "./clipPlane";
import { computeWallLayout } from "./pitchGeometry"; // ADDED IMPORT

const mm = (v: number) => v / 1000;

interface BoxProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  material: THREE.Material;
}

function Box({ width, height, depth, position, material }: BoxProps) {
  return (
    <mesh position={position} material={material}>
      <boxGeometry key={`${width}-${height}-${depth}`} args={[width, height, depth]} />
    </mesh>
  );
}

interface PanelProps {
  panelWidth: number;
  panelHeight: number;
  offsetX: number;
  bottomY: number;
  frameMat: THREE.Material;
  sashMat: THREE.Material;
  glassMat: THREE.Material;
}

function Panel({ panelWidth, panelHeight, offsetX, bottomY, frameMat, sashMat, glassMat }: PanelProps) {
  const { sashThickness, sashDepth, glassDepth } = FRAME_CONSTANTS;
  const glassW = panelWidth - sashThickness * 2;
  const glassH = panelHeight - sashThickness * 2;
  const cx = mm(offsetX);
  const cy = mm(bottomY + panelHeight / 2);
  const pw = mm(panelWidth);
  const ph = mm(panelHeight);
  const st = mm(sashThickness);
  const sd = mm(sashDepth);
  const innerH = mm(panelHeight - sashThickness * 2);

  return (
    <group position={[cx, cy, 0]}>
      <Box width={pw} height={st} depth={sd} position={[0, ph / 2 - st / 2, 0]} material={sashMat} />
      <Box width={pw} height={st} depth={sd} position={[0, -ph / 2 + st / 2, 0]} material={sashMat} />
      <Box width={st} height={innerH} depth={sd} position={[-pw / 2 + st / 2, 0, 0]} material={sashMat} />
      <Box width={st} height={innerH} depth={sd} position={[pw / 2 - st / 2, 0, 0]} material={sashMat} />
      <Box width={mm(glassW)} height={mm(glassH)} depth={mm(glassDepth)} position={[0, 0, 0]} material={glassMat} />
    </group>
  );
}

interface SingleWindowProps {
  windowWidth: number;
  windowHeight: number;
  panelCount: 1 | 2 | 3 | 4 | 5;
  positionX: number;
  sillY: number;
  frameMat: THREE.Material;
  sashMat: THREE.Material;
  glassMat: THREE.Material;
}

function SingleWindow({ windowWidth, windowHeight, panelCount, positionX, sillY, frameMat, sashMat, glassMat }: SingleWindowProps) {
  const { outerFrameThickness, outerFrameDepth, mullionWidth, mullionDepth } = FRAME_CONSTANTS;

  const layout = useMemo(() => {
    const innerW = windowWidth - outerFrameThickness * 2;
    const innerH = windowHeight - outerFrameThickness * 2;
    const mullions = panelCount - 1;
    const totalMullionW = mullions * mullionWidth;
    const panelW = (innerW - totalMullionW) / panelCount;

    const panels: { width: number; height: number; cx: number; bottomY: number }[] = [];
    const mullionPositions: number[] = [];

    for (let i = 0; i < panelCount; i++) {
      const startX = -innerW / 2 + i * (panelW + mullionWidth) + panelW / 2;
      panels.push({
        width: panelW,
        height: innerH,
        cx: startX,
        bottomY: outerFrameThickness,
      });
      if (i < panelCount - 1) {
        mullionPositions.push(startX + panelW / 2 + mullionWidth / 2);
      }
    }

    return { innerW, innerH, panels, mullionPositions };
  }, [windowWidth, windowHeight, panelCount]);

  const ww = mm(windowWidth);
  const wh = mm(windowHeight);
  const oft = mm(outerFrameThickness);
  const ofd = mm(outerFrameDepth);
  const innerFrameH = mm(windowHeight - outerFrameThickness * 2);
  const centerY = mm(sillY + windowHeight / 2);

  return (
    <group position={[mm(positionX), centerY, 0]}>
      <Box width={ww} height={oft} depth={ofd} position={[0, wh / 2 - oft / 2, 0]} material={frameMat} />
      <Box width={ww} height={oft} depth={ofd} position={[0, -wh / 2 + oft / 2, 0]} material={frameMat} />
      <Box width={oft} height={innerFrameH} depth={ofd} position={[-ww / 2 + oft / 2, 0, 0]} material={frameMat} />
      <Box width={oft} height={innerFrameH} depth={ofd} position={[ww / 2 - oft / 2, 0, 0]} material={frameMat} />

      {layout.mullionPositions.map((mx, i) => (
        <Box
          key={`m-${i}-${mx}`}
          width={mm(mullionWidth)}
          height={mm(layout.innerH)}
          depth={mm(mullionDepth)}
          position={[mm(mx), 0, 0]}
          material={frameMat}
        />
      ))}

      {layout.panels.map((p, i) => (
        <Panel
          key={`p-${i}-${panelCount}-${windowWidth}-${windowHeight}`}
          panelWidth={p.width}
          panelHeight={p.height}
          offsetX={p.cx}
          bottomY={-windowHeight / 2 + outerFrameThickness}
          frameMat={frameMat}
          sashMat={sashMat}
          glassMat={glassMat}
        />
      ))}
    </group>
  );
}

export function WindowRow({ config }: { config: WindowConfig }) {
  const { windowWidth, windowHeight, lintelLevel, panelCount, windowCopies, spacings, wallSideOffset, styleType, frameColor } = config;
  const effectiveHeight = computeEffectiveHeight(config);
  const effectivePanelCount: 1 | 2 | 3 | 4 | 5 = windowWidth > 2100 ? 3 : panelCount;

  const clipPlane = useMemo(() => computePitchClipPlane(config), [config]);

  const frameMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frameColor),
      roughness: 0.2,
      metalness: 0.1,
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, frameColor]);

  const sashMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.sashColor),
      roughness: 0.2,
      metalness: 0.1,
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane, config.sashColor]);

  const glassMat = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e0f2fe"),
      transmission: 0.95,
      roughness: 0.02,
      thickness: 0.5,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    if (clipPlane) mat.clippingPlanes = [clipPlane];
    return mat;
  }, [clipPlane]);

  // NEW: Grab the master layout from pitchGeometry.ts so the windows align perfectly with the wall holes!
  const layout = useMemo(() => computeWallLayout(config), [config]);

  const sillY = lintelLevel;

  return (
    // We shift the entire row by half the total wall width so it stays perfectly centered as it grows
    <group position={[-mm(layout.totalWallWidth) / 2, 0, 0]}>
      {layout.windowPositions.map((wx, i) => (
        <group key={`win-group-${i}-${windowWidth}-${effectiveHeight}-${styleType}`}>
          <SingleWindow
            windowWidth={windowWidth}
            windowHeight={effectiveHeight}
            panelCount={effectivePanelCount}
            // Add half the window width to the start point so it centers in the hole
            positionX={wx + windowWidth / 2}
            sillY={sillY}
            frameMat={frameMat}
            sashMat={sashMat}
            glassMat={glassMat}
          />
          {styleType === "kader" && (
            <Box
              width={mm(windowWidth + 40)}
              height={mm(effectiveHeight + 40)}
              depth={mm(40)}
              position={[mm(wx + windowWidth / 2), mm(sillY + effectiveHeight / 2), mm(40)]}
              material={frameMat}
            />
          )}
        </group>
      ))}
    </group>
  );
}