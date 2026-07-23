import { WindowConfig } from "../types";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function Step6Cladding({ config, onChange }: StepProps) {
  const options = [
    {
      id: "hpl",
      title: "Gladde voorzijde",
      description: "Een strakke, volledig gladde voorzijde zonder rabatprofiel. Zorgt voor een moderne en minimalistische uitstraling.",
    },
    {
      id: "rondkantpanelen",
      title: "Rabatprofiel",
      description: "De voorzijde krijgt dezelfde rabatstrepen als de zijwangen van de dakkapel, voor een traditionele, samenhangende uitstraling.",
    }
  ];

  return (
    <div className="flex flex-col flex-1 px-0 pt-2 pb-2 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 step-6-cladding-container overflow-hidden">

      <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-0 pb-2 custom-scrollbar">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange({ ...config, claddingMaterial: option.id as any })}
            className={`
              flex flex-col items-start gap-1 rounded-[12px] border py-[12px] px-[18px] text-left transition-all duration-200
              ${config.claddingMaterial === option.id
                ? "border-[#6E94B0] bg-[#6E94B0]/10 shadow-md"
                : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-[16px] font-black tracking-tighter ${config.claddingMaterial === option.id ? "text-[#6E94B0]" : "text-[#6E94B0]"}`}>
                {option.title}
              </span>
              {(option as any).priceLabel && (
                <span className="text-[12px] font-semibold text-[#6E94B0] tracking-tight">
                  {(option as any).priceLabel}
                </span>
              )}
            </div>
            <p className="text-[14px] leading-tight text-[#5E84A0] font-medium opacity-90">
              {option.description}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
}