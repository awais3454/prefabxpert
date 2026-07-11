import { WindowConfig } from "../types";
import { Minus, Plus } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const KOZ_MIN = 850;
const KOZ_MAX = 5000;
const KOZ_STEP = 50;
const PEN_MIN = 200;
const PEN_MAX = 4000;
const PEN_STEP = 50;
const SIDE_CHEEK_TOTAL = 370;

function Stepper({
  label, value, unit, min, max, step, bold,
  onDec, onInc,
}: {
  label: string; value: number; unit: string; min: number; max: number; step: number; bold?: boolean;
  onDec: () => void; onInc: () => void;
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const startHold = (action: () => void) => {
    action(); // First click immediately
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        action();
      }, 50); // Fast repeat while holding
    }, 300); // Delay before rapid fire
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <span className={`text-[17px] tracking-tighter ${bold ? 'font-black text-[#1A1A1A]' : 'font-semibold text-[#444444]'}`}>
        {label}
      </span>
      <div className="flex items-center gap-8">
        <button
          onMouseDown={() => startHold(onDec)}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startHold(onDec)}
          onTouchEnd={clearTimers}
          disabled={value <= min}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none select-none"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <div className="text-[16px] font-black text-[#1A1A1A] min-w-[70px] text-center select-none tracking-tighter">
          {Math.round(value / 10)} {unit}
        </div>
        <button
          onMouseDown={() => startHold(onInc)}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startHold(onInc)}
          onTouchEnd={clearTimers}
          disabled={value >= max}
          className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none select-none"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export function Step5Width({ config, onChange }: StepProps) {
  const copies = Math.max(1, config.windowCopies ?? 1);
  const widths: number[] = Array.from({ length: copies }, (_, i) =>
    config.windowWidths?.[i] ?? config.windowWidth
  );
  const spacings: number[] = Array.from({ length: copies - 1 }, (_, i) =>
    config.spacings?.[i] ?? 200
  );

  const updateWidth = (i: number, val: number) => {
    const next = [...widths];
    next[i] = val;
    onChange({ ...config, windowWidths: next, windowWidth: next[0] });
  };

  const updateSpacing = (i: number, val: number) => {
    const next = [...(config.spacings ?? [200, 200, 200, 200])];
    next[i] = val;
    onChange({ ...config, spacings: next });
  };

  const totalWidth = widths.reduce((s, w) => s + w, 0)
    + spacings.reduce((s, g) => s + g, 0)
    + SIDE_CHEEK_TOTAL;

  const rows: JSX.Element[] = [];
  for (let i = 0; i < copies; i++) {
    const w = widths[i];
    rows.push(
      <Stepper key={`koz-${i}`}
        label={copies > 1 ? `Kozijn ${i + 1}` : 'Kozijn'}
        value={w} unit="cm" min={KOZ_MIN} max={KOZ_MAX} step={KOZ_STEP} bold
        onDec={() => updateWidth(i, Math.max(KOZ_MIN, w - KOZ_STEP))}
        onInc={() => updateWidth(i, Math.min(KOZ_MAX, w + KOZ_STEP))}
      />
    );
    if (i < copies - 1) {
      const g = spacings[i];
      rows.push(
        <Stepper key={`pen-${i}`}
          label="Penant"
          value={g} unit="cm" min={PEN_MIN} max={PEN_MAX} step={PEN_STEP}
          onDec={() => updateSpacing(i, Math.max(PEN_MIN, g - PEN_STEP))}
          onInc={() => updateSpacing(i, Math.min(PEN_MAX, g + PEN_STEP))}
        />
      );
    }
  }

  return (
    <div className="flex flex-col flex-1 px-10 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 step-5-width-container overflow-y-auto">

      {rows}

      {/* 2x zijwang */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[17px] font-normal text-[#666666] tracking-tight">2x zijwang</span>
        <div className="flex items-center gap-8">
          <div className="w-[42px]" />
          <div className="text-[15px] font-normal text-[#666666] min-w-[70px] text-center select-none tracking-tight">
            {SIDE_CHEEK_TOTAL / 10} cm
          </div>
          <div className="w-[42px]" />
        </div>
      </div>

      {/* Totaal */}
      <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/10">
        <span className="text-[17px] font-black text-[#1A1A1A] tracking-tighter">Totaal</span>
        <div className="flex items-center gap-8">
          <div className="w-[42px]" />
          <div className="text-[16px] font-black text-[#1A1A1A] min-w-[70px] text-center select-none tracking-tighter">
            {Math.round(totalWidth / 10)} cm
          </div>
          <div className="w-[42px]" />
        </div>
      </div>

    </div>
  );
}