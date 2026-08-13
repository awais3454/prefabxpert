import { WindowConfig } from "../types";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function StepDaktrim({ config, onChange }: StepProps) {
  const options = [
    {
      id: "daktrim",
      title: "Daktrim",
      description: "Een strakke, platte afwerking bovenop de boei.",
    },
    {
      id: "dakkraal",
      title: "Dakkraal",
      description: "Een ronde aluminium afwerking bovenop de boei.",
    }
  ];

  const selected = config.trimType ?? "daktrim";

  return (
    <div className="flex flex-col flex-1 px-0 pt-2 pb-2 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-0 pb-2 custom-scrollbar">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange({ ...config, trimType: option.id as any })}
            className={`
              flex flex-col items-start gap-1 rounded-[12px] border py-[12px] px-[18px] text-left transition-all duration-200
              ${selected === option.id
                ? "border-[#6E94B0] bg-[#6E94B0]/10 shadow-md"
                : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
              }
            `}
          >
            <span className="text-[16px] font-black tracking-tighter text-[#6E94B0]">
              {option.title}
            </span>
            <p className="text-[14px] leading-tight text-[#5E84A0] font-medium opacity-90">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}