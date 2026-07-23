import { WindowConfig } from "../types";
import { Minus, Plus } from "lucide-react";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const CONFIG = {
  HEIGHT: { MIN: 1200, MAX: 2000, STEP: 50 },
  PARAPET: { MIN: 0, MAX: 1000, STEP: 50 }
};

export function Step3Dimensions({ config, onChange }: StepProps) {
  const { windowHeight: h, lintelLevel: p } = config;

  const updateHeight = (newValue: number) => {
    onChange({ ...config, windowHeight: newValue });
  };

  const updateParapet = (newValue: number) => {
    onChange({ ...config, lintelLevel: newValue });
  };

  return (
    <div className="flex flex-col flex-1 px-10 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 step-3-dimensions-container overflow-hidden text-center">

      {/* Main title */}
      <h3 className="step-title-bold text-[16px] text-black tracking-tight text-center mb-3">
        Complete dakkapel
      </h3>

      {/* Hoogte Section */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[15px] font-black text-[#6E94B0] tracking-tight">Hoogte</span>
        <div className="flex items-center gap-8">
          <button
            onClick={() => updateHeight(Math.max(CONFIG.HEIGHT.MIN, h - CONFIG.HEIGHT.STEP))}
            disabled={h <= CONFIG.HEIGHT.MIN}
            className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <div className="text-[16px] font-black text-[#6E94B0] min-w-[70px] text-center select-none tracking-tight">
            {Math.round(h)} mm
          </div>
          <button
            onClick={() => updateHeight(Math.min(CONFIG.HEIGHT.MAX, h + CONFIG.HEIGHT.STEP))}
            disabled={h >= CONFIG.HEIGHT.MAX}
            className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Warning for height 1750mm and above */}
      {h >= 1750 && (
        <div className="mt-3 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl">
          <p className="text-[12px] font-semibold text-amber-400 text-center leading-relaxed">
            Let op: Hoogte van 1750 mm en hoger kan vergunningsplichtig zijn. Neem contact op voor advies.
          </p>
        </div>
      )}

      {/* Borstwering Section Header */}
      <div className="w-full flex justify-center mb-1 mt-4">
        <h3 className="text-[15px] font-black text-[#6E94B0] tracking-tight text-center">Borstwering</h3>
      </div>

      {/* Hoogte Borstwering Section */}
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-black text-[#6E94B0] tracking-tight">Hoogte</span>
        <div className="flex items-center gap-8">
          <button
            onClick={() => updateParapet(Math.max(CONFIG.PARAPET.MIN, p - CONFIG.PARAPET.STEP))}
            disabled={p <= CONFIG.PARAPET.MIN}
            className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <div className="text-[16px] font-black text-[#6E94B0] min-w-[70px] text-center select-none tracking-tight">
            {Math.round(p)} mm
          </div>
          <button
            onClick={() => updateParapet(Math.min(CONFIG.PARAPET.MAX, p + CONFIG.PARAPET.STEP))}
            disabled={p >= CONFIG.PARAPET.MAX}
            className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

    </div>
  );
}