import { useState } from "react";
import { WindowConfig } from "../types";
import { Minus, Plus } from "lucide-react";

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

// Fixed side wall (wang) width — not user-editable.
const WANG_WIDTH = 190;

type ElementId = "linkerwang" | "kozijn1" | "penant" | "kozijn2" | "rechterwang";

const ELEMENTS: { id: ElementId; label: string }[] = [
  { id: "linkerwang", label: "Linkerwang" },
  { id: "kozijn1", label: "Kozijn 1" },
  { id: "penant", label: "Penant" },
  { id: "kozijn2", label: "Kozijn 2" },
  { id: "rechterwang", label: "Rechterwang" },
];

function Stepper({
  value, unit, min, max, step, onDec, onInc,
}: {
  value: number; unit: string; min: number; max: number; step: number;
  onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-8">
      <button
        onClick={onDec}
        disabled={value <= min}
        className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
      >
        <Minus size={14} strokeWidth={3} />
      </button>
      <div className="text-[17px] font-black text-[#6E94B0] min-w-[90px] text-center select-none tracking-tight">
        {Math.round(value)} {unit}
      </div>
      <button
        onClick={onInc}
        disabled={value >= max}
        className="w-[42px] h-[42px] rounded-full bg-white shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all disabled:opacity-30 border border-zinc-100 hover:border-zinc-200 focus:outline-none"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
}

export function Step6BreedteKozijnen({ config, onChange }: StepProps) {
  const [selected, setSelected] = useState<ElementId>("kozijn1");

  const widths: number[] = [config.windowWidths?.[0] ?? config.windowWidth, config.windowWidths?.[1] ?? config.windowWidth];
  const penant: number = config.spacings?.[0] ?? 300;
  const kozijnTypes: ("kozijn" | "gesloten")[] = config.kozijnTypes ?? ["kozijn", "kozijn"];

  const updateWidth = (index: 0 | 1, value: number) => {
    const next = [...widths];
    next[index] = value;
    onChange({ ...config, windowWidths: next, windowWidth: next[0] });
  };

  const updatePenant = (value: number) => {
    onChange({ ...config, spacings: [value] });
  };

  const updateKozijnType = (index: 0 | 1, type: "kozijn" | "gesloten") => {
    const next = [...kozijnTypes] as ("kozijn" | "gesloten")[];
    next[index] = type;
    onChange({ ...config, kozijnTypes: next });
  };

  const panelCounts: number[] = [config.kozijnPanelCounts?.[0] ?? 1, config.kozijnPanelCounts?.[1] ?? 1];
  const updatePanelCount = (index: 0 | 1, count: number) => {
    const next = [...(config.kozijnPanelCounts ?? [null, null])];
    next[index] = count;
    onChange({ ...config, kozijnPanelCounts: next });
  };

  const sashTypes: ("draaikiep" | "vast")[] = config.kozijnSashTypes ?? ["draaikiep", "draaikiep"];
  const updateSashType = (index: 0 | 1, type: "draaikiep" | "vast") => {
    const next = [...sashTypes] as ("draaikiep" | "vast")[];
    next[index] = type;
    onChange({ ...config, kozijnSashTypes: next });
  };

  // Per-pane sash types (used when a kozijn has 2 or 3 vakken, so each
  // individual pane can independently be draai-/kiepraam or vast raam).
  const getPaneSashTypes = (index: 0 | 1, count: number): ("draaikiep" | "vast")[] => {
    const existing = config.kozijnPaneSashTypes?.[index] ?? [];
    const result: ("draaikiep" | "vast")[] = [];
    for (let p = 0; p < count; p++) {
      result.push(existing[p] ?? (p === 0 ? "draaikiep" : "vast"));
    }
    return result;
  };
  const updatePaneSashType = (index: 0 | 1, paneIdx: number, type: "draaikiep" | "vast", count: number) => {
    const current = getPaneSashTypes(index, count);
    current[paneIdx] = type;
    const nextAll = [config.kozijnPaneSashTypes?.[0] ?? [], config.kozijnPaneSashTypes?.[1] ?? []];
    nextAll[index] = current;
    onChange({ ...config, kozijnPaneSashTypes: nextAll as ("draaikiep" | "vast")[][] });
  };

  // Total width: 2x wang (fixed) + kozijn1 + penant + kozijn2
  const totalWidth = WANG_WIDTH * 2 + widths[0] + penant + widths[1];

  const renderKozijnPanel = (index: 0 | 1) => {
    const label = index === 0 ? "Kozijn 1" : "Kozijn 2";
    const width = widths[index];
    const type = kozijnTypes[index];

    return (
      <div className="flex flex-col gap-4">
        {/* Type toggle: Kozijn vs Gesloten paneel */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateKozijnType(index, "kozijn")}
            className={`rounded-[12px] border py-[10px] px-[14px] transition-all duration-200 text-[14px] font-black tracking-tight ${
              type === "kozijn"
                ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
            }`}
          >
            Kozijn
          </button>
          <button
            onClick={() => updateKozijnType(index, "gesloten")}
            className={`rounded-[12px] border py-[10px] px-[14px] transition-all duration-200 text-[14px] font-black tracking-tight ${
              type === "gesloten"
                ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
            }`}
          >
            Gesloten paneel
          </button>
        </div>

        {/* Width stepper — label depends on type */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[#6E94B0] text-center">
            {type === "gesloten" ? "Breedte gesloten paneel" : "Breedte kozijn"}
          </span>
          <Stepper
            value={width}
            unit="mm"
            min={KOZ_MIN}
            max={KOZ_MAX}
            step={KOZ_STEP}
            onDec={() => updateWidth(index, Math.max(KOZ_MIN, width - KOZ_STEP))}
            onInc={() => updateWidth(index, Math.min(KOZ_MAX, width + KOZ_STEP))}
          />
        </div>

        {/* Window-only options (hidden for gesloten paneel) */}
        {type === "kozijn" && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#6E94B0] text-center">Raamindeling</span>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => updatePanelCount(index, n)}
                  className={`rounded-[10px] border py-[10px] text-[13px] font-black tracking-tight transition-all duration-200 ${
                    panelCounts[index] === n
                      ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                      : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
                  }`}
                >
                  {n} {n === 1 ? "vak" : "vakken"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#6E94B0]/70 text-center mt-1">
              Bij 1 vak: draai-/kiepraam. Bij 2 of meer vakken: kies per raam afzonderlijk.
            </p>

            {panelCounts[index] === 1 ? (
              <>
                {/* Single pane — one Type raam choice for the whole kozijn (unchanged) */}
                <span className="text-[13px] font-semibold text-[#6E94B0] text-center mt-2">Type raam</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSashType(index, "draaikiep")}
                    className={`rounded-[10px] border py-[10px] text-[13px] font-black tracking-tight transition-all duration-200 ${
                      sashTypes[index] === "draaikiep"
                        ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                        : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
                    }`}
                  >
                    Draai-/kiepraam
                  </button>
                  <button
                    onClick={() => updateSashType(index, "vast")}
                    className={`rounded-[10px] border py-[10px] text-[13px] font-black tracking-tight transition-all duration-200 ${
                      sashTypes[index] === "vast"
                        ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                        : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
                    }`}
                  >
                    Vast raam
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 2 or 3 vakken — each individual pane gets its own choice */}
                <span className="text-[13px] font-semibold text-[#6E94B0] text-center mt-2">Type raam per vak</span>
                {getPaneSashTypes(index, panelCounts[index]).map((paneType, paneIdx) => (
                  <div key={paneIdx} className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-[#6E94B0]/80 text-center">Raam {paneIdx + 1}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updatePaneSashType(index, paneIdx, "draaikiep", panelCounts[index])}
                        className={`rounded-[10px] border py-[8px] text-[12px] font-black tracking-tight transition-all duration-200 ${
                          paneType === "draaikiep"
                            ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                            : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
                        }`}
                      >
                        Draai-/kiepraam
                      </button>
                      <button
                        onClick={() => updatePaneSashType(index, paneIdx, "vast", panelCounts[index])}
                        className={`rounded-[10px] border py-[8px] text-[12px] font-black tracking-tight transition-all duration-200 ${
                          paneType === "vast"
                            ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                            : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
                        }`}
                      >
                        Vast raam
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (selected) {
      case "linkerwang":
      case "rechterwang":
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="text-[15px] font-black text-[#6E94B0]">
              {selected === "linkerwang" ? "Linkerwang" : "Rechterwang"}
            </span>
            <div className="text-[17px] font-black text-[#6E94B0]">{WANG_WIDTH} mm</div>
            <p className="text-[12px] text-[#6E94B0]/80 text-center max-w-[260px]">
              Vaste breedte van {WANG_WIDTH} mm. Deze zijwang kan niet worden verwijderd of kleiner gemaakt, en wordt automatisch meegerekend in de totale breedte.
            </p>
          </div>
        );
      case "kozijn1":
        return renderKozijnPanel(0);
      case "penant":
        return (
          <div className="flex flex-col gap-3 py-2">
            <span className="text-[13px] font-semibold text-[#6E94B0] text-center">Breedte penant</span>
            <Stepper
              value={penant}
              unit="mm"
              min={PEN_MIN}
              max={PEN_MAX}
              step={PEN_STEP}
              onDec={() => updatePenant(Math.max(PEN_MIN, penant - PEN_STEP))}
              onInc={() => updatePenant(Math.min(PEN_MAX, penant + PEN_STEP))}
            />
          </div>
        );
      case "kozijn2":
        return renderKozijnPanel(1);
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 px-4 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      {/* Element selector — fixed left-to-right order */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
        {ELEMENTS.map((el) => {
          const isActive = selected === el.id;
          return (
            <button
              key={el.id}
              onClick={() => setSelected(el.id)}
              className={`flex-shrink-0 rounded-[10px] border px-3 py-2 text-[11px] font-black tracking-tight whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                  : "border-[#6E94B0]/20 bg-white text-[#6E94B0]/70 hover:border-[#6E94B0]/40"
              }`}
            >
              {el.label}
            </button>
          );
        })}
      </div>

      {/* Only the selected element's settings are shown */}
      <div className="rounded-[16px] bg-[#F0F0F0] p-4 min-h-[160px] flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Real-time total width */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#6E94B0]/20">
        <span className="text-[15px] font-black text-[#6E94B0] tracking-tight">Totale breedte</span>
        <span className="text-[16px] font-black text-[#6E94B0] tracking-tight">{Math.round(totalWidth)} mm</span>
      </div>
    </div>
  );
}