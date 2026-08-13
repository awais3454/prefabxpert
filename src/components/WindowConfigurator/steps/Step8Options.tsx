import { WindowConfig } from "../types";
import { Check } from "lucide-react";
import { DAKKAPEL_COLORS, formatColorLabel } from "../utils/colors";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
  onAddDormer?: () => void;
  onReset?: () => void;
}

interface Option {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  enabled: boolean;
  onToggle: () => void;
}

// Fixed side wall width, same value used in Step6BreedteKozijnen — kept here
// so the per-meter Rolluik/Screens estimate can use the real dormer width.
const WANG_WIDTH = 190;
const SOMFY_MOTOR_SPAN_MM = 3800;

export function Step8Options({ config, onChange, onAddDormer, onReset }: StepProps) {
  // ── Derived values from the existing configurator state ──────────────────
  // Used to auto-calculate m², window count, and dormer width for the
  // options below, instead of asking the user to enter them again.
  const windowCopies = Math.max(1, config.windowCopies ?? 1);
  const widths: number[] = config.windowWidths?.length === windowCopies
    ? config.windowWidths
    : Array.from({ length: windowCopies }, () => config.windowWidth);

  // Approximate window opening height (mm), same formula used in DormerGeometry.
  const openingHeightMm = Math.max(config.windowHeight - (40 + config.lintelLevel) - 40, 0);
  const openingHeightM = openingHeightMm / 1000;

  const totalGlassAreaM2 = widths.reduce((sum, w) => sum + (w / 1000) * openingHeightM, 0);

  const spacingsSum = (config.spacings ?? []).slice(0, Math.max(0, windowCopies - 1)).reduce((s, v) => s + v, 0);
  const dormerWidthMm = WANG_WIDTH * 2 + widths.reduce((s, w) => s + w, 0) + spacingsSum;
  const dormerWidthM = dormerWidthMm / 1000;
  const somfyMotorCount = Math.max(1, Math.ceil(dormerWidthMm / SOMFY_MOTOR_SPAN_MM));

  const options: Option[] = [
    {
      id: "vents",
      title: "Ventilatierooster",
      description: "Ventilatieroosters in één kleur, gelijk aan de kleur van het kozijn, mits het kozijn aan beide zijden dezelfde kleur heeft.",
      priceLabel: "€215",
      enabled: config.ventGrillEnabled,
      onToggle: () => onChange({ ...config, ventGrillEnabled: !config.ventGrillEnabled })
    },
    {
      id: "vents_bicolor",
      title: "Ventilatierooster Bi-color",
      description: "Ventilatierooster uitgevoerd in twee verschillende kleuren, afgestemd op de binnen en buitenkleur van het kozijn.",
      priceLabel: "€289",
      enabled: config.ventGrillBiColor ?? false,
      onToggle: () => onChange({ ...config, ventGrillBiColor: !(config.ventGrillBiColor ?? false) })
    },
    {
      // Placed directly below the ventilation grille options, as requested.
      id: "ventilatiestand",
      title: "Ventilatiestand op de draai-kiepramen",
      description: "Ramen met een ventilatiestand voor extra frisse lucht, ook wanneer het raam gesloten lijkt.",
      priceLabel: "€79 per raam",
      enabled: config.ventilatiestandEnabled ?? false,
      onToggle: () => onChange({ ...config, ventilatiestandEnabled: !(config.ventilatiestandEnabled ?? false) })
    },
    {
      id: "insect_screens",
      title: "Inzet klikhorren",
      description: "Laten frisse lucht binnen, maar houden muggen en andere insecten buiten.",
      priceLabel: "€120",
      enabled: config.insectScreenEnabled,
      onToggle: () => onChange({ ...config, insectScreenEnabled: !config.insectScreenEnabled })
    },
    {
      id: "rolluik_voorbereiding",
      title: "Voorbereiding rolluik",
      description: "Met deze optie blijft het altijd mogelijk om op een later moment een rolluik te laten plaatsen.",
      priceLabel: "€299",
      enabled: config.rolluikVoorbereidingEnabled ?? false,
      onToggle: () => onChange({ ...config, rolluikVoorbereidingEnabled: !(config.rolluikVoorbereidingEnabled ?? false) })
    },
    {
      id: "shutters",
      title: "Ingebouwde rolluik met Somfy motoren",
      description: `€289 per meter · Somfy motor €289 per max. ${SOMFY_MOTOR_SPAN_MM} mm (geschat ${somfyMotorCount} motor${somfyMotorCount > 1 ? "en" : ""} voor ${dormerWidthM.toFixed(2)} m breedte)`,
      priceLabel: "",
      enabled: config.shutterEnabled,
      onToggle: () => onChange({ ...config, shutterEnabled: !config.shutterEnabled, shutterOpen: config.shutterEnabled ? config.shutterOpen : 33 })
    },
    {
      id: "screens_external",
      title: "Screens",
      description: `€389 per meter · Somfy motor €289 per max. ${SOMFY_MOTOR_SPAN_MM} mm (geschat ${somfyMotorCount} motor${somfyMotorCount > 1 ? "en" : ""} voor ${dormerWidthM.toFixed(2)} m breedte)`,
      priceLabel: "",
      enabled: config.externalScreensEnabled ?? false,
      onToggle: () => onChange({ ...config, externalScreensEnabled: !(config.externalScreensEnabled ?? false) })
    },
    {
      id: "afval",
      title: "Bouwafval afvoeren",
      description: "Wij nemen het bouwafval voor onze rekening.",
      priceLabel: "€140 per meter dakkapel",
      enabled: config.afvalAfvoerenEnabled ?? false,
      onToggle: () => onChange({ ...config, afvalAfvoerenEnabled: !(config.afvalAfvoerenEnabled ?? false) })
    },
    // "Demonteren oude dakkapel" removed here — it already lives under
    // "Positie dakkapel" (config.demountExisting), so it isn't duplicated.
    {
      id: "triple_glas",
      title: "Trippel glas",
      description: `Driedubbel glas voor maximale isolatie en energiebesparing. Automatisch berekend: ≈${totalGlassAreaM2.toFixed(2)} m² (${windowCopies} raam${windowCopies > 1 ? "en" : ""}).`,
      priceLabel: "€90 per m²",
      enabled: config.tripleGlasEnabled ?? false,
      onToggle: () => onChange({ ...config, tripleGlasEnabled: !(config.tripleGlasEnabled ?? false) })
    },
    {
      id: "skg_beslag",
      title: "SKG-beslag",
      description: `Extra veilig hang- en sluitwerk met SKG-keurmerk. Automatisch berekend voor ${windowCopies} raam${windowCopies > 1 ? "en" : ""}.`,
      priceLabel: "€58 per raam",
      enabled: config.skgBeslagEnabled ?? false,
      onToggle: () => onChange({ ...config, skgBeslagEnabled: !(config.skgBeslagEnabled ?? false) })
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
                  ? "bg-[#6E94B0] border-[#6E94B0]"
                  : "bg-white/5 border-[#6E94B0]/40 group-hover:border-[#6E94B0]/60"}
              `}>
                {option.enabled && <Check className="w-3.5 h-3.5 text-[#6E94B0] stroke-[4]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[16px] font-black tracking-tight text-[#6E94B0] leading-tight">
                    {option.title}
                  </h3>
                  {option.priceLabel && (
                    <span className="text-[12px] font-semibold text-[#6E94B0] tracking-tight ml-2 flex-shrink-0">
                      {option.priceLabel}
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-tight text-[#5E84A0] font-medium opacity-90">
                  {option.description}
                </p>
              </div>
            </button>

            {/* Rolluik (shutter) color picker + Somfy sub-options — shown when enabled */}
            {option.id === "shutters" && option.enabled && (
              <div className="ml-7 mt-2 mb-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] font-semibold text-[#7BA0BC] tracking-tight">Kleur rolluik:</p>
                  <div className="flex flex-wrap gap-2">
                    {DAKKAPEL_COLORS.map((color) => {
                      const isSelected = (config.shutterColor ?? "").toLowerCase() === color.hex.toLowerCase();
                      return (
                        <button
                          key={color.id}
                          onClick={() => onChange({ ...config, shutterColor: color.hex })}
                          title={formatColorLabel(color)}
                          className={`w-[28px] h-[28px] rounded-full transition-all duration-200 flex items-center justify-center ${
                            isSelected ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#FFFFFF]" : "hover:scale-105 border border-[#6E94B0]/25"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      );
                    })}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.rolluikAfstandsbediening ?? false}
                    onChange={() => onChange({ ...config, rolluikAfstandsbediening: !(config.rolluikAfstandsbediening ?? false) })}
                    className="w-[16px] h-[16px] accent-[#6E94B0]"
                  />
                  <span className="text-[13px] font-semibold text-[#6E94B0]">Afstandsbediening — €85</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.rolluikMotorenKoppelen ?? false}
                    onChange={() => onChange({ ...config, rolluikMotorenKoppelen: !(config.rolluikMotorenKoppelen ?? false) })}
                    className="w-[16px] h-[16px] accent-[#6E94B0]"
                  />
                  <span className="text-[13px] font-semibold text-[#6E94B0]">Motoren koppelen — €150</span>
                </label>
              </div>
            )}

            {/* Screens Somfy sub-options — same pattern as the rolluik */}
            {option.id === "screens_external" && option.enabled && (
              <div className="ml-7 mt-2 mb-3 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.screensAfstandsbediening ?? false}
                    onChange={() => onChange({ ...config, screensAfstandsbediening: !(config.screensAfstandsbediening ?? false) })}
                    className="w-[16px] h-[16px] accent-[#6E94B0]"
                  />
                  <span className="text-[13px] font-semibold text-[#6E94B0]">Afstandsbediening — €85</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.screensMotorenKoppelen ?? false}
                    onChange={() => onChange({ ...config, screensMotorenKoppelen: !(config.screensMotorenKoppelen ?? false) })}
                    className="w-[16px] h-[16px] accent-[#6E94B0]"
                  />
                  <span className="text-[13px] font-semibold text-[#6E94B0]">Motoren koppelen — €150</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom action buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#6E94B0]/20">
        <button
          onClick={() => onAddDormer?.()}
          className="rounded-[12px] border border-[#6E94B0] bg-white py-[12px] px-[10px] text-[13px] font-black tracking-tight text-[#6E94B0] transition-all duration-200 hover:bg-[#6E94B0]/10"
        >
          Extra dakkapel toevoegen
        </button>
        <button
          onClick={() => onReset?.()}
          className="rounded-[12px] py-[12px] px-[10px] text-[13px] font-black tracking-tight text-white bg-[#6E94B0] transition-all duration-200 hover:bg-[#5E84A0]"
        >
          Opnieuw beginnen
        </button>
      </div>
    </div>
  );
}