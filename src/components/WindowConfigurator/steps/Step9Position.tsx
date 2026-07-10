import { WindowConfig } from "../types.ts";
import { Switch } from "@/components/ui/switch";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

interface PositionOption {
  id: "voorzijde" | "achterzijde" | "linkerkant" | "rechterkant";
  title: string;
  description: string;
}

export function Step9Position({ config, onChange }: StepProps) {
  const options: PositionOption[] = [
    {
      id: "voorzijde",
      title: "Voorzijde",
      description: "Voor een dakkapel aan de voorkant is meestal een vergunning nodig. De specifieke regelgeving kan verschillen per gemeente."
    },
    {
      id: "achterzijde",
      title: "Achterzijde",
      description: "Voor een dakkapel aan de achterkant is meestal geen vergunning nodig, mits u voldoet aan de overige regelgeving."
    },
    {
      id: "linkerkant",
      title: "Linkerkant",
      description: "Gezien vanaf de voorkant van de woning. Als deze zijde grenst aan een openbare weg, is er doorgaans een vergunning nodig."
    },
    {
      id: "rechterkant",
      title: "Rechterkant",
      description: "Gezien vanaf de voorkant van de woning. Als deze zijde grenst aan een openbare weg, is er doorgaans een vergunning nodig."
    }
  ];

  const handleSelect = (id: PositionOption["id"]) => {
    onChange({ ...config, dormerPosition: id });
  };

  return (
    <div className="flex flex-col flex-1 px-2 pt-1 pb-4 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Side selection */}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = config.dormerPosition === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`
                group cursor-pointer rounded-[12px] p-4 transition-all duration-300 relative
                ${isSelected
                  ? "bg-[#8D725C]/20 border-2 border-[#8D725C] shadow-lg z-10"
                  : "bg-[#6E94B0] border border-white/10 hover:border-white/20"}
              `}
            >
              <div className="flex flex-col">
                <h3 className={`
                  text-[15px] font-black tracking-tight mb-1
                  ${isSelected ? "text-[#8D725C]" : "text-white"}
                `}>
                  {option.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-300 font-medium whitespace-normal">
                  {option.description}
                </p>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-start gap-3 font-black">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={config.demountExisting}
                        onCheckedChange={(checked) => onChange({ ...config, demountExisting: checked })}
                        className="data-[state=checked]:bg-[#8D725C] scale-90 origin-left border-2 border-[#8D725C] ring-1 ring-[#8D725C] ring-offset-2 ring-offset-[#6E94B0]"
                      />
                    </div>
                    <span className="text-[12px] text-white">
                      Demontage bestaande dakkapel
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}