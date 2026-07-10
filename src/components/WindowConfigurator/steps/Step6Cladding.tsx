import { WindowConfig } from "../types";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function Step6Cladding({ config, onChange }: StepProps) {
  const options = [
    {
      id: "rondkantpanelen",
      title: "Keralit",
      description: "Keralit is een duurzaam en onderhoudsarm merk voor kunststof gevel- en dakrandpanelen.",
    },
    {
      id: "hpl",
      title: "Hpl (high pressure laminate)",
      description: "Hpl is een kwalitatief materiaal met een gladde afwerking, voor een minimalistische uitstraling. Dit materiaal is extreem duurzaam en onderhoudsarm.",
      priceLabel: "+ €450",
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
                ? "border-[#8D725C] bg-[#8D725C]/10 shadow-md"
                : "border-white/10 bg-[#6E94B0] hover:border-white/20"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-[16px] font-black tracking-tighter ${config.claddingMaterial === option.id ? "text-[#8D725C]" : "text-white"}`}>
                {option.title}
              </span>
              {(option as any).priceLabel && (
                <span className="text-[12px] font-semibold text-white tracking-tight">
                  {(option as any).priceLabel}
                </span>
              )}
            </div>
            <p className="text-[14px] leading-tight text-slate-300 font-medium opacity-90">
              {option.description}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
}