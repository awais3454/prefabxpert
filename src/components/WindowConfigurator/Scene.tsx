import { Suspense, Component, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, SoftShadows, Html } from "@react-three/drei";

/** Loading screen component displayed while 3D model loads */
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#B68D40] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[#B68D40] font-bold text-sm">Laden...</p>
      </div>
    </Html>
  );
}
import { WindowConfig } from "./types";
import { useModelSync } from "./RealModel";
import { DormerScene } from "./TestModel";

interface SceneProps {
  config: WindowConfig;
}

class SceneErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error: error?.message || String(error) };
  }
  render() {
    if (this.state.error) {
      // console.error('[SceneErrorBoundary]', this.state.error);
      return null;
    }
    return this.props.children;
  }
}

/** Smooth animated camera controller - zooms based on window count, resets on step change */
function CameraController({ config }: { config: WindowConfig }) {
  const controlsRef = useRef<any>(null);
  const { camera, size } = useThree();
  const prevStepRef = useRef(config.currentStep);
  const prevCopiesRef = useRef(config.windowCopies);
  const animatingRef = useRef(false);
  const frameZoomRef = useRef<{ frameCenterX: number; frameWidth: number } | null>(null);

  const isMobile = size.width < 640;
  // Configurator start camera position
  const defaultX = -3.9906003396697605;
  const defaultY = isMobile ? 1.2 : 0.9171260003370636; // Raise camera up
  const baseZ = isMobile ? 6.5 : 6.132769865506697; // Adjust zoom for mobile

  const targetPosRef = useRef(new THREE.Vector3(defaultX, defaultY, baseZ));
  const targetLookRef = useRef(new THREE.Vector3(-0.5580617264265286, isMobile ? -0.4 : -0.26438039392461765, -0.17671947803556104)); // user target

  const getTargetZ = (copies: number) => baseZ + (copies - 1) * 2.5;

  // Listen for frame selection events from Step5Arrange
  useEffect(() => {
    const handleFrameSelected = (e: any) => {
      if (config.currentStep === 5 && e.detail) {
        frameZoomRef.current = {
          frameCenterX: e.detail.frameCenterX,
          frameWidth: e.detail.frameWidth
        };
        animatingRef.current = true;
      }
    };
    window.addEventListener('frameSelected', handleFrameSelected);
    return () => window.removeEventListener('frameSelected', handleFrameSelected);
  }, [config.currentStep]);

  // Detect step change → reset to front, special angle for Hellingshoek (step 2)
  useMemo(() => {
    if (config.currentStep !== prevStepRef.current) {
      prevStepRef.current = config.currentStep;
      const z = getTargetZ(config.windowCopies);
      if (config.currentStep === 2) {
        // Hellingshoek: left side view to show roof pitch angle
        targetPosRef.current.set(isMobile ? defaultX : -7.392371884077464, isMobile ? defaultY : 0.300510074387591, isMobile ? baseZ : 1.5107036698373193);
        targetLookRef.current.set(isMobile ? -0.558 : 0, isMobile ? -0.26 : -0.3, isMobile ? -0.177 : 0);
      } else if (config.currentStep === 3) {
        // Step 3: slightly zoomed out and rotated from Hellingshoek
        targetPosRef.current.set(-6.5, isMobile ? 0.2 : 1.2, 3.5);
        targetLookRef.current.set(0, -0.2, 0);
      } else if (config.currentStep === 6) {
        // Step 6: Breedte & penanten - front view to show frame widths and penants
        targetPosRef.current.set(0, isMobile ? -0.3 : 0.5, isMobile ? z - 2.5 : z + 1);
        targetLookRef.current.set(0, 0, 0);
      } else if (config.currentStep === 5) {
        // Step 5: Hoogte — straight front view so height/borstwering changes are clearly visible
        targetPosRef.current.set(0, isMobile ? -0.3 : 0.5, isMobile ? z - 2.5 : z + 1);
        targetLookRef.current.set(0, 0, 0);
        // Reset frame zoom when entering step 5
        frameZoomRef.current = null;
      } else if (config.currentStep === 4) {
        // Step 4: De hellingshoek — same tilt as the old Hellingshoek view but
        // zoomed out (~25%) and panned so the model clears the left card and
        // sits toward the right of the viewport
        targetPosRef.current.set(isMobile ? defaultX : -9.7, isMobile ? defaultY : 0.5, isMobile ? baseZ : 0.2);
        targetLookRef.current.set(isMobile ? -0.558 : -0.4, isMobile ? -0.26 : -0.3, isMobile ? -0.177 : -1.6);
      } else if (config.currentStep >= 4) {
        // Step 5+: front view
        targetPosRef.current.set(0, isMobile ? -0.3 : 0.5, isMobile ? z - 2.5 : z + 1);
        targetLookRef.current.set(0, 0, 0);
      } else {
        const scale = z / baseZ;
        targetPosRef.current.set(defaultX * scale, defaultY, z);
        targetLookRef.current.set(-0.558, isMobile ? -0.4 : -0.264, -0.177);
      }
      animatingRef.current = true;
    }
  }, [config.currentStep]);

  // Detect window copies change → zoom in/out, stay in front view
  useMemo(() => {
    if (prevCopiesRef.current !== config.windowCopies) {
      prevCopiesRef.current = config.windowCopies;
      const z = getTargetZ(config.windowCopies);
      // Keep current step's camera angle, only adjust Z for zoom
      if (config.currentStep === 4) {
        // De hellingshoek keeps its tilted, zoomed-out, panned side view
        targetPosRef.current.set(isMobile ? defaultX : -9.7, isMobile ? defaultY : 0.5, isMobile ? baseZ : 0.2);
        targetLookRef.current.set(isMobile ? -0.558 : -0.4, isMobile ? -0.26 : -0.3, isMobile ? -0.177 : -1.6);
      } else if (config.currentStep >= 4) {
        targetPosRef.current.set(0, isMobile ? -0.3 : 0.5, isMobile ? z - 2.5 : z + 1);
        targetLookRef.current.set(0, 0, 0);
      } else if (config.currentStep === 2) {
        targetPosRef.current.set(isMobile ? defaultX : -7.392371884077464, isMobile ? defaultY : 0.300510074387591, isMobile ? baseZ : 1.5107036698373193);
        targetLookRef.current.set(isMobile ? -0.558 : 0, isMobile ? -0.26 : -0.3, isMobile ? -0.177 : 0);
      } else if (config.currentStep === 3) {
        targetPosRef.current.set(-6.5, isMobile ? 0.2 : 1.2, 3.5);
        targetLookRef.current.set(0, -0.2, 0);
      } else {
        const scale = z / baseZ;
        targetPosRef.current.set(defaultX * scale, defaultY, z);
        targetLookRef.current.set(-0.558, isMobile ? -0.4 : -0.264, -0.177);
      }
      animatingRef.current = true;
    }
  }, [config.windowCopies]);

  // Set initial camera position on mount — use useEffect so controlsRef is ready
  const mountedRef = useRef(false);
  useFrame(() => {
    if (mountedRef.current) return;
    if (!controlsRef.current) return;
    mountedRef.current = true;
    camera.position.set(defaultX, defaultY, baseZ);
    controlsRef.current.target.set(-0.5580617264265286, -0.26438039392461765, -0.17671947803556104);
    controlsRef.current.enabled = true;
    controlsRef.current.update();
  });

  useFrame((_, delta) => {
    if (!controlsRef.current || !animatingRef.current) return;

    const controls = controlsRef.current;
    const speed = Math.min(delta * 10, 1);

    // Disable user controls during animation
    controls.enabled = false;

    // If frame zoom is active, calculate zoomed camera position
    if (frameZoomRef.current && config.currentStep === 5) {
      const { frameCenterX, frameWidth } = frameZoomRef.current;
      // Convert mm to three.js units (divide by 1000)
      const centerX = frameCenterX / 1000;
      // Zoomed out enough to see full kozijn with context
      const zoomDistance = Math.max(4.5, frameWidth / 1000 * 2.0);
      
      // Set target to look at the frame center
      targetLookRef.current.set(centerX, isMobile ? -0.3 : -0.1, 0);
      // Set camera position - zoomed out, slightly shifted right
      targetPosRef.current.set(centerX + 0.8, isMobile ? -0.3 : 0.1, zoomDistance);
    }

    // Smoothly lerp both camera position AND target
    camera.position.lerp(targetPosRef.current, speed);
    controls.target.lerp(targetLookRef.current, speed);
    controls.update();

    // Stop when close enough
    const posDist = camera.position.distanceTo(targetPosRef.current);
    const tgtDist = controls.target.distanceTo(targetLookRef.current);
    if (posDist < 0.05 && tgtDist < 0.05) {
      camera.position.copy(targetPosRef.current);
      controls.target.copy(targetLookRef.current);
      controls.update();
      animatingRef.current = false;
      controls.enabled = true;
    }
  });

  // Log camera position helper
  const logCameraPosition = () => {
    const euler = camera.rotation;
    const pitch = THREE.MathUtils.radToDeg(euler.x);
    const yaw = THREE.MathUtils.radToDeg(euler.y);
    const roll = THREE.MathUtils.radToDeg(euler.z);
    const camData = {
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      target: { x: controlsRef.current?.target.x, y: controlsRef.current?.target.y, z: controlsRef.current?.target.z },
      pitch, yaw, roll,
      polarAngle: controlsRef.current?.getPolarAngle?.(),
      azimuthalAngle: controlsRef.current?.getAzimuthalAngle?.()
    };
    // console.log('Camera:', camData);
    // Copy to clipboard on mobile for easy pasting
    if (isMobile && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(camData, null, 2));
    }
    return camData;
  };

  // Register logger with global ref
  useEffect(() => {
    cameraLoggerRef.current = logCameraPosition;
  }, [camera]);

  // Press 'C' key to log camera position (desktop)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        logCameraPosition();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[-0.5580617264265286, -0.26438039392461765, -0.17671947803556104]}
      enableRotate={true}
      enablePan={true}
      enableDamping={true}
      dampingFactor={0.05}
      autoRotate={false}
      rotateSpeed={0.6}
      minDistance={3}
      maxDistance={60}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      // Full 360° rotation allowed - no polar angle limits
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      makeDefault
    />
  );
}

// Global ref to access camera logger from Scene component
const cameraLoggerRef = { current: () => {} };

export function getCameraLogger() {
  return cameraLoggerRef.current;
}

export function Scene({ config }: SceneProps) {
  useModelSync(config);
  const modelRef = useRef<THREE.Group>(null);

  // Triple-tap to log camera position (mobile)
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);
  const handleCanvasTouch = (e: React.TouchEvent) => {
    // Prevent default only on triple tap detection area if needed
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      tapCountRef.current++;
      if (tapCountRef.current === 3) {
        e.preventDefault();
        cameraLoggerRef.current?.();
        tapCountRef.current = 0;
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapRef.current = now;
  };

  return (
    <Canvas
      shadows={true}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, localClippingEnabled: true }}
      camera={{ position: [-3.9906003396697605, 0.9171260003370636, 6.132769865506697], fov: 50 }}
      style={{ background: "linear-gradient(145deg, #fdfcfa 0%, #f8f5f0 50%, #f2efe8 100%)", touchAction: "none", width: "100%", height: "100%", pointerEvents: "auto" }}
      onTouchStart={handleCanvasTouch}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.72;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      {/* Soft warm ambient lighting */}
      <hemisphereLight args={["#fff8f0", "#e8e0d5", 0.35]} />
      <ambientLight intensity={0.15} />

      {/* Key light — soft warm sun from upper right */}
      <directionalLight
        position={[6, 12, 6]}
        intensity={0.85}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0001}
      />
      {/* Fill light — soft warm from upper-left */}
      <directionalLight position={[-6, 5, -2]} intensity={0.2} color="#fff0e8" />
      {/* Soft rim light */}
      <directionalLight position={[0, 4, -8]} intensity={0.08} color="#f5ebe0" />

      <Suspense fallback={
        <Loader />
      }>
        <SceneErrorBoundary>
          <Environment preset="apartment" background={false} />
          <SoftShadows size={30} samples={20} focus={0.6} />
          <group ref={modelRef}>
            <DormerScene config={config} />
          </group>
          <ContactShadows
            position={[0, -2.8, 0]}
            opacity={0.15}
            scale={22}
            blur={3.5}
            far={5}
            color="#334455"
          />
        </SceneErrorBoundary>
      </Suspense>

      <CameraController config={config} />
    </Canvas>
  );
}