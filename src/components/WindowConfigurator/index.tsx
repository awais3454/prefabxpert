import { useState } from "react";
import { Scene } from "./Scene";
import { ControlPanel } from "./ControlPanel";
import { DimensionsDisplay } from "./components/DimensionsDisplay";
import { WindowConfig, DEFAULT_CONFIG } from "./types";
import { X } from "lucide-react";

export function WindowConfigurator() {
  const [config, setConfig] = useState<WindowConfig>(DEFAULT_CONFIG);
  const [showRotateHint, setShowRotateHint] = useState(true);

  return (
    <div className="app-container flex flex-col h-screen w-screen bg-background overflow-hidden sm:relative">
      {/* 3D Scene — top half on mobile, full screen on desktop */}
      <div className="scene-container h-[40vh] sm:absolute sm:inset-0 sm:h-full w-full relative overflow-hidden z-0 flex-shrink-0">
        <Scene config={config} />
        <DimensionsDisplay config={config} />
      </div>

      {/* 360 rotation hint — top-left, dismissable */}
      {showRotateHint && (
        <div className="absolute top-4 left-4 z-30 max-w-[260px] sm:max-w-[300px] pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-start gap-2 rounded-[14px] bg-[#FFFFFF]/90 backdrop-blur-sm border border-black/10 shadow-xl px-4 py-3">
            <p className="text-[12px] sm:text-[13px] text-[#1A1A1A] font-medium leading-snug tracking-tight">
              Tijdens het samenstellen van de dakkapel is de dakkapel 360&deg; rond te draaien.
            </p>
            <button
              onClick={() => setShowRotateHint(false)}
              aria-label="Sluiten"
              className="flex-shrink-0 -mt-0.5 -mr-1 h-6 w-6 rounded-full flex items-center justify-center text-[#666666] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors focus:outline-none"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Control Panel — bottom half on mobile, floating on desktop */}
      <div className="panel-container h-[60vh] sm:h-auto sm:absolute sm:inset-0 w-full z-10 sm:pointer-events-none flex-shrink-0">
        <ControlPanel config={config} onChange={setConfig} />
      </div>
    </div>
  );
}