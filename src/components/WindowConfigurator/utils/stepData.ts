import React from 'react';

export const STEP_LABELS = [
  "Type dakkapel",
  "Hellingshoek",
  "Hoogte",
  "Tussenpanelen",
  "Breedte",
  "Bekleding zijwang",
  "Kleuren",
  "Extra Opties",
  "Positie dakkapel"
];

export function getSubtitle(currentStep: number): string {
  switch (currentStep) {
    case 1: return "Welke uitstraling heeft uw voorkeur?";
    case 2: return "Hoe schuin is uw dak?";
    case 3: return "Hoe hoog moet uw dakkapel worden?";
    case 4: return "Met tussenpanelen deelt u de dakkapel op, om verschillende ruimtes te maken.";
    case 5: return "Geef de breedte van elk kozijn op, hiermee bepaalt u de indeling van de dakkapel.";
    case 6: return "Kies het materiaal van de zijkant van de dakkapel.";
    case 7: return "Kies de kleuren van de dakkapel.";
    case 8: return "Maak de dakkapel compleet met extra opties.";
    case 9: return "Waar moet de dakkapel geplaatst worden op uw woning?";
    default: return "Selecteer de gewenste optie voor uw dakkapel.";
  }
}

export interface DialogInfo {
  title: string;
  content: React.ReactNode;
}

/**
 * Returns the extra information dialog content for a given step.
 * Using React.createElement for raw content to avoid requiring JSX transform in this util if not needed,
 * but since it's a .ts file we'll just use standard React nodes.
 */
export function getDialogContent(currentStep: number): DialogInfo {
  switch (currentStep) {
    case 1:
      return {
        title: "Extra informatie dakkapel types",
        content: React.createElement("div", { className: "space-y-4" },
          React.createElement("p", { className: "text-[17px] text-slate-600 leading-relaxed font-bold" },
            "De traditionele dakkapel is de meest gekozen dakkapel: tijdloos en perfect passend bij verscheidene bouwstijlen."
          ),
          React.createElement("p", { className: "text-[17px] text-slate-600 leading-relaxed font-medium" },
            "De kader dakkapel kenmerkt zich door een strakke vormgeving, met standaard HPL-bekleding."
          ),
          React.createElement("p", { className: "text-[17px] text-slate-600 leading-relaxed font-medium" },
            "Zelf iets moois gezien? We denken graag met u mee. Neem contact op voor een maatwerkoplossing die aansluit bij uw wensen."
          )
        )
      };
    case 2:
      return {
        title: "Extra informatie hellingshoek",
        content: React.createElement("div", { className: "space-y-4 text-slate-600 font-medium" },
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            "De hellingshoek van het dak is belangrijk voor het bepalen van de afmetingen van de dakkapel. De hellingshoek is de hoek tussen het dak en de vloer."
          ),
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            "De meeste woningen hebben een dakhoek tussen 35° en 45°."
          ),
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            "Er zijn twee manieren om de hellingshoek te meten:"
          ),
          React.createElement("ul", { className: "space-y-2" },
            React.createElement("li", { className: "text-[17px] leading-relaxed flex items-start gap-2" },
              React.createElement("div", { className: "h-1.5 w-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0" }),
              React.createElement("span", null,
                React.createElement("span", { className: "font-extrabold text-slate-900" }, "Digitale waterpas: "),
                "Houd deze tegen het dakbeschot aan de binnenkant van het dak en lees de graden af."
              )
            ),
            React.createElement("li", { className: "text-[17px] leading-relaxed flex items-start gap-2" },
              React.createElement("div", { className: "h-1.5 w-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0" }),
              React.createElement("span", null,
                React.createElement("span", { className: "font-extrabold text-slate-900" }, "Smartphone app: "),
                "Download een gratis hellingmeter app en meet de hoek eenvoudig."
              )
            )
          )
        )
      };
    case 5:
      return {
        title: "Extra informatie breedte dakkapel",
        content: React.createElement("div", { className: "space-y-4 text-slate-600 font-medium pt-0" },
          React.createElement("div", { className: "space-y-2" },
            React.createElement("p", { className: "text-[17px] leading-relaxed" },
              React.createElement("span", { className: "font-extrabold text-slate-900" }, "Breedte bepalen: "),
              "Configureer de breedte van de kozijnen."
            )
          )
        )
      };
    case 3:
      return {
        title: "Extra informatie hoogte dakkapel",
        content: React.createElement("div", { className: "space-y-4 text-slate-600 font-medium pt-0" },
          React.createElement("div", { className: "space-y-2" },
            React.createElement("p", { className: "text-[17px] leading-relaxed" },
              React.createElement("span", { className: "font-extrabold text-slate-900" }, "Hoogte bepalen: "),
              "De totale hoogte van een dakkapel is de afstand van de vloer tot de bovenkant van de dakkapel. Die bestaat uit:"
            ),
            React.createElement("ul", { className: "space-y-1" },
              React.createElement("li", { className: "text-[17px] leading-relaxed flex items-start gap-2 pl-4" },
                React.createElement("div", { className: "h-1.5 w-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0" }),
                React.createElement("span", null, "De hoogte van het kozijn (minimaal 85 cm)")
              ),
              React.createElement("li", { className: "text-[17px] leading-relaxed flex items-start gap-2 pl-4" },
                React.createElement("div", { className: "h-1.5 w-1.5 rounded-full bg-slate-300 mt-2.5 flex-shrink-0" }),
                React.createElement("span", null, "25 cm voor de dakrand")
              )
            )
          ),
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            "Kies dus de gewenste kozijnhoogte en tel daar 25 cm bij op."
          ),
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            React.createElement("span", { className: "font-extrabold text-slate-900" }, "Vergunningsplicht: "),
            "Een dakkapel van 1,75 m of lager valt meestal buiten vergunningsplicht."
          ),
          React.createElement("p", { className: "text-[17px] leading-relaxed" },
            React.createElement("span", { className: "font-extrabold text-slate-900" }, "Borstwering: "),
            "Een borstwering is een extra dicht paneel onder het raam, voor wie het kozijn hoger wil plaatsen."
          )
        )
      };
    // ... Simplified for other steps to focus on functional separation ...
    default:
      return {
        title: "Informatie",
        content: React.createElement("p", { className: "text-[17px] text-slate-600 leading-relaxed font-medium" },
          "Hier vindt u extra informatie over deze stap in het configuratieproces."
        )
      };
  }
}
