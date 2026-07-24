import React from 'react';

export const STEP_LABELS = [
  "Type dakkapel",
  "Bekleding",
  "Kleuren",
  "De hellingshoek",
  "Complete dakkapel",
  "Breedte, kozijnen en penanten",
  "Dakbedekking en aansluiting",
  "Extra Opties",
  "Positie dakkapel"
];

export function getSubtitle(currentStep: number): string {
  switch (currentStep) {
    case 1: return "Welke uitstraling heeft uw voorkeur?";
    case 2: return "Kies het materiaal van de zijkant van de dakkapel.";
    case 3: return "Kies de kleuren van de dakkapel.";
    case 4: return "Hoe schuin is uw dak?";
    case 5: return "Hoe hoog moet uw dakkapel worden?";
    case 6: return "Stel de breedte, kozijnen en penanten afzonderlijk in.";
    case 7: return "Kies de dakbedekking en de aansluiting op het pannendak.";
    case 8: return "Maak de dakkapel compleet met extra opties.";
    case 9: return "Waar moet de dakkapel geplaatst worden op uw woning?";
    default: return "Selecteer de gewenste optie voor uw dakkapel.";
  }
}

export interface DialogInfo {
  title: string;
  content: React.ReactNode;
}

export function getDialogContent(currentStep: number): DialogInfo {
  const dialogStepMap: Record<number, number> = {
    1: 1,
    2: 7,
    3: 9,
    4: 2,
    5: 3,
    6: 12,
    7: 8,
    8: 10,
    9: 11,
  };
  currentStep = dialogStepMap[currentStep] ?? currentStep;
  switch (currentStep) {
    case 1:
      return {
        title: "Extra informatie dakkapel types",
        content: (
          <div className="space-y-4">
            <p className="text-[17px] text-[#6E94B0] leading-relaxed font-bold">
              De traditionele dakkapel is de meest gekozen dakkapel: tijdloos en perfect passend bij verscheidene bouwstijlen.
            </p>
            <p className="text-[17px] text-[#6E94B0] leading-relaxed font-medium">
              De kader dakkapel kenmerkt zich door een strakke vormgeving, met standaard hpl-bekleding.
            </p>
            <p className="text-[17px] text-[#6E94B0] leading-relaxed font-medium">
              Zelf iets moois gezien? Wij denken graag met u mee. Neem contact op voor een maatwerkoplossing die aansluit bij uw wensen.
            </p>
          </div>
        )
      };
    case 2:
      return {
        title: "Extra informatie hellingshoek",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium">
            <p className="text-[17px] leading-relaxed">
              De hellingshoek van het dak is belangrijk voor het bepalen van de afmetingen van de dakkapel. De hellingshoek is de hoek tussen het dak en de vloer.
            </p>
            <p className="text-[17px] leading-relaxed">
              De meeste woningen hebben een dakhoek tussen 35° en 45°.
            </p>
            <p className="text-[17px] leading-relaxed">
              Er zijn twee manieren om de hellingshoek te meten:
            </p>
            <ul className="space-y-2">
              <li className="text-[17px] leading-relaxed flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2.5 flex-shrink-0" />
                <span>
                  <span className="font-extrabold text-[#6E94B0]">Digitale waterpas:</span> Houd deze tegen het dakbeschot aan de binnenkant van het dak en lees de graden af.
                </span>
              </li>
              <li className="text-[17px] leading-relaxed flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2.5 flex-shrink-0" />
                <span>
                  <span className="font-extrabold text-[#6E94B0]">Smartphone app:</span> Download een gratis hellingmeter app via de <a href="https://apps.apple.com/nl/app/waterpas-en-hellingmeter-app/id1672836817" target="_blank" rel="noopener noreferrer" className="underline decoration-white font-extrabold text-[#6E94B0] cursor-pointer">App Store</a> of <a href="https://play.google.com/store/apps/details?id=com.syleosapps.inclinometer&hl=nl&gl=US&pli=1" target="_blank" rel="noopener noreferrer" className="underline decoration-white font-extrabold text-[#6E94B0] cursor-pointer">Google Play</a> en meet de hoek eenvoudig.
                </span>
              </li>
            </ul>
          </div>
        )
      };
    case 3:
      return {
        title: "Extra informatie hoogte dakkapel",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium pt-0">
            <p className="text-[17px] leading-relaxed">
              De totale hoogte van een dakkapel wordt gemeten vanaf de dakvoet tot aan de bovenzijde van de dakkapel.
            </p>
            <p className="text-[17px] leading-relaxed">
              Wij bieden verschillende hoogtes van het dakpakket aan. Daarnaast houden wij rekening met extra ruimte voor eventuele raambekleding.
            </p>
            <p className="text-[17px] leading-relaxed">
              Voor meer informatie over de vergunningsplicht en de voorwaarden kunt u onze website bekijken of naar{" "}
              <a
                href="https://www.omgevingsloket.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold underline underline-offset-2 text-[#6E94B0]"
              >
                www.omgevingsloket.nl
              </a>{" "}
              gaan.
            </p>
            <p className="text-[17px] leading-relaxed">
              <span className="font-extrabold text-[#6E94B0]">Borstwering:</span> Een borstwering is een extra dicht paneel onder het raam. Dit element wordt vaak gebruikt om meer loopruimte te creëren.
            </p>
          </div>
        )
      };
    case 4:
      return {
        title: "Extra informatie tussenpanelen",
        content: (
          <div className="space-y-3 text-[#6E94B0] font-medium">
            <p className="text-[15px] leading-relaxed">
              Achter een tussenpaneel, ook wel penant genoemd, kunt u een wand plaatsen om 2 of meerdere kamers te maken. Daarnaast wordt een tussenpaneel ook gebruikt om een kast achter te plaatsen.
            </p>
          </div>
        )
      };
    case 5:
      return {
        title: "Extra informatie indeling kozijnen",
        content: (
          <div className="space-y-3 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              In deze stap stelt u de breedte van elk individueel kozijn in.
            </p>
            <ul className="space-y-2">
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Selecteer een kozijn:</span> Gebruik de pijltjes of klik op een kozijn om het te selecteren.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Camera zoomt in:</span> De camera zoomt automatisch in op het geselecteerde kozijn.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Stel de breedte in:</span> Gebruik de slider of de +/- knoppen om de breedte aan te passen.</span>
              </li>
            </ul>
            <p className="text-[15px] leading-relaxed">
              Door elk kozijn apart te configureren, kunt u verschillende maten kiezen voor verschillende ruimtes.
            </p>
          </div>
        )
      };
    case 6:
      return {
        title: "Extra informatie breedte & penanten",
        content: (
          <div className="space-y-3 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              De totale breedte van uw dakkapel bestaat uit de volgende elementen:
            </p>
            <ul className="space-y-2">
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Kozijnbreedte:</span> De breedte van elk kozijn die u in de vorige stap heeft ingesteld.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Penanten:</span> De tussenwanden tussen de kozijnen. De breedte hiervan kunt u hier aanpassen.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Zijwangen:</span> Aan beide zijkanten van de dakkapel plaatsen wij standaard een vaste zijwang van 160 mm, met een afwerkbalk van 44 mm.</span>
              </li>
            </ul>
            <p className="text-[15px] leading-relaxed">
              Bij een tussenmuur houden we minimaal 50 mm ruimte aan tussen de tussenmuur en het kozijn, om de aansluiting netjes te maken.
            </p>
            <p className="text-[15px] leading-relaxed">
              Wenst u een andere indeling? We denken graag met u mee. Neem contact op voor een maatwerkoplossing die aansluit bij uw wensen.
            </p>
          </div>
        )
      };
    case 7:
      return {
        title: "Extra informatie bekleding",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              Keralit is verkrijgbaar in vier verschillende hoogtes: 143 mm, 166 mm, 177 mm en 190 mm.
            </p>
            <p className="text-[15px] leading-relaxed">
              HPL, oftewel hoogdruklaminaat, is een volledig gladde plaat die zorgt voor een moderne en strakke uitstraling. De platen kunnen zowel geschroefd als gelijmd worden.
            </p>
            <p className="text-[15px] leading-relaxed">
              Liever houten rabatdelen of een zinken afwerking? Neem contact met ons op. Wij denken graag met u mee.
            </p>
          </div>
        )
      };
    case 8:
      return {
        title: "Extra informatie dakbedekking en aansluiting",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              <span className="font-extrabold text-[#6E94B0]">Dakbedekking:</span> Kies tussen bitumen of EPDM als afwerking van het platte dak van de dakkapel. Beide zijn waterdicht en duurzaam.
            </p>
            <p className="text-[15px] leading-relaxed">
              <span className="font-extrabold text-[#6E94B0]">Aansluiting pannendak:</span> De aansluiting op uw bestaande pannendak kan met lood of met een loodvervanger worden uitgevoerd.
            </p>
          </div>
        )
      };
    case 9:
      return {
        title: "Extra informatie kleuren",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              In de configurator tonen wij een selectie van populaire kleuren. Er is echter een veel uitgebreider kleurenpalet beschikbaar. Neem contact met ons op voor alle mogelijkheden.
            </p>
          </div>
        )
      };
    case 10:
      return {
        title: "Extra opties voor uw dakkapel",
        content: (
          <div className="space-y-2 text-[#6E94B0] font-medium pb-2">
            <p className="text-[17px] leading-relaxed">
              Naast rolluiken, insectenhorren en ventilatieroosters kunt u ook kiezen voor screens aan de buitenzijde en nog verschillende andere opties.
            </p>
          </div>
        )
      };
    case 11:
      return {
        title: "Informatie positie dakkapel",
        content: (
          <div className="space-y-4 text-[#6E94B0] font-medium pb-2">
            <p className="text-[17px] leading-relaxed">
              De positie van de dakkapel op uw woning bepaalt of u een vergunning nodig heeft. Voor een dakkapel aan de achterzijde heeft u meestal geen vergunning nodig.
            </p>
            <p className="text-[17px] leading-relaxed">
              Wilt u controleren of u een vergunning nodig heeft? Bekijk dan{" "}
              <a
                href="https://www.omgevingsloket.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold underline underline-offset-2 text-[#6E94B0]"
              >
                www.omgevingsloket.nl
              </a>.
            </p>
          </div>
        )
      };
    case 12:
      return {
        title: "Extra informatie breedte, kozijnen en penanten",
        content: (
          <div className="space-y-3 text-[#6E94B0] font-medium pb-2">
            <p className="text-[15px] leading-relaxed">
              Hier stelt u de complete breedte van de dakkapel samen: de linker- en rechterwang, beide kozijnen en de penant ertussen.
            </p>
            <ul className="space-y-2">
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-[#6E94B0]/50 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Linker- en rechterwang:</span> vaste breedte van 190 mm, kan niet worden verwijderd of verkleind.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-[#6E94B0]/50 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Kozijn 1 en Kozijn 2:</span> stel de breedte apart in, of kies voor een gesloten paneel in plaats van een kozijn.</span>
              </li>
              <li className="text-[15px] leading-relaxed flex items-start gap-2 pl-4">
                <div className="h-1.5 w-1.5 rounded-full bg-[#6E94B0]/50 mt-2 flex-shrink-0" />
                <span><span className="font-bold text-[#6E94B0]">Penant:</span> de tussenwand tussen de twee kozijnen, de breedte hiervan kunt u hier aanpassen.</span>
              </li>
            </ul>
            <p className="text-[15px] leading-relaxed">
              Klik op een onderdeel bovenaan om alleen de instellingen van dat onderdeel te bekijken en aan te passen. De totale breedte wordt automatisch berekend.
            </p>
          </div>
        )
      };
    default:
      return {
        title: "Informatie",
        content: (
          <p className="text-[17px] text-[#6E94B0] leading-relaxed font-medium">
            Hier vindt u extra informatie over deze stap in het configuratieproces.
          </p>
        )
      };
  }
}