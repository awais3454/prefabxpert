import { WindowConfig } from "../types";
import {
  DAKKAPEL_COLORS,
  KOZIJN_COLORS,
  RalColorOption,
  findColorByHex,
  formatColorLabel,
} from "../utils/colors";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

const LIGHT_COLOR_IDS = new Set(["9010", "9001"]);

const ColorSection = ({
  title,
  value,
  colors,
  onSelect,
}: {
  title: string;
  value: string;
  colors: RalColorOption[];
  onSelect: (hex: string) => void;
}) => {
  const activeColor = findColorByHex(value, colors) ?? colors[0];

  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-black text-white tracking-tighter">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-300 tracking-tight">
            {formatColorLabel(activeColor)}
          </span>
          <div
            className="w-5 h-5 rounded-full shadow-sm border border-white/10"
            style={{ backgroundColor: activeColor.hex }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-2">
        {colors.map((color) => {
          const isSelected = color.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color.hex)}
              className={`
                w-[32px] h-[32px] rounded-full transition-all duration-200 relative group flex items-center justify-center
                ${isSelected ? "scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-[#6E94B0]" : "hover:scale-105 border border-white/10"}
              `}
              style={{ backgroundColor: color.hex }}
              title={formatColorLabel(color)}
            >
              {isSelected && (
                <div className={`
                  w-full h-full rounded-full border-[7px]
                  ${LIGHT_COLOR_IDS.has(color.id)
                    ? "border-[#363C41]"
                    : "border-white/90"}
                `} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function Step7Colors({ config, onChange }: StepProps) {
  return (
    <div className="flex flex-col flex-1 px-8 pt-2 pb-6 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ColorSection
        title="Voorkant en zijwangen"
        colors={DAKKAPEL_COLORS}
        value={config.frontColor}
        onSelect={(hex) => onChange({ ...config, frontColor: hex, sideColor: hex })}
      />

      <ColorSection
        title="Boei of overstek"
        colors={DAKKAPEL_COLORS}
        value={config.fasciaColor}
        onSelect={(hex) => onChange({ ...config, fasciaColor: hex })}
      />

      <ColorSection
        title="Kozijn"
        colors={KOZIJN_COLORS}
        value={config.frameColor}
        onSelect={(hex) => onChange({ ...config, frameColor: hex })}
      />

      <ColorSection
        title="Draaikiepraam"
        colors={KOZIJN_COLORS}
        value={config.sashColor}
        onSelect={(hex) => onChange({ ...config, sashColor: hex })}
      />

    </div>
  );
}