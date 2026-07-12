import { WindowConfig } from "../types";
import { Ruler, Triangle, Settings, X } from "lucide-react";
import { useState } from "react";

interface DimensionsDisplayProps {
  config: WindowConfig;
}

const SIDE_CHEEK_TOTAL = 370; // 37cm total for both side cheeks (16cm + 4.4cm each side)

export function DimensionsDisplay({ config }: DimensionsDisplayProps) {
  // Default: hidden on mobile (< 640px), visible on desktop
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });

  const { windowWidths, windowCopies, spacings, pitchDeg } = config;
  
  // Calculate widths for each frame
  const copies = Math.max(1, windowCopies ?? 1);
  const widths: number[] = Array.from({ length: copies }, (_, i) =>
    windowWidths?.[i] ?? config.windowWidth
  );
  const panelSpacings: number[] = Array.from({ length: copies - 1 }, (_, i) =>
    spacings?.[i] ?? 200
  );
  
  // Calculate total width including side cheeks
  const totalFrameWidth = widths.reduce((s, w) => s + w, 0);
  const totalSpacing = panelSpacings.reduce((s, g) => s + g, 0);
  const totalWidth = totalFrameWidth + totalSpacing + SIDE_CHEEK_TOTAL;
  
  // Format cm from mm
  const formatCm = (mm: number) => Math.round(mm / 10);

  return (
    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex flex-col items-end gap-1.5 sm:gap-2">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFFFFF]/95 backdrop-blur-sm shadow-lg border border-[#6E94B0]/25 flex items-center justify-center text-[#6E94B0] hover:text-[#6E94B0] hover:border-[#6E94B0]/50 transition-all pointer-events-auto"
        title={isOpen ? "Verberg afmetingen" : "Toon afmetingen"}
      >
        {isOpen ? <X size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" /> : <Settings size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />}
      </button>

      {/* Dimensions Card - only show when open */}
      {isOpen && (
        <div className="bg-[#FFFFFF]/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-[#6E94B0]/25 p-2.5 sm:p-4 min-w-[150px] sm:min-w-[180px] pointer-events-auto max-w-[200px] sm:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-[#6E94B0]/25">
            <Ruler size={14} className="sm:w-4 sm:h-4 text-[#6E94B0]" strokeWidth={2.5} />
            <span className="text-[11px] sm:text-[13px] font-black text-[#6E94B0] uppercase tracking-wider">Afmetingen</span>
          </div>

          {/* Individual Frames */}
          <div className="space-y-1 sm:space-y-2">
            {widths.map((width, i) => (
              <div key={`frame-${i}`} className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[12px] font-semibold text-[#4A7593] truncate">
                  {copies > 1 ? `Kozijn ${i + 1}` : 'Kozijn'}
                </span>
                <span className="text-[11px] sm:text-[14px] font-black text-[#6E94B0] whitespace-nowrap">
                  {formatCm(width)} cm
                </span>
              </div>
            ))}

            {/* Panels/Penants between frames */}
            {panelSpacings.map((spacing, i) => (
              <div key={`panel-${i}`} className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[12px] font-semibold text-[#4A7593] truncate">
                  Penant {i + 1}
                </span>
                <span className="text-[11px] sm:text-[14px] font-black text-[#6E94B0] whitespace-nowrap">
                  {formatCm(spacing)} cm
                </span>
              </div>
            ))}

            {/* Side Cheeks */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[12px] font-semibold text-[#4A7593] truncate">2x zijwang</span>
              <span className="text-[11px] sm:text-[14px] font-black text-[#6E94B0] whitespace-nowrap">
                {formatCm(SIDE_CHEEK_TOTAL)} cm
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t-2 border-[#6E94B0]/25">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[13px] font-black text-[#6E94B0] uppercase tracking-tight truncate">Totaal</span>
              <span className="text-[14px] sm:text-[18px] font-black text-[#6E94B0] whitespace-nowrap">
                {formatCm(totalWidth)} cm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Roof Pitch Card - only show when open */}
      {isOpen && (
        <div className="bg-[#FFFFFF]/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-[#6E94B0]/25 p-2.5 sm:p-4 min-w-[150px] sm:min-w-[180px] pointer-events-auto max-w-[200px] sm:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Triangle size={14} className="sm:w-4 sm:h-4 text-[#6E94B0]" strokeWidth={2.5} />
            <span className="text-[11px] sm:text-[13px] font-black text-[#6E94B0] uppercase tracking-wider">Hellingshoek</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[12px] font-semibold text-[#4A7593] truncate">Dakhoek</span>
            <span className="text-[14px] sm:text-[18px] font-black text-[#6E94B0] whitespace-nowrap">
              {pitchDeg}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}