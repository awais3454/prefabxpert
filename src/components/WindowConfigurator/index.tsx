import { useState } from "react";
import { Scene } from "./Scene";
import { ControlPanel } from "./ControlPanel";
import { DimensionsDisplay } from "./components/DimensionsDisplay";
import { WindowConfig, DEFAULT_CONFIG } from "./types";
import { X } from "lucide-react";

export function WindowConfigurator() {
  // Multiple dormers — each is an independent WindowConfig, so the customer
  // can configure more than one dormer for the same project. The user edits
  // ONE dormer at a time (activeDormerIndex points at it); "Extra dakkapel
  // toevoegen" appends a fresh dormer and switches to it, "Opnieuw beginnen"
  // resets everything back down to a single new dormer.
  const [dormers, setDormers] = useState<WindowConfig[]>([DEFAULT_CONFIG]);
  const [activeDormerIndex, setActiveDormerIndex] = useState(0);
  const [showRotateHint, setShowRotateHint] = useState(true);

  const config = dormers[activeDormerIndex] ?? dormers[0];

  // Only the ACTIVE dormer is updated — every step component still just
  // calls onChange(newConfig) exactly like before, so none of the Step*.tsx
  // files need to know multi-dormer state exists at all.
  const updateActiveConfig = (newConfig: WindowConfig) => {
    setDormers(prev => prev.map((d, i) => (i === activeDormerIndex ? newConfig : d)));
  };

  const addDormer = () => {
    setDormers(prev => {
      const next = [...prev, { ...DEFAULT_CONFIG, currentStep: 1 }];
      setActiveDormerIndex(next.length - 1);
      return next;
    });
  };

  const switchDormer = (index: number) => {
    setActiveDormerIndex(index);
  };

  const removeDormer = (index: number) => {
    setDormers(prev => {
      if (prev.length <= 1) return prev; // always keep at least one dormer
      const next = prev.filter((_, i) => i !== index);
      setActiveDormerIndex(current => Math.max(0, Math.min(current, next.length - 1)));
      return next;
    });
  };

  const resetAll = () => {
    setDormers([DEFAULT_CONFIG]);
    setActiveDormerIndex(0);
  };

  return (
    <div className="app-container flex flex-col h-screen w-screen bg-background overflow-hidden sm:relative">
      {/* 3D Scene — top half on mobile, full screen on desktop.
          All dormers render side by side on the same roof; the camera stays
          focused on whichever one is currently being edited. */}
      <div className="scene-container h-[38vh] sm:absolute sm:inset-0 sm:h-full w-full relative overflow-hidden z-0 flex-shrink-0">
        <Scene config={config} dormers={dormers} activeDormerIndex={activeDormerIndex} />
        <DimensionsDisplay config={config} />
      </div>

      {/* 360 rotation hint — top-left, dismissable */}
      {showRotateHint && (
        <div className="absolute top-4 left-4 z-30 max-w-[260px] sm:max-w-[300px] pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-start gap-2 rounded-[14px] bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#6E94B0]/25 shadow-xl px-4 py-3">
            <p className="text-[12px] sm:text-[13px] text-[#6E94B0] font-medium leading-snug tracking-tight">
              Tijdens het samenstellen van de dakkapel is de dakkapel 360&deg; rond te draaien.
            </p>
            <button
              onClick={() => setShowRotateHint(false)}
              aria-label="Sluiten"
              className="flex-shrink-0 -mt-0.5 -mr-1 h-6 w-6 rounded-full flex items-center justify-center text-[#5E84A0] hover:text-[#6E94B0] hover:bg-[#6E94B0]/8 transition-colors focus:outline-none"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Control Panel — bottom half on mobile, floating on desktop */}
      <div className="panel-container h-[65vh] sm:h-auto sm:absolute sm:inset-0 w-full z-10 sm:pointer-events-none flex-shrink-0">
        <ControlPanel
          config={config}
          onChange={updateActiveConfig}
          dormers={dormers}
          activeDormerIndex={activeDormerIndex}
          onSwitchDormer={switchDormer}
          onAddDormer={addDormer}
          onRemoveDormer={removeDormer}
          onResetAll={resetAll}
        />
      </div>
    </div>
  );
}