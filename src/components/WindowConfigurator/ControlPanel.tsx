import { WindowConfig } from "./types.ts";
import { Step1Type } from "./steps/Step1Type.tsx";
import { Step2Pitch } from "./steps/Step2Pitch.tsx";
import { Step3Dimensions } from "./steps/Step3Dimensions.tsx";
import { Step4Panels } from "./steps/Step4Panels.tsx";
import { Step5Arrange } from "./steps/Step5Arrange.tsx";
import { Step5Width } from "./steps/Step5Width.tsx";
import { Step6Cladding } from "./steps/Step6Cladding.tsx";
import { Step7bDakkapel } from "./steps/Step7bDakkapel.tsx";
import { Step7Colors } from "./steps/Step7Colors.tsx";
import { Step8Options } from "./steps/Step8Options.tsx";
import { Step9Position } from "./steps/Step9Position.tsx";
import { Step10Request } from "./steps/Step10Request.tsx";
import { calculateStepPricing, formatPrice } from "./utils/pricing";
import { getSubtitle, getDialogContent, STEP_LABELS } from "./utils/stepData.tsx";
import { ChevronLeft, ChevronRight, X, HelpCircle } from "lucide-react";
import { Logo } from "./Logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ControlPanelProps {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
}

export function ControlPanel({ config, onChange }: ControlPanelProps) {
  const currentStep = config.currentStep;
  const pricing = calculateStepPricing(config);

  const nextStep = () => {
    if (currentStep < 12) {
      onChange({ ...config, currentStep: currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      onChange({ ...config, currentStep: currentStep - 1 });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Type config={config} onChange={onChange} />;
      case 2: return <Step2Pitch config={config} onChange={onChange} />;
      case 3: return <Step3Dimensions config={config} onChange={onChange} />;
      case 4: return <Step4Panels config={config} onChange={onChange} />;
      case 5: return <Step5Arrange config={config} onChange={onChange} />;
      case 6: return <Step5Width config={config} onChange={onChange} />;
      case 7: return <Step6Cladding config={config} onChange={onChange} />;
      case 8: return <Step7bDakkapel config={config} onChange={onChange} />;
      case 9: return <Step7Colors config={config} onChange={onChange} />;
      case 10: return <Step8Options config={config} onChange={onChange} />;
      case 11: return <Step9Position config={config} onChange={onChange} />;
      case 12: return <Step10Request config={config} onChange={onChange} onPrev={prevStep} />;
      default: return <Step1Type config={config} onChange={onChange} />;
    }
  };

  return (
    <div className="h-full w-full sm:absolute sm:inset-0 sm:pointer-events-none">
      <div className="h-full w-full sm:absolute sm:bottom-6 sm:left-6 sm:right-auto sm:h-auto sm:max-h-[85vh] sm:pointer-events-auto sm:flex sm:w-[480px] sm:flex-col sm:rounded-[24px] sm:shadow-2xl sm:border sm:border-[#6E94B0]/25 sm:backdrop-blur-sm bg-[#FFFFFF] flex flex-col rounded-t-[20px] border-t border-[#6E94B0]/25 shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        {currentStep !== 12 && (
          <div className="w-full px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3 flex flex-col">
            {/* Header Row: Logo (left) + Help (right) */}
            <div className="flex items-center justify-between mb-2 min-h-[32px] w-full">
              <Logo />

              <Dialog>
                <DialogTrigger asChild>
                  <button className="h-[22px] w-[22px] rounded-full bg-white flex items-center justify-center text-black text-[13px] font-black shadow-sm hover:bg-slate-200 transition-colors focus:outline-none flex-shrink-0">
                    ?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[720px] rounded-[32px] border-none p-0 overflow-hidden bg-[#FFFFFF] shadow-2xl focus:outline-none">
                  <div className="w-full">
                    <DialogHeader className="px-8 pt-4 pb-1 flex flex-row items-center justify-between space-y-0 border-b border-[#6E94B0]/25">
                      <DialogTitle className="text-[16px] font-black text-[#6E94B0] tracking-tight">
                        {getDialogContent(currentStep).title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="px-8 py-4">
                      {getDialogContent(currentStep).content}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Title Row — own line, centered */}
            <div className="w-full text-center mb-1">
              <h2 className="text-[16px] sm:text-[20px] font-black text-[#6E94B0] leading-tight tracking-tighter">
                {STEP_LABELS[currentStep - 1]}
              </h2>
            </div>

            {/* Subtitle Row */}
            <div className="w-full px-1 text-center">
              <p className="text-[12px] sm:text-[14px] text-[#5E84A0] font-medium tracking-tight leading-snug">
                {getSubtitle(currentStep)}
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Content Area with Smooth Transitions - Fixed Horizontal Overflow */}
        <div className="flex flex-col flex-1 px-2 pt-0 pb-0 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0">
          <div
            key={currentStep}
            className="h-full"
          >
            {renderStep()}
          </div>
        </div>

        {/* Total Price Bar — desktop only */}
        {currentStep !== 12 && (
          <div className="hidden sm:flex w-full border-t border-[#6E94B0]/25 bg-[#FFFFFF] px-5 py-2.5 items-center justify-between flex-shrink-0">
            <span className="text-[13px] font-bold text-[#6E94B0] tracking-tight">Totaalprijs</span>
            <span className="text-[16px] font-black text-[#6E94B0] tracking-tight">
              {formatPrice(pricing.totalPrice)}
            </span>
          </div>
        )}

        {/* Footer */}
        {currentStep !== 12 && (
          <div className="w-full px-4 pt-3 pb-3 flex items-center justify-between gap-1">
            <div className="flex-shrink-0 flex justify-start">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="h-[34px] px-4 rounded-full bg-[#F0F0F0] flex items-center gap-1 text-[#4A7593] hover:bg-[#F0F0F0] transition-all flex-shrink-0"
                >
                  <ChevronLeft size={12} strokeWidth={3} />
                  {currentStep !== 11 && (
                    <span className="text-[11px] font-black whitespace-nowrap uppercase tracking-wider">terug</span>
                  )}
                </button>
              ) : <div className="w-[70px]" />}
            </div>

            {/* Total price — center, mobile only */}
            <div className="flex sm:hidden flex-col items-center flex-1">
              <span className="text-[10px] font-bold text-[#7BA0BC] tracking-tight">Totaalprijs</span>
              <span className="text-[14px] font-black text-[#6E94B0] tracking-tight leading-tight">
                {formatPrice(pricing.totalPrice)}
              </span>
            </div>

            <div className={`flex-shrink-0 flex items-center ${currentStep === 11 ? 'gap-1.5' : ''}`}>
              {currentStep === 11 && (
                <button
                  onClick={() => { }}
                  className="h-[34px] px-3 rounded-full border border-[#F0F0F0] bg-[#F0F0F0] text-[#6E94B0] text-[11px] font-black hover:bg-[#F0F0F0] transition-all whitespace-nowrap shadow-sm"
                >
                  Extra dakkapel toevoegen
                </button>
              )}
              <button
                onClick={nextStep}
                className="h-[34px] px-4 rounded-full font-black text-[11px] text-white bg-[#6E94B0] hover:bg-[#6E94B0] transition-all shadow-sm whitespace-nowrap"
              >
                {currentStep === 11 ? "Aanvraag afronden" : "Volgende"}
              </button>
            </div>
          </div>
        )}

        {/* Centered Progress Bar and Step Counter at the "Bottom Buttom" */}
        <div className="w-full flex flex-col items-center pb-10 pt-3 gap-1 relative">
          <span className="text-[11px] font-black text-[#6E94B0] uppercase tracking-widest" style={{ opacity: 1 }}>
            {currentStep} van 11
          </span>
          <div className="h-[4px] w-[90%] bg-[#F0F0F0] relative overflow-hidden rounded-full mb-1">
            <div
              className="h-full bg-[#6E94B0] transition-all duration-700 ease-in-out rounded-full"
              style={{ width: `${(currentStep / 11) * 100}%` }}
            />
          </div>
          
          <div className="absolute right-6 bottom-4">
            <span className="text-[9px] font-black text-[#6E94B0] uppercase tracking-widest">
              {config.styleType === "traditional" ? "Traditioneel" : "Kader"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}