import React from 'react';

export const STEP_LABELS = [
  "Type dakkapel",
  "Hellingshoek",
  "Hoogte",
  "Tussenpanelen",
  "Indeling ramen",
  "Indeling kozijnen en blinde panelen",
  "Bekleding zijwang",
  "Dakkapel",
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
    case 5: return "Stel de breedte van elk individueel kozijn in. De camera zoomt in op het geselecteerde kozijn.";
    case 6: return "Geef de breedte van elk kozijn en de penanten op, hiermee bepaalt u de totale breedte.";
    case 7: return "Kies het materiaal van de zijkant van de dakkapel.";
    case 8: return "Kies de dakbedekking en de aansluiting op het pannendak.";
    case 9: return "Kies de kleuren van de dakkapel.";
    case 10: return "Maak de dakkapel compleet met extra opties.";
    case 11: return "Waar moet de dakkapel geplaatst worden op uw woning?";
    default: return "Selecteer de gewenste optie voor uw dakkapel.";
  }
}

export interface DialogInfo {
  title: string;
  content: React.ReactNode;
}

export function getDialogContent(currentStep: number): DialogInfo {
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
              Zelf iets moois gezien? We denken graag met u mee. Neem contact op voor een maatwerkoplossing die aansluit bij uw wensen.
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
            <div className="space-y-2">
              <p className="text-[17px] leading-relaxed">
                <span className="font-extrabold text-[#6E94B0]">Hoogte bepalen:</span> De totale hoogte van een dakkapel is de afstand van de vloer tot de bovenkant van de dakkapel. Die bestaat uit:
              </p>
              <ul className="space-y-1">
                <li className="text-[17px] leading-relaxed flex items-start gap-2 pl-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2.5 flex-shrink-0" />
                  <span>De hoogte van het kozijn (minimaal 85 cm)</span>
                </li>
                <li className="text-[17px] leading-relaxed flex items-start gap-2 pl-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/60 mt-2.5 flex-shrink-0" />
                  <span>25 cm voor de dakrand</span>
                </li>
              </ul>
              <p className="text-[17px] leading-relaxed">
                Kies dus de gewenste kozijnhoogte en tel daar 25 cm bij op.
              </p>
            </div>

            <p className="text-[17px] leading-relaxed">
              <span className="font-extrabold text-[#6E94B0]">Vergunningsplicht:</span> Een dakkapel van 1,75 m of lager valt meestal buiten vergunningsplicht (mits hij ook aan andere voorwaarden voldoet). Bij meer dan 1,75 m is wél een vergunning nodig.
            </p>

            <p className="text-[17px] leading-relaxed">
              <span className="font-extrabold text-[#6E94B0]">Borstwering:</span> Een borstwering is een extra dicht paneel onder het raam, voor wie het kozijn hoger wil plaatsen. Dit element wordt vaak gebruikt om meer loopruimte te creëren.
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
                <span><span className="font-bold text-[#6E94B0]">Zijwangen:</span> Aan beide zijkanten van de dakkapel plaatsen wij standaard een vaste zijwang van 16 cm, met een afwerkbalk van 4,4 cm.</span>
              </li>
            </ul>
            <p className="text-[15px] leading-relaxed">
              Bij een tussenmuur houden we minimaal 5 cm ruimte aan tussen de tussenmuur en het kozijn, om de aansluiting netjes te maken.
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
              Rondkantpanelen is een kunststof bekleding met de uitstraling van hout (rabatdelen). Veel mensen kiezen dit vanwege de warme, traditionele look en de gunstige prijs.
            </p>
            <p className="text-[15px] leading-relaxed">
              Hpl (high pressure laminate) is juist helemaal glad. Het oogt modern, is extreem sterk en goed bestand tegen zon, regen en vuil.
            </p>
            <p className="text-[15px] leading-relaxed">
              Liever houten rabatdelen of een zinken afwerking? Neem contact met ons op, we denken graag met u mee!
            </p>
          </div>
        )
      };
    case 8:
      return {
        title: "Extra informatie dakkapel",
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
              Voor de dakkapel (voorkant, zijwangen en boei) kunt u kiezen uit 12 kleuren, waaronder Wit (RAL 9010) en Crème wit (RAL 9001) als standaard opties.
            </p>
            <p className="text-[15px] leading-relaxed">
              Voor kozijnen en draaikiepramen zijn 11 kleuren beschikbaar. Monumentenblauw is alleen beschikbaar voor de dakkapel, niet voor kozijnen.
            </p>
            <p className="text-[15px] leading-relaxed font-bold text-[#6E94B0]">
              Toch liever een andere kleur of houtkleurig met nerf? Neem contact met ons op voor de mogelijkheden!
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
              Naast rolluiken, insectenhorren of ventilatieroosters kunt u ook kiezen voor een screen aan de buitenkant of plissé raambekleding aan de binnenkant.
            </p>
            <p className="text-[17px] leading-relaxed font-bold text-[#6E94B0]">
              Laat u informeren over de vele mogelijkheden door één van onze adviseurs.
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
              Wanneer u de dakkapel aan de voorzijde of zijkant wilt plaatsen, is de kans op een vergunningsplicht groter. Onze adviseurs denken graag met u mee over de mogelijkheden.
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