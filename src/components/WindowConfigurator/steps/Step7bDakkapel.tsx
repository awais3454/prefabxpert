import { WindowConfig } from "../types";

interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function Step7bDakkapel({ config, onChange }: StepProps) {
  const dakbedekkingOptions = [
    { id: "bitumen", title: "Bitumen" },
    { id: "epdm", title: "EPDM" },
  ];

  const aansluitingOptions = [
    { id: "lood", title: "Lood" },
    { id: "loodvervanger", title: "Loodvervanger" },
  ];

  return (
    <div className="flex flex-col flex-1 px-6 pt-2 pb-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">

      {/* Vraag 1: Dakbedekking */}
      <div className="flex flex-col gap-2 mb-5">
        <h3 className="text-[16px] font-black text-[#1A1A1A] tracking-tight mb-1">Dakbedekking</h3>
        <div className="grid grid-cols-2 gap-2">
          {dakbedekkingOptions.map((option) => {
            const isSelected = config.roofCovering === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange({ ...config, roofCovering: option.id as any })}
                className={`
                  flex items-center justify-center rounded-[12px] border py-[16px] px-[18px] text-center transition-all duration-200
                  ${isSelected
                    ? "border-[#1A1A1A] bg-[#1A1A1A]/10 shadow-md"
                    : "border-black/10 bg-[#FFFFFF] hover:border-black/20"
                  }
                `}
              >
                <span className={`text-[15px] font-black tracking-tight ${isSelected ? "text-[#1A1A1A]" : "text-[#1A1A1A]"}`}>
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vraag 2: Aansluiting pannendak */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-black text-[#1A1A1A] tracking-tight mb-1">Aansluiting pannendak</h3>
        <div className="grid grid-cols-2 gap-2">
          {aansluitingOptions.map((option) => {
            const isSelected = config.roofConnection === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange({ ...config, roofConnection: option.id as any })}
                className={`
                  flex items-center justify-center rounded-[12px] border py-[16px] px-[18px] text-center transition-all duration-200
                  ${isSelected
                    ? "border-[#1A1A1A] bg-[#1A1A1A]/10 shadow-md"
                    : "border-black/10 bg-[#FFFFFF] hover:border-black/20"
                  }
                `}
              >
                <span className={`text-[15px] font-black tracking-tight ${isSelected ? "text-[#1A1A1A]" : "text-[#1A1A1A]"}`}>
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}