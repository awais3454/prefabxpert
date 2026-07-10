import { WindowConfig } from "../types";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const KOZ_MIN = 850;
const KOZ_MAX = 5000;
const KOZ_STEP = 50;

export function Step5Arrange({ config, onChange }: StepProps) {
  const copies = Math.max(1, config.windowCopies ?? 1);
  const [selectedFrame, setSelectedFrame] = useState(0);
  
  // Get current widths
  const widths: number[] = Array.from({ length: copies }, (_, i) =>
    config.windowWidths?.[i] ?? config.windowWidth
  );

  // Update camera to focus on selected frame when it changes
  useEffect(() => {
    // Calculate total width of all frames + penants
    const totalFrameWidth = widths.reduce((s, w) => s + w, 0);
    const totalSpacing = config.spacings?.slice(0, copies - 1).reduce((s, g) => s + g, 0) || 0;
    const totalWindowArea = totalFrameWidth + totalSpacing;
    
    // Calculate the center position of the selected frame (relative to the center of all windows)
    let frameStartX = -totalWindowArea / 2; // Start from left edge
    for (let i = 0; i < selectedFrame; i++) {
      frameStartX += (widths[i] || config.windowWidth) + (config.spacings?.[i] ?? 200);
    }
    const frameWidth = widths[selectedFrame] || config.windowWidth;
    const frameCenterX = frameStartX + frameWidth / 2;
    
    // Store the target frame info for camera controller
    (window as any).__selectedFrameInfo = {
      frameIndex: selectedFrame,
      frameCenterX: frameCenterX,
      frameWidth: frameWidth,
      totalFrames: copies,
      zoomed: true
    };
    
    // Trigger a custom event to notify the camera controller
    window.dispatchEvent(new CustomEvent('frameSelected', { 
      detail: { 
        frameIndex: selectedFrame, 
        frameCenterX: frameCenterX,
        frameWidth: frameWidth 
      } 
    }));
    
    return () => {
      // Clear zoom when component unmounts
      (window as any).__selectedFrameInfo = null;
    };
  }, [selectedFrame, widths, config.windowWidth, config.spacings, copies]);

  const updateFrameWidth = (frameIndex: number, newWidth: number) => {
    const next = [...widths];
    next[frameIndex] = Math.max(KOZ_MIN, Math.min(KOZ_MAX, newWidth));
    onChange({ ...config, windowWidths: next });
  };

  const handlePrevFrame = () => {
    setSelectedFrame(prev => Math.max(0, prev - 1));
  };

  const handleNextFrame = () => {
    setSelectedFrame(prev => Math.min(copies - 1, prev + 1));
  };

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-10 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Frame Selector */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handlePrevFrame}
          disabled={selectedFrame === 0}
          className="w-10 h-10 rounded-full bg-[#5E84A0] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#5E84A0] transition-all"
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[11px] sm:text-[12px] font-semibold text-white uppercase tracking-wider">
            Kozijn {selectedFrame + 1} van {copies}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Maximize2 size={14} className="text-[#8D725C]" />
            <span className="text-[14px] sm:text-[16px] font-black text-white">
              {Math.round(widths[selectedFrame] / 10)} cm
            </span>
          </div>
        </div>
        
        <button
          onClick={handleNextFrame}
          disabled={selectedFrame === copies - 1}
          className="w-10 h-10 rounded-full bg-[#5E84A0] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#5E84A0] transition-all"
        >
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Width Adjuster for Selected Frame */}
      <div className="bg-[#5E84A0]/70 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-semibold text-white">
            Breedte Kozijn {selectedFrame + 1}
          </span>
          <span className="text-[18px] font-black text-[#8D725C]">
            {Math.round(widths[selectedFrame] / 10)} cm
          </span>
        </div>
        
        {/* Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white">{KOZ_MIN / 10}cm</span>
          <input
            type="range"
            min={KOZ_MIN}
            max={KOZ_MAX}
            step={KOZ_STEP}
            value={widths[selectedFrame]}
            onChange={(e) => updateFrameWidth(selectedFrame, parseInt(e.target.value))}
            className="flex-1 h-2 bg-[#7BA0BC] rounded-full appearance-none cursor-pointer accent-[#8D725C]"
          />
          <span className="text-[11px] text-white">{KOZ_MAX / 10}cm</span>
        </div>
        
        {/* Quick Adjust Buttons */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => updateFrameWidth(selectedFrame, widths[selectedFrame] - KOZ_STEP)}
            disabled={widths[selectedFrame] <= KOZ_MIN}
            className="px-3 py-2 rounded-lg bg-[#5E84A0] text-white text-[12px] font-semibold hover:bg-[#5E84A0] disabled:opacity-30 transition-all"
          >
            -{KOZ_STEP / 10}cm
          </button>
          <button
            onClick={() => updateFrameWidth(selectedFrame, widths[selectedFrame] + KOZ_STEP)}
            disabled={widths[selectedFrame] >= KOZ_MAX}
            className="px-3 py-2 rounded-lg bg-[#5E84A0] text-white text-[12px] font-semibold hover:bg-[#5E84A0] disabled:opacity-30 transition-all"
          >
            +{KOZ_STEP / 10}cm
          </button>
        </div>
      </div>

      {/* Frame Overview */}
      <div className="bg-white/10 rounded-xl p-3">
        <span className="text-[11px] font-semibold text-white uppercase tracking-wider block mb-2">
          Overzicht alle kozijnen
        </span>
        <div className="flex flex-wrap gap-2">
          {widths.map((width, i) => (
            <button
              key={i}
              onClick={() => setSelectedFrame(i)}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                selectedFrame === i 
                  ? 'bg-[#8D725C] text-white' 
                  : 'bg-[#5E84A0] text-white hover:bg-[#5E84A0]'
              }`}
            >
              K{i + 1}: {Math.round(width / 10)}cm
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}