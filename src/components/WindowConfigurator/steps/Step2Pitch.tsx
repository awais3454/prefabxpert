import { WindowConfig } from "../types";
import { Minus, Plus } from "lucide-react";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const CONFIG = {
  MIN: 15,
  MAX: 65,
  STEP: 1
};

export function Step2Pitch({ config, onChange }: StepProps) {
  // We use the global config state so the 3D model reacts instantly!
  const value = config.pitchDeg;

  const handleDecrement = () => {
    const newValue = Math.max(CONFIG.MIN, value - CONFIG.STEP);
    // This triggers the 3D math in pitchGeometry.ts
    onChange({ ...config, pitchDeg: Math.round(newValue * 100) / 100 });
  };

  const handleIncrement = () => {
    const newValue = Math.min(CONFIG.MAX, value + CONFIG.STEP);
    // This triggers the 3D math in pitchGeometry.ts
    onChange({ ...config, pitchDeg: Math.round(newValue * 100) / 100 });
  };

  return (
    <div className="flex flex-col flex-1 px-10 pt-0 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 step-2-pitch-container overflow-hidden text-center">

      <p className="text-[12px] text-[#6E94B0] font-medium mb-2 pt-5 leading-tight">
        Gebruik deze ontwerp tool via telefoon om de graden te meten.
      </p>

      <div className="flex items-center justify-center gap-4 mb-1">
        <a
          href="https://play.google.com/store/apps/details?id=com.wako.level&hl=nl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-black text-[#6E94B0] underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Android app
        </a>
        <a
          href="https://apps.apple.com/nl/app/gradenboog-smart/id1076530001"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-black text-[#6E94B0] underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          iPhone app
        </a>
      </div>

      {/* Stepper Logic (Plus/Minus Options Only - Exactly like Step 4) */}
      <div className="flex items-center justify-center gap-8 pt-2">
        <button
          onClick={handleDecrement}
          disabled={value <= CONFIG.MIN}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
        >
          <Minus size={14} strokeWidth={3} />
        </button>

        <div className="text-[17px] font-black text-[#6E94B0] min-w-[70px] text-center select-none tracking-tight">
          {value}°
        </div>

        <button
          onClick={handleIncrement}
          disabled={value >= CONFIG.MAX}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      {/* "Weet ik niet" — customer doesn't know the pitch angle */}
      <div className="flex justify-center pt-5">
        <button
          onClick={() => onChange({ ...config, pitchUnknown: !config.pitchUnknown })}
          className={`rounded-full border py-[10px] px-[22px] text-[13px] font-black tracking-tight transition-all duration-200 ${
            config.pitchUnknown
              ? "border-[#6E94B0] bg-[#6E94B0] text-white"
              : "border-[#6E94B0]/30 bg-[#FFFFFF] text-[#4A7593] hover:border-[#6E94B0]/60"
          }`}
        >
          Weet ik niet
        </button>
      </div>
    </div>
  );
}