import { WindowConfig } from "../types";
import { Check } from "lucide-react";
import { DAKKAPEL_COLORS, formatColorLabel } from "../utils/colors";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

interface Option {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  enabled: boolean;
  onToggle: () => void;
}

export function Step8Options({ config, onChange }: StepProps) {
  const options: Option[] = [
    {
      id: "vents",
      title: "Ventilatieroosters",
      description: "Zorgen voor gezonde luchtcirculatie, zonder tocht of open ramen.",
      priceLabel: "€215 per stuk",
      enabled: config.ventGrillEnabled,
      onToggle: () => onChange({ ...config, ventGrillEnabled: !config.ventGrillEnabled })
    },
    {
      id: "vents_bicolor",
      title: "Ventilatierooster Bi Color",
      description: "Ventilatierooster met twee kleuren voor een stijlvolle afwerking.",
      priceLabel: "€245 per stuk",
      enabled: config.ventGrillBiColor ?? false,
      onToggle: () => onChange({ ...config, ventGrillBiColor: !(config.ventGrillBiColor ?? false) })
    },
    {
      id: "insect_screens",
      title: "Horren",
      description: "Laten frisse lucht binnen, maar houden muggen en andere insecten buiten.",
      priceLabel: "€165 per stuk",
      enabled: config.insectScreenEnabled,
      onToggle: () => onChange({ ...config, insectScreenEnabled: !config.insectScreenEnabled })
    },
    {
      id: "shutters",
      title: "Rolluik",
      description: "Houden het in de zomer tot wel 10°C koeler en zorgen voor extra privacy en verduistering.",
      priceLabel: "€600 per meter",
      enabled: config.shutterEnabled,
      onToggle: () => onChange({ ...config, shutterEnabled: !config.shutterEnabled, shutterOpen: config.shutterEnabled ? config.shutterOpen : 33 })
    },
    {
      id: "screens_external",
      title: "Screens",
      description: "Buitenzonwering die warmte en licht tegenhoudt, voor een comfortabele binnentemperatuur.",
      priceLabel: "€700 per meter",
      enabled: config.externalScreensEnabled ?? false,
      onToggle: () => onChange({ ...config, externalScreensEnabled: !(config.externalScreensEnabled ?? false) })
    },
    {
      id: "afval",
      title: "Afval",
      description: "Wij nemen de afvalafvoer van uw oude dakkapel en bouwafval voor onze rekening.",
      priceLabel: "€140 per meter",
      enabled: config.afvalAfvoerenEnabled ?? false,
      onToggle: () => onChange({ ...config, afvalAfvoerenEnabled: !(config.afvalAfvoerenEnabled ?? false) })
    },
    {
      id: "triple_glas",
      title: "Trippel glas",
      description: "Driedubbel glas voor maximale isolatie en energiebesparing.",
      priceLabel: "€165 per raam",
      enabled: config.tripleGlasEnabled ?? false,
      onToggle: () => onChange({ ...config, tripleGlasEnabled: !(config.tripleGlasEnabled ?? false) })
    },
    {
      id: "skg_beslag",
      title: "SKG-beslag",
      description: "Extra veilig hang- en sluitwerk met SKG-keurmerk voor optimale inbraakwerendheid.",
      priceLabel: "",
      enabled: config.skgBeslagEnabled ?? false,
      onToggle: () => onChange({ ...config, skgBeslagEnabled: !(config.skgBeslagEnabled ?? false) })
    },
    {
      id: "ventilatiestand",
      title: "Ventilatiestand op de ramen",
      description: "Ramen met een ventilatiestand voor extra frisse lucht, ook wanneer het raam gesloten lijkt.",
      priceLabel: "",
      enabled: config.ventilatiestandEnabled ?? false,
      onToggle: () => onChange({ ...config, ventilatiestandEnabled: !(config.ventilatiestandEnabled ?? false) })
    }
  ];

  return (
    <div className="flex flex-col flex-1 px-4 pt-1 pb-6 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-0.5">
        {options.map((option) => (
          <div key={option.id}>
            <button
              onClick={option.onToggle}
              className="flex items-start gap-3 py-1.5 group text-left transition-colors hover:bg-black/[0.01] w-full"
            >
              <div className={`
                mt-0.5 w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center transition-all duration-200 flex-shrink-0
                ${option.enabled
                  ? "bg-[#8D725C] border-[#8D725C]"
                  : "bg-white/5 border-white/20 group-hover:border-white/30"}
              `}>
                {option.enabled && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[16px] font-black tracking-tight text-white leading-tight">
                    {option.title}
                  </h3>
                  {option.priceLabel && (
                    <span className="text-[12px] font-semibold text-[#8D725C] tracking-tight ml-2 flex-shrink-0">
                      {option.priceLabel}
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-tight text-slate-300 font-medium opacity-90">
                  {option.description}
                </p>
              </div>
            </button>

            {/* Rolluik (shutter) color picker — shown when Rolluik is enabled */}
            {option.id === "shutters" && option.enabled && (
              <div className="ml-7 mt-2 mb-3 flex flex-col gap-2">
                <p className="text-[12px] font-semibold text-slate-400 tracking-tight">Kleur rolluik:</p>
                <div className="flex flex-wrap gap-2">
                  {DAKKAPEL_COLORS.map((color) => {
                    const isSelected = (config.shutterColor ?? "").toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.id}
                        onClick={() => onChange({ ...config, shutterColor: color.hex })}
                        title={formatColorLabel(color)}
                        className={`w-[28px] h-[28px] rounded-full transition-all duration-200 flex items-center justify-center ${
                          isSelected ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#6E94B0]" : "hover:scale-105 border border-white/10"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}