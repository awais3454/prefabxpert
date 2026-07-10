import { WindowConfig } from "../types";
import { Minus, Plus } from "lucide-react";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const CONFIG = {
  MIN: 0,
  MAX: 4, // Up to 5 windows (4 tussenpanelen)
  STEP: 1
};

export function Step4Panels({ config, onChange }: StepProps) {
  // Value displayed is windowCopies - 1 (number of internal partitions)
  const value = config.windowCopies - 1;

  const syncWidths = (newCopies: number) => {
    const current = config.windowWidths?.length ? config.windowWidths : [config.windowWidth];
    const filled = Array.from({ length: newCopies }, (_, i) => current[i] ?? config.windowWidth);
    return filled;
  };

  const handleDecrement = () => {
    const newCopies = Math.max(CONFIG.MIN + 1, value - CONFIG.STEP + 1);
    onChange({ ...config, windowCopies: newCopies, windowWidths: syncWidths(newCopies) });
  };

  const handleIncrement = () => {
    const newCopies = Math.min(CONFIG.MAX + 1, value + CONFIG.STEP + 1);
    onChange({ ...config, windowCopies: newCopies, windowWidths: syncWidths(newCopies) });
  };

  return (
    <div className="flex flex-col flex-1 px-10 pt-0 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 step-4-panels-container overflow-hidden text-center">

      {/* Stepper Logic (Plus/Minus Options) */}
      <div className="flex items-center justify-center gap-8 pt-4">
        <button
          onClick={handleDecrement}
          disabled={value <= CONFIG.MIN}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
        >
          <Minus size={14} strokeWidth={3} />
        </button>

        <div className="text-[17px] font-black text-white min-w-[70px] text-center select-none tracking-tight">
          {value}
        </div>

        <button
          onClick={handleIncrement}
          disabled={value >= CONFIG.MAX}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}