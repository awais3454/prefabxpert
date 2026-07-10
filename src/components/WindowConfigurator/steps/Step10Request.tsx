import React, { useState, useEffect } from "react";
import { WindowConfig } from "../types";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateStepPricing, formatPrice } from "../utils/pricing";

// ── Web3Forms — free, no login needed ────────────────────────────────────────
// 1. Go to https://web3forms.com
// 2. Enter hamza.mumtaz5@gmail.com → click "Create Access Key"
// 3. Check Gmail → copy the access key → paste below
const WEB3FORMS_ACCESS_KEY = "b0af287f-c9f5-4399-858b-dc35dc53f2b9";
// ─────────────────────────────────────────────────────────────────────────────

interface Step10Props {
  config: WindowConfig;
  onChange: (config: WindowConfig) => void;
  onPrev: () => void;
}

export function Step10Request({ config, onChange, onPrev }: Step10Props) {
  const [requestType, setRequestType] = useState<"prive" | "zakelijk">("prive");
  const [aanhef, setAanhef] = useState("");
  const [email, setEmail] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [postcode, setPostcode] = useState("");
  const [huisnummer, setHuisnummer] = useState("");
  const [straat, setStraat] = useState("");
  const [plaats, setPlaats] = useState("");
  const [bouwjaar, setBouwjaar] = useState("");
  const [coupon, setCoupon] = useState("");
  const [opmerkingen, setOpmerkingen] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // Redirect to thank you page after successful submission
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        window.location.href = "https://dakkapelwarenhuis.nl/bedankt-configurator/";
      }, 2000); // Show success message for 2 seconds before redirect
      return () => clearTimeout(timer);
    }
  }, [status]);

  const pricing = calculateStepPricing(config);

  const handleSubmit = async () => {
    if (!email || !achternaam || !telefoon || !postcode || !huisnummer || !straat || !plaats) {
      alert("Vul alle verplichte velden in.");
      return;
    }

    setStatus("sending");

    // Calculate total width
    const totalWidth = config.windowWidths?.reduce((sum, w) => sum + w, 0) || (config.windowWidth * config.windowCopies);
    const spacingTotal = config.spacings?.slice(0, config.windowCopies - 1).reduce((sum, s) => sum + s, 0) ?? 0;
    const sideCheekThickness = 240;
    const dormerTotalWidth = totalWidth + spacingTotal + (sideCheekThickness * 2);

    // Build options list with prices
    const selectedOptions: string[] = [];
    if (config.shutterEnabled) selectedOptions.push(`Rolluiken: ${formatPrice(pricing.shutterPrice || 0)}`);
    if (config.insectScreenEnabled) selectedOptions.push(`Horren: per stuk`);
    if (config.ventGrillEnabled) selectedOptions.push(`Ventilatieroosters: per stuk`);
    if (config.ventGrillBiColor) selectedOptions.push(`Ventilatierooster Bi Color: per stuk`);
    if (config.zonwerendGlasEnabled) selectedOptions.push(`Zonwerend glas: per paneel`);
    if (config.glasroedenEnabled) selectedOptions.push(`Decoratie glas: per paneel`);
    if (config.tripleGlasEnabled) selectedOptions.push(`Trippel glas: per raam`);
    if (config.kruiroeden4VaksEnabled) selectedOptions.push(`Kruiroeden 4 vaks: per raam (${config.kruiroedenColor || "9001"})`);
    if (config.afvalAfvoerenEnabled) selectedOptions.push(`Afval: per meter`);
    if (config.externalScreensEnabled) selectedOptions.push(`Screens: per meter`);
    if (config.aircoEnabled) selectedOptions.push(`Airco: per stuk`);
    if (config.melkglasEnabled) selectedOptions.push(`Melkglas`);
    if (config.screenlineEnabled) selectedOptions.push(`Screenline: per paneel`);
    if (config.trimEnabled) selectedOptions.push(`Lijstwerk rond kozijn`);

    const formData = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Nieuwe dakkapel aanvraag van ${aanhef} ${achternaam}`.trim(),
      from_name: "Dakkapel Configurator",
      replyto: email,
      Naam: `${aanhef} ${achternaam}`.trim(),
      Email: email,
      Telefoon: telefoon,
      "Aanvraag voor": requestType === "prive" ? "Privé" : "Zakelijk",
      Postcode: postcode,
      Huisnummer: huisnummer,
      Straat: straat,
      Plaats: plaats,
      Bouwjaar: bouwjaar || "Niet opgegeven",
      Coupon: coupon || "Geen",
      Opmerkingen: opmerkingen || "Geen opmerkingen",

      // Configuration Details
      "Stijl (Step 1)": config.styleType === "traditional" ? "Traditioneel" : "Kader",
      "Hellingshoek (Step 2)": `${config.pitchDeg}°`,
      "Hoogte (Step 3)": `${config.windowHeight} mm (${(config.windowHeight / 10).toFixed(0)} cm)`,
      "Tussenpanelen (Step 4)": config.panelCount > 1 ? `${config.panelCount} panelen` : "Geen",
      "Indeling kozijnen (Step 5)": `${config.windowCopies} kozijn${config.windowCopies > 1 ? 'en' : ''}`,
      "Breedte & penanten (Step 6)": `${config.windowWidth} mm (${(config.windowWidth / 10).toFixed(0)} cm)`,
      "Totaal breedte dakkapel": `${dormerTotalWidth} mm (${(dormerTotalWidth / 10).toFixed(0)} cm)`,
      "Bekleding (Step 7)": config.claddingMaterial === "rondkantpanelen" ? "Rondkantpanelen" : "HPL",
      "Kleuren (Step 8)": `Voorkant: ${config.frontColor}, Zijkant: ${config.sideColor}, Lijst: ${config.fasciaColor}, Kozijn: ${config.frameColor}, Raam: ${config.sashColor}`,
      "Extra Opties (Step 9)": selectedOptions.length > 0 ? selectedOptions.join(" | ") : "Geen extra opties",
      "Positie (Step 10)": config.dormerPosition === "voorzijde" ? "Voorzijde" :
        config.dormerPosition === "achterzijde" ? "Achterzijde" :
        config.dormerPosition === "linkerkant" ? "Linkerkant" :
        config.dormerPosition === "rechterkant" ? "Rechterkant" : "Niet geselecteerd",
      "Demontage bestaande dakkapel": config.demountExisting ? "Ja" : "Nee",
      "Aantal kozijnen": config.windowCopies,

      // Pricing Breakdown
      "Basis prijs (dakkapel grootte)": formatPrice(pricing.basePrice || 0),
      "Kleur prijs (gekleurde kozijnen)": formatPrice(pricing.colorPrice || 0),
      "Bekleding prijs (HPL)": formatPrice(pricing.claddingPrice || 0),
      "Opties prijs": formatPrice(pricing.optionsPrice || 0),
      "Hellingshoek prijs": formatPrice(pricing.pitchPrice || 0),
      "Totaalprijs": formatPrice(pricing.totalPrice),
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
      } else {
        throw new Error(json.message || "Web3Forms error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  const inputCls = "h-[44px] rounded-[5px] border-white/10 outline-none focus-visible:ring-1 focus-visible:ring-[#8D725C] focus-visible:ring-offset-0 bg-[#6E94B0] text-white text-[14px]";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4 px-8 text-center">
        <div className="text-[48px]">✅</div>
        <h2 className="text-[22px] font-black text-white">Aanvraag verstuurd!</h2>
        <p className="text-[14px] text-slate-300">We nemen zo snel mogelijk contact met u op.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4 px-8 text-center">
        <div className="text-[48px]">❌</div>
        <h2 className="text-[22px] font-black text-white">Verzenden mislukt</h2>
        <p className="text-[14px] text-slate-300">Er is iets misgegaan. Controleer uw internetverbinding en probeer het opnieuw.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 px-6 py-2 rounded-full bg-[#8D725C] hover:bg-[#8D725C] text-white font-black text-[14px] transition-all"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full sm:h-[700px] sm:max-h-[85vh] overflow-hidden">
      {/* Scrollable Area (Title + Form) */}
      <div className="flex-1 overflow-y-auto px-5 custom-scrollbar py-6 pb-20 sm:pb-6">
        <div className="flex flex-col gap-6">
          {/* Header Content (Now Scrolls) */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[22px] font-black text-white leading-tight tracking-tighter">
              Offerte aanvraag
            </h2>
            <div className="flex flex-col gap-1">
              <p className="text-[14px] leading-[1.3] text-slate-300 font-medium tracking-tight">
                Rond uw aanvraag af en ontvang direct een overzicht van uw aanvraag.
              </p>
              <p className="text-[14px] leading-[1.3] font-bold text-white tracking-tight">
                Belangrijk: vul het adres in waar de dakkapel geplaatst wordt!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Aanvraag voor */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Aanvraag voor <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 justify-start mt-0.5">
                <Button
                  variant="outline"
                  onClick={() => setRequestType("prive")}
                  className={`w-[84px] h-[38px] rounded-[5px] font-bold text-[14px] transition-all px-0 hover:text-white ${requestType === "prive"
                      ? "bg-[#8D725C]/20 border-[#8D725C] text-white border-2 shadow-sm hover:bg-[#8D725C]/20"
                      : "bg-[#6E94B0] text-white border-white/10 hover:bg-[#5E84A0] border"
                    }`}
                >
                  Privé
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRequestType("zakelijk")}
                  className={`w-[84px] h-[38px] rounded-[5px] font-bold text-[14px] transition-all px-0 hover:text-white ${requestType === "zakelijk"
                      ? "bg-[#8D725C]/20 border-[#8D725C] text-white border-2 shadow-sm hover:bg-[#8D725C]/20"
                      : "bg-[#6E94B0] text-white border-white/10 hover:bg-[#5E84A0] border"
                    }`}
                >
                  Zakelijk
                </Button>
              </div>
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            </div>

            {/* Aanhef & Achternaam */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-black text-white">
                  Aanhef <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setAanhef}>
                  <SelectTrigger className="h-[44px] rounded-[5px] border-white/10 outline-none focus:ring-1 focus:ring-[#8D725C] focus:ring-offset-0 bg-[#6E94B0] px-3 text-[14px] text-white">
                    <SelectValue placeholder="Selecteer..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#6E94B0] border-white/10 text-white">
                    <SelectItem value="Dhr.">Dhr.</SelectItem>
                    <SelectItem value="Mevr.">Mevr.</SelectItem>
                    <SelectItem value="Familie">Familie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-black text-white">
                  Achternaam <span className="text-red-500">*</span>
                </Label>
                <Input value={achternaam} onChange={e => setAchternaam(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Telefoon */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Telefoon <span className="text-red-500">*</span>
              </Label>
              <Input value={telefoon} onChange={e => setTelefoon(e.target.value)} className={inputCls} />
            </div>

            {/* Plaatsingadres Section */}
            <div className="mt-2 border-t border-white/10 pt-2.5">
              <h3 className="text-[18px] font-black text-white tracking-tight">
                Plaatsingadres
              </h3>
            </div>

            {/* Postcode & Huisnummer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-black text-white">
                  Postcode <span className="text-red-500">*</span>
                </Label>
                <Input value={postcode} onChange={e => setPostcode(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-black text-white">
                  Huisnummer <span className="text-red-500">*</span>
                </Label>
                <Input value={huisnummer} onChange={e => setHuisnummer(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Straat */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Straat <span className="text-red-500">*</span>
              </Label>
              <Input value={straat} onChange={e => setStraat(e.target.value)} className={inputCls} />
            </div>

            {/* Plaats */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Plaats <span className="text-red-500">*</span>
              </Label>
              <Input value={plaats} onChange={e => setPlaats(e.target.value)} className={inputCls} />
            </div>

            {/* Bouwjaar */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Bouwjaar
              </Label>
              <Input
                value={bouwjaar}
                onChange={e => setBouwjaar(e.target.value)}
                placeholder="Bijv. 1990"
                className={inputCls}
              />
            </div>

            {/* Coupon code */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Coupon code
              </Label>
              <Input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Vul uw coupon code in"
                className={inputCls}
              />
            </div>

            {/* Opmerkingen */}
            <div className="flex flex-col gap-1">
              <Label className="text-[14px] font-black text-white">
                Opmerkingen
              </Label>
              <Textarea
                value={opmerkingen}
                onChange={e => setOpmerkingen(e.target.value)}
                rows={5}
                className="rounded-[5px] border-white/10 outline-none focus-visible:ring-1 focus-visible:ring-[#8D725C] focus-visible:ring-offset-0 bg-[#6E94B0] text-white shadow-sm resize-none text-[14px]"
              />
            </div>

            {/* Action Button (Scrolls with the rest) */}
            <div className="pt-4 pb-2">
              <Button
                onClick={handleSubmit}
                disabled={status === "sending"}
                className="w-full h-[48px] rounded-full bg-[#8D725C] hover:bg-[#8D725C] text-white font-black text-[15px] transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                {status === "sending" ? "Versturen..." : "aanvraag versturen"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Bar (Left Aligned) */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#5E84A0]">
        <button
          onClick={onPrev}
          className="w-full pl-5 py-2.5 flex items-center justify-start gap-2 text-slate-200 transition-all font-black"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          <span className="text-[12px] uppercase tracking-wider">terug</span>
        </button>
      </div>
    </div>
  );
}