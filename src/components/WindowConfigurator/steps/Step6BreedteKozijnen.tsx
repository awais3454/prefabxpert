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
const WANG_MIN = 200;
const WANG_MAX = 1000;
const WANG_STEP = 10;

// Default/fallback wang width — both Linkerwang and Rechterwang always share
// this ONE value (adjusting either one changes both), read from
// config.wangWidth now instead of being permanently fixed.
const WANG_WIDTH_DEFAULT = 190;

const MAX_PENANTEN = 3;

type KozijnType = "kozijn" | "gesloten";
type SashType = "draaikiep" | "vast";

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
  // windowCopies IS the kozijn count — DormerGeometry.tsx already consumes
  // windowCopies/windowWidths/spacings/kozijnTypes/etc generically for any
  // count, so no other file needs to change for this. penantCount is simply
  // derived from it (kozijnCount = penantCount + 1), no new config field
  // needed.
  const kozijnCount = Math.max(1, Math.min(MAX_PENANTEN + 1, config.windowCopies ?? 2));
  const penantCount = kozijnCount - 1;

  const widths: number[] = Array.from({ length: kozijnCount }, (_, i) =>
    config.windowWidths?.[i] ?? config.windowWidth ?? 1200
  );
  const penants: number[] = Array.from({ length: penantCount }, (_, i) =>
    config.spacings?.[i] ?? 300
  );
  const kozijnTypes: KozijnType[] = Array.from({ length: kozijnCount }, (_, i) =>
    (config.kozijnTypes?.[i] as KozijnType) ?? "kozijn"
  );
  const panelCounts: number[] = Array.from({ length: kozijnCount }, (_, i) =>
    config.kozijnPanelCounts?.[i] ?? 1
  );
  const sashTypes: SashType[] = Array.from({ length: kozijnCount }, (_, i) =>
    (config.kozijnSashTypes?.[i] as SashType) ?? "draaikiep"
  );

  const wangWidth: number = config.wangWidth ?? WANG_WIDTH_DEFAULT;
  const updateWangWidth = (value: number) => {
    onChange({ ...config, wangWidth: value });
  };

  // Dynamic tab list — Linkerwang, Kozijn 1, [Penant 1, Kozijn 2, ...], Rechterwang
  const elements = (() => {
    const els: { id: string; label: string }[] = [{ id: "linkerwang", label: "Linkerwang" }];
    for (let i = 0; i < kozijnCount; i++) {
      els.push({ id: `kozijn${i}`, label: `Kozijn ${i + 1}` });
      if (i < penantCount) els.push({ id: `penant${i}`, label: `Penant ${i + 1}` });
    }
    els.push({ id: "rechterwang", label: "Rechterwang" });
    return els;
  })();

  const [selected, setSelected] = useState<string>("kozijn0");
  // If the currently-selected tab no longer exists (e.g. penant count went
  // down), fall back to the first kozijn instead of showing a blank panel.
  const activeSelected = elements.some((e) => e.id === selected) ? selected : "kozijn0";

  const updatePenantCount = (newCount: number) => {
    const newKozijnCount = newCount + 1;
    // Resize every per-kozijn/per-penant array, preserving existing values
    // for indices that still exist and filling new ones with sensible
    // defaults — nothing the user already configured gets lost.
    const newWidths = Array.from({ length: newKozijnCount }, (_, i) => widths[i] ?? config.windowWidth ?? 1200);
    const newPenants = Array.from({ length: newCount }, (_, i) => penants[i] ?? 300);
    const newTypes = Array.from({ length: newKozijnCount }, (_, i) => kozijnTypes[i] ?? "kozijn");
    const newPanelCounts = Array.from({ length: newKozijnCount }, (_, i) => panelCounts[i] ?? 1);
    const newSashTypes = Array.from({ length: newKozijnCount }, (_, i) => sashTypes[i] ?? "draaikiep");
    const newPaneSashTypes = Array.from({ length: newKozijnCount }, (_, i) => config.kozijnPaneSashTypes?.[i] ?? []);

    onChange({
      ...config,
      windowCopies: newKozijnCount,
      windowWidths: newWidths,
      windowWidth: newWidths[0],
      spacings: newPenants,
      kozijnTypes: newTypes,
      kozijnPanelCounts: newPanelCounts,
      kozijnSashTypes: newSashTypes,
      kozijnPaneSashTypes: newPaneSashTypes as any,
    });
    setSelected("kozijn0");
  };

  const updateWidth = (index: number, value: number) => {
    const next = [...widths];
    next[index] = value;
    onChange({ ...config, windowWidths: next, windowWidth: next[0] });
  };

  const updatePenantWidth = (index: number, value: number) => {
    const next = [...penants];
    next[index] = value;
    onChange({ ...config, spacings: next });
  };

  const updateKozijnType = (index: number, type: KozijnType) => {
    const next = [...kozijnTypes];
    next[index] = type;
    onChange({ ...config, kozijnTypes: next as any });
  };

  const updatePanelCount = (index: number, count: number) => {
    const next = [...panelCounts];
    next[index] = count;
    onChange({ ...config, kozijnPanelCounts: next });
  };

  const updateSashType = (index: number, type: SashType) => {
    const next = [...sashTypes];
    next[index] = type;
    onChange({ ...config, kozijnSashTypes: next as any });
  };

  // Per-pane sash types (used when a kozijn has 2 or 3 vakken, so each
  // individual pane can independently be draai-/kiepraam or vast raam).
  const getPaneSashTypes = (index: number, count: number): SashType[] => {
    const existing = config.kozijnPaneSashTypes?.[index] ?? [];
    const result: SashType[] = [];
    for (let p = 0; p < count; p++) {
      result.push((existing[p] as SashType) ?? (p === 0 ? "draaikiep" : "vast"));
    }
    return result;
  };
  const updatePaneSashType = (index: number, paneIdx: number, type: SashType, count: number) => {
    const current = getPaneSashTypes(index, count);
    current[paneIdx] = type;
    const nextAll = Array.from({ length: kozijnCount }, (_, i) => config.kozijnPaneSashTypes?.[i] ?? []);
    nextAll[index] = current;
    onChange({ ...config, kozijnPaneSashTypes: nextAll as any });
  };

  // Total width: 2x wang (shared, adjustable) + all kozijnen + all penanten
  const totalWidth = wangWidth * 2
    + widths.reduce((s, w) => s + w, 0)
    + penants.reduce((s, p) => s + p, 0);

  const renderKozijnPanel = (index: number) => {
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
                {/* Single pane — one Type raam choice for the whole kozijn */}
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
    if (activeSelected === "linkerwang" || activeSelected === "rechterwang") {
      return (
        <div className="flex flex-col gap-3 py-2">
          <span className="text-[15px] font-black text-[#6E94B0] text-center">
            {activeSelected === "linkerwang" ? "Linkerwang" : "Rechterwang"}
          </span>
          <Stepper
            value={wangWidth}
            unit="mm"
            min={WANG_MIN}
            max={WANG_MAX}
            step={WANG_STEP}
            onDec={() => updateWangWidth(Math.max(WANG_MIN, wangWidth - WANG_STEP))}
            onInc={() => updateWangWidth(Math.min(WANG_MAX, wangWidth + WANG_STEP))}
          />
          <p className="text-[12px] text-[#6E94B0]/80 text-center max-w-[260px] mx-auto">
            Minimale breedte {WANG_MIN} mm. Linker- en rechterwang hebben altijd dezelfde breedte — het aanpassen van de ene kant past ook de andere kant aan.
          </p>
        </div>
      );
    }
    if (activeSelected.startsWith("kozijn")) {
      const idx = parseInt(activeSelected.replace("kozijn", ""), 10);
      return renderKozijnPanel(idx);
    }
    if (activeSelected.startsWith("penant")) {
      const idx = parseInt(activeSelected.replace("penant", ""), 10);
      const value = penants[idx];
      return (
        <div className="flex flex-col gap-3 py-2">
          <span className="text-[13px] font-semibold text-[#6E94B0] text-center">Breedte penant {idx + 1}</span>
          <Stepper
            value={value}
            unit="mm"
            min={PEN_MIN}
            max={PEN_MAX}
            step={PEN_STEP}
            onDec={() => updatePenantWidth(idx, Math.max(PEN_MIN, value - PEN_STEP))}
            onInc={() => updatePenantWidth(idx, Math.min(PEN_MAX, value + PEN_STEP))}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col flex-1 px-4 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      {/* Aantal penanten — determines how many kozijnen/penanten exist */}
      <div className="mb-4">
        <span className="text-[13px] font-semibold text-[#6E94B0] text-center block mb-2">Aantal penanten</span>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => updatePenantCount(n)}
              className={`rounded-[10px] border py-[10px] text-[12px] font-black tracking-tight transition-all duration-200 ${
                penantCount === n
                  ? "border-[#6E94B0] bg-[#6E94B0]/15 text-[#6E94B0]"
                  : "border-[#6E94B0]/25 bg-white text-[#6E94B0] hover:border-[#6E94B0]/40"
              }`}
            >
              {n === 0 ? "Geen" : `${n} penant${n > 1 ? "en" : ""}`}
            </button>
          ))}
        </div>
      </div>

      {/* Element selector — the number of tabs is dynamic (3 to 9 depending
          on Aantal penanten), so this scrolls horizontally rather than
          forcing a fixed grid that would get unreadably narrow with more
          items. */}
      <div className="flex flex-wrap items-center justify-center gap-1 mb-3">
        {elements.map((el) => {
          const isActive = activeSelected === el.id;
          return (
            <button
              key={el.id}
              onClick={() => setSelected(el.id)}
              className={`flex-shrink-0 rounded-[8px] border whitespace-nowrap transition-all duration-200 font-black tracking-tight ${
                elements.length > 7 ? "px-1.5 py-1 text-[9px]" : elements.length > 5 ? "px-2 py-1.5 text-[10px]" : "px-2.5 py-1.5 text-[11px]"
              } ${
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