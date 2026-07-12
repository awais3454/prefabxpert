import { WindowConfig } from "../types";
interface StepProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function Step1Type({ config, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-6 w-full mx-auto pt-1 sm:pt-4 mb-1 sm:mb-3">
      <div className="grid grid-cols-2 gap-2">
        {/* Traditioneel Card */}
        <button
          onClick={() => onChange({ ...config, styleType: "traditional" })}
          className={`flex flex-col items-center justify-between rounded-2xl border-2 p-2 pb-2 transition-all shadow-sm w-full h-[105px] sm:h-[180px] ${config.styleType === "traditional"
            ? "border-[#6E94B0] bg-[#FFFFFF]"
            : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
            }`}
        >
          <div className="w-full flex-1 flex items-center justify-center mb-2 overflow-hidden">
            <img
              src="/images/base.png"
              alt="Traditioneel"
              className="w-full h-full object-contain transform scale-123"
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[13px] sm:text-[17px] font-bold tracking-tight ${config.styleType === "traditional" ? "text-[#6E94B0]" : "text-[#4A7593]"
              }`}>
              Traditioneel
            </span>
            <span className="text-[11px] font-black text-[#6E94B0]">Inbegrepen</span>
          </div>
        </button>

        {/* Kader Card */}
        <button
          onClick={() => onChange({ ...config, styleType: "kader" })}
          className={`flex flex-col items-center justify-between rounded-2xl border-2 p-2 pb-2 transition-all shadow-sm w-full h-[105px] sm:h-[180px] ${config.styleType === "kader"
            ? "border-[#6E94B0] bg-[#FFFFFF]"
            : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
            }`}
        >
          <div className="w-full flex-1 flex items-center justify-center mb-2 overflow-hidden">
            <img
              src="/images/kader.png"
              alt="Kader"
              className="w-full h-full object-contain transform scale-123"
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className={`text-[13px] sm:text-[17px] font-bold tracking-tight ${config.styleType === "kader" ? "text-[#6E94B0]" : "text-[#4A7593]"
              }`}>
              Kader
            </span>
          </div>
        </button>
      </div>

      {/* Dakpankleur — roof tile color */}
      <div className="flex flex-col gap-2 mt-1">
        <h3 className="text-[13px] sm:text-[15px] font-black text-[#6E94B0] tracking-tight">Dakpankleur</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange({ ...config, roofTileColor: "antraciet" })}
            className={`flex items-center gap-2 rounded-[12px] border py-[10px] px-[14px] transition-all duration-200 ${
              config.roofTileColor === "antraciet"
                ? "border-[#6E94B0] bg-[#6E94B0]/20"
                : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-[#6E94B0]/40 flex-shrink-0" style={{ backgroundColor: "#2a2a2a" }} />
            <span className={`text-[14px] font-black tracking-tight ${config.roofTileColor === "antraciet" ? "text-[#6E94B0]" : "text-[#6E94B0]"}`}>
              Antraciet
            </span>
          </button>
          <button
            onClick={() => onChange({ ...config, roofTileColor: "rood" })}
            className={`flex items-center gap-2 rounded-[12px] border py-[10px] px-[14px] transition-all duration-200 ${
              config.roofTileColor === "rood"
                ? "border-[#6E94B0] bg-[#6E94B0]/20"
                : "border-[#6E94B0]/25 bg-[#FFFFFF] hover:border-[#6E94B0]/40"
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-[#6E94B0]/40 flex-shrink-0" style={{ backgroundColor: "#E07A3E" }} />
            <span className={`text-[14px] font-black tracking-tight ${config.roofTileColor === "rood" ? "text-[#6E94B0]" : "text-[#6E94B0]"}`}>
              Rood
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}