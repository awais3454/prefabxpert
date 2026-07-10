import { WindowConfig } from "../types";
import pricingConfig from "./pricing-config.json";

// Pricing constants loaded from pricing-config.json
// Edit utils/pricing-config.json to change prices
const PRICING = {
  BASE_PRICE_PER_M2: pricingConfig.basePricePerM2,
  HEIGHT_BASE: pricingConfig.heightBase,
  HEIGHT_PRICE_PER_CM: pricingConfig.heightPricePerCm,
  WIDTH_BASE: pricingConfig.widthBase,
  WIDTH_PRICE_PER_CM: pricingConfig.widthPricePerCm,
  CLONE_BASE_PRICE: pricingConfig.cloneBasePrice,
  CLONE_PRICE_PER_M2: pricingConfig.clonePricePerM2,
  KADER_PREMIUM: pricingConfig.kaderPremium,
  SHUTTER_PRICE: pricingConfig.shutterPrice,
  INSECT_SCREEN_PRICE: pricingConfig.insectScreenPrice,
  VENT_GRILL_PRICE: pricingConfig.ventGrillPrice,
  VENT_BICOLOR_PRICE: pricingConfig.ventBicolorPrice,
  TRIM_PRICE: pricingConfig.trimPrice,
  SCREENLINE_PRICE: pricingConfig.screenlinePrice,
  EXTERNAL_SCREENS_PRICE: pricingConfig.externalScreensPrice,
  WASTE_FEE_PRICE: pricingConfig.wasteFeePrice,
  AIRCO_PRICE: pricingConfig.aircoPrice,
  ZONWEREND_GLAS_PRICE: pricingConfig.zonwerendGlasPrice,
  GLASROEDEN_PRICE: pricingConfig.glasroedenPrice,
  TRIPLE_GLAS_PRICE: pricingConfig.tripleGlasPrice,
  KRUIRoeden_4_VAKS_PRICE: pricingConfig.kruiroeden4VaksPrice,
  PITCH_SLOPE_28_37: pricingConfig.pitchSlope28_37,
  PITCH_SLOPE_20_28: pricingConfig.pitchSlope20_28,
  HPL_CLADDING_PRICE: pricingConfig.hplCladdingPrice,
  COLORED_FRAME_PRICE: pricingConfig.coloredFramePrice,
};

// Dormer size price table (width in mm at 1500mm height, price incl. VAT)
// Source: pricing-config.json dormerSizePrices
const DORMER_SIZE_PRICES: { width: number; price: number }[] = [
  { width: 2500,  price: 5770  },
  { width: 3000,  price: 5945  },
  { width: 3500,  price: 7190  },
  { width: 4000,  price: 8190  },
  { width: 4500,  price: 8790  },
  { width: 5000,  price: 9695  },
  { width: 5500,  price: 9750  },
  { width: 6000,  price: 11105 },
  { width: 6500,  price: 11705 },
  { width: 7000,  price: 12650 },
  { width: 7500,  price: 13250 },
  { width: 8000,  price: 14060 },
  { width: 8500,  price: 13950 },
  { width: 9000,  price: 15650 },
  { width: 9500,  price: 16875 },
  { width: 10000, price: 18050 },
  { width: 11000, price: 19279 },
  { width: 12000, price: 21310 },
];

export function getDormerSizePrice(dormerWidthMm: number): number {
  // Find exact match first
  const exact = DORMER_SIZE_PRICES.find(e => e.width === dormerWidthMm);
  if (exact) return exact.price;

  // Interpolate between two nearest entries
  const lower = [...DORMER_SIZE_PRICES].reverse().find(e => e.width <= dormerWidthMm);
  const upper = DORMER_SIZE_PRICES.find(e => e.width >= dormerWidthMm);

  if (!lower) return DORMER_SIZE_PRICES[0].price;
  if (!upper) return DORMER_SIZE_PRICES[DORMER_SIZE_PRICES.length - 1].price;

  const ratio = (dormerWidthMm - lower.width) / (upper.width - lower.width);
  return Math.round(lower.price + ratio * (upper.price - lower.price));
}

export function getPitchPrice(pitchDeg: number): number {
  // 28°-37°: charged per degree above 28°
  if (pitchDeg >= 28 && pitchDeg <= 37) {
    return Math.round((pitchDeg - 28) * PRICING.PITCH_SLOPE_28_37);
  }
  // 20°-27°: charged per degree below 28°
  if (pitchDeg >= 20 && pitchDeg < 28) {
    return Math.round((28 - pitchDeg) * PRICING.PITCH_SLOPE_20_28);
  }
  // 38°-65° and anything outside ranges: free (0)
  return 0;
}

export function calculateStepPricing(config: WindowConfig) {
  const { windowHeight, windowWidth, windowCopies, windowWidths, pitchDeg } = config;

  // Calculate total width across all copies
  const totalWidth = windowWidths?.reduce((sum, w) => sum + w, 0) || (windowWidth * windowCopies);

  // Full dormer total width (including side cheek walls + spacings)
  const windowSpacings = config.spacings?.slice(0, windowCopies - 1) ?? [];
  const spacingTotal = windowSpacings.reduce((sum, s) => sum + s, 0);
  const sideCheekThickness = 240; // mm — SIDE_W in DormerGeometry
  const dormerTotalWidth = totalWidth + spacingTotal + (sideCheekThickness * 2);
  const dormerTotalWidthMeters = dormerTotalWidth / 1000;
  // console.log(`Dakkapel total width: ${dormerTotalWidth}mm (${dormerTotalWidthMeters.toFixed(2)}m) — windows: ${totalWidth}mm + spacings: ${spacingTotal}mm + side cheeks: ${sideCheekThickness * 2}mm`);
  const totalWidthMeters = totalWidth / 1000;
  const effectiveHeight = Math.max(300, windowHeight - config.lintelLevel);

  // Area calculation (in m²)
  const totalAreaM2 = (totalWidth / 1000) * (effectiveHeight / 1000);

  // Height surcharge calculation
  // Base height is 1500mm (from DORMER_SIZE_PRICES table)
  // For 1750mm: surcharge = width × 0.15
  // For 2000mm: surcharge = width × 0.20
  let heightPrice = 0;
  if (windowHeight === 1750) {
    heightPrice = Math.round(dormerTotalWidth * 0.15);
  } else if (windowHeight === 2000) {
    heightPrice = Math.round(dormerTotalWidth * 0.20);
  }

  // Width pricing (only for width above base)
  // const widthAboveBase = Math.max(0, totalWidth - (PRICING.WIDTH_BASE * windowCopies));
  // const widthPrice = (widthAboveBase / 10) * PRICING.WIDTH_PRICE_PER_CM;
  const widthPrice = 0;

  // Cloning pricing
  // const cloneCount = Math.max(0, windowCopies - 1);
  // const cloneAreaM2 = (windowWidth / 1000) * (effectiveHeight / 1000);
  // const clonePrice = cloneCount * (PRICING.CLONE_BASE_PRICE + (cloneAreaM2 * PRICING.CLONE_PRICE_PER_M2));
  const clonePrice = 0;

  // Exterior Colored Frame pricing — €250 per frame if not RAL 9010 Wit
  const WHITE_FRAME = "#F7F9EF";
  const isColoredFrame = config.frameColor.toLowerCase() !== WHITE_FRAME.toLowerCase();
  const colorPrice = isColoredFrame ? PRICING.COLORED_FRAME_PRICE * windowCopies : 0;
  if (isColoredFrame) {
    // console.log(`Exterior Colored Frame — ${windowCopies} frame${windowCopies > 1 ? 's' : ''} × €${PRICING.COLORED_FRAME_PRICE} = €${colorPrice}`);
  }

  // Options pricing
  let optionsPrice = 0;
  let shutterPrice = 0;
  if (config.shutterEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    widths.forEach((w) => {
      const wMeters = w / 1000;
      shutterPrice += Math.round(PRICING.SHUTTER_PRICE * wMeters);
    });
    optionsPrice += shutterPrice;
  }
  if (config.insectScreenEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalInsectPrice = 0;
    let totalGlassPanes = 0;
    widths.forEach((w, i) => {
      const panelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      const windowPrice = PRICING.INSECT_SCREEN_PRICE * panelCount;
      // console.log(`Insectenhorren Window ${i + 1} — ${panelCount} glass pane${panelCount > 1 ? 's' : ''} × €${PRICING.INSECT_SCREEN_PRICE} = €${windowPrice}`);
      totalInsectPrice += windowPrice;
      totalGlassPanes += panelCount;
    });
    // console.log(`Total Insectenhorren: ${totalGlassPanes} glass panes = €${totalInsectPrice}`);
    optionsPrice += totalInsectPrice;
  }
  if (config.ventGrillEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalVentBoxes = 0;
    widths.forEach((w, i) => {
      const copyPanelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      // Count panels without sash (vent grille only renders on !showSash panels)
      let ventCount = 0;
      for (let p = 0; p < copyPanelCount; p++) {
        const isFirst = p === 0;
        const isLast = p === copyPanelCount - 1;
        const isEven = p % 2 === 0;
        const showSash = (
          copyPanelCount === 1 ||
          (copyPanelCount === 2 && isFirst) ||
          (copyPanelCount === 3 && (isFirst || isLast)) ||
          (copyPanelCount === 4 && (isFirst || isLast)) ||
          (copyPanelCount >= 5 && isEven)
        );
        if (!showSash) ventCount++;
      }
      // console.log(`Window ${i + 1}: ${copyPanelCount} panels, ${ventCount} ventilation box${ventCount > 1 ? 'es' : ''}`);
      totalVentBoxes += ventCount;
    });
    // console.log(`Total ventilation boxes in scene: ${totalVentBoxes}`);
    optionsPrice += PRICING.VENT_GRILL_PRICE * totalVentBoxes;
    // console.log(`Ventilatieroosters price: €${PRICING.VENT_GRILL_PRICE} × ${totalVentBoxes} = €${PRICING.VENT_GRILL_PRICE * totalVentBoxes}`);
  }
  if (config.ventGrillBiColor) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalBiColorBoxes = 0;
    widths.forEach((w) => {
      const copyPanelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      let ventCount = 0;
      for (let p = 0; p < copyPanelCount; p++) {
        const isFirst = p === 0;
        const isLast = p === copyPanelCount - 1;
        const isEven = p % 2 === 0;
        const showSash = (
          copyPanelCount === 1 ||
          (copyPanelCount === 2 && isFirst) ||
          (copyPanelCount === 3 && (isFirst || isLast)) ||
          (copyPanelCount === 4 && (isFirst || isLast)) ||
          (copyPanelCount >= 5 && isEven)
        );
        if (!showSash) ventCount++;
      }
      totalBiColorBoxes += ventCount;
    });
    optionsPrice += PRICING.VENT_BICOLOR_PRICE * totalBiColorBoxes;
    // console.log(`BI COLOR ventilatierooster — ${totalBiColorBoxes} box${totalBiColorBoxes > 1 ? 'es' : ''} × €${PRICING.VENT_BICOLOR_PRICE} = €${PRICING.VENT_BICOLOR_PRICE * totalBiColorBoxes}`);
  }
  // if (config.trimEnabled) optionsPrice += PRICING.TRIM_PRICE;
  if (config.screenlineEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalScreenlinePrice = 0;
    let totalGlassPanes = 0;
    widths.forEach((w, i) => {
      const panelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      const windowPrice = PRICING.SCREENLINE_PRICE * panelCount;
      // console.log(`Screenline (jaloezieglas) Window ${i + 1} — ${panelCount} glass pane${panelCount > 1 ? 's' : ''} × €${PRICING.SCREENLINE_PRICE} = €${windowPrice}`);
      totalScreenlinePrice += windowPrice;
      totalGlassPanes += panelCount;
    });
    // console.log(`Total Screenline (jaloezieglas): ${totalGlassPanes} glass panes = €${totalScreenlinePrice}`);
    optionsPrice += totalScreenlinePrice;
  }
  if (config.externalScreensEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalScreensPrice = 0;
    widths.forEach((w, i) => {
      const wMeters = w / 1000;
      const screenPrice = Math.round(PRICING.EXTERNAL_SCREENS_PRICE * wMeters);
      // console.log(`Screens Window ${i + 1} — width: ${wMeters.toFixed(2)} m × €${PRICING.EXTERNAL_SCREENS_PRICE}/m = €${screenPrice}`);
      totalScreensPrice += screenPrice;
    });
    // console.log(`Total Screens price: €${totalScreensPrice}`);
    optionsPrice += totalScreensPrice;
  }
  if (config.afvalAfvoerenEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalAfvalPrice = 0;
    widths.forEach((w, i) => {
      const wMeters = w / 1000;
      const afvalPrice = Math.round(PRICING.WASTE_FEE_PRICE * wMeters);
      // console.log(`Afval afvoeren Window ${i + 1} — width: ${wMeters.toFixed(2)} m × €${PRICING.WASTE_FEE_PRICE}/m = €${afvalPrice}`);
      totalAfvalPrice += afvalPrice;
    });
    // console.log(`Total Afval afvoeren price: €${totalAfvalPrice}`);
    optionsPrice += totalAfvalPrice;
  }
  if (config.aircoEnabled) {
    const totalAircoPrice = PRICING.AIRCO_PRICE * windowCopies;
    // console.log(`Airco — ${windowCopies} window${windowCopies > 1 ? 's' : ''} × €${PRICING.AIRCO_PRICE} = €${totalAircoPrice}`);
    optionsPrice += totalAircoPrice;
  }
  if (config.zonwerendGlasEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalZonwerendPrice = 0;
    let totalGlassPanes = 0;
    widths.forEach((w, i) => {
      const panelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      const windowPrice = PRICING.ZONWEREND_GLAS_PRICE * panelCount;
      // console.log(`Zonwerend HR++ glas Window ${i + 1} — ${panelCount} glass pane${panelCount > 1 ? 's' : ''} × €${PRICING.ZONWEREND_GLAS_PRICE} = €${windowPrice}`);
      totalZonwerendPrice += windowPrice;
      totalGlassPanes += panelCount;
    });
    // console.log(`Total Zonwerend HR++ glas: ${totalGlassPanes} glass panes = €${totalZonwerendPrice}`);
    optionsPrice += totalZonwerendPrice;
  }
  if (config.glasroedenEnabled) {
    const widths = config.windowWidths?.length === windowCopies
      ? config.windowWidths
      : Array.from({ length: windowCopies }, () => windowWidth);
    let totalGlasroedenPrice = 0;
    let totalGlassPanes = 0;
    widths.forEach((w, i) => {
      const panelCount = w > 4100 ? 5 : w > 3450 ? 4 : w > 2100 ? 3 : w <= 1100 ? 1 : 2;
      const windowPrice = PRICING.GLASROEDEN_PRICE * panelCount;
      // console.log(`Decorative glass bars Window ${i + 1} — ${panelCount} glass pane${panelCount > 1 ? 's' : ''} × €${PRICING.GLASROEDEN_PRICE} = €${windowPrice}`);
      totalGlasroedenPrice += windowPrice;
      totalGlassPanes += panelCount;
    });
    // console.log(`Total Decorative glass bars: ${totalGlassPanes} glass panes = €${totalGlasroedenPrice}`);
    optionsPrice += totalGlasroedenPrice;
  }
  if (config.tripleGlasEnabled) {
    const totalTripleGlasPrice = PRICING.TRIPLE_GLAS_PRICE * windowCopies;
    optionsPrice += totalTripleGlasPrice;
  }
  if (config.kruiroeden4VaksEnabled) {
    const totalKruiroedenPrice = PRICING.KRUIRoeden_4_VAKS_PRICE * windowCopies;
    optionsPrice += totalKruiroedenPrice;
  }

  // Roof slope pricing
  const pitchPrice = getPitchPrice(pitchDeg);
  if (pitchPrice > 0) {
    if (pitchDeg >= 28 && pitchDeg <= 37) {
      // console.log(`Roof slope ${pitchDeg}° (28°–37° range) — ${pitchDeg - 28} degrees × €${PRICING.PITCH_SLOPE_28_37}/degree = €${pitchPrice}`);
    } else if (pitchDeg >= 20 && pitchDeg < 28) {
      // console.log(`Roof slope ${pitchDeg}° (20°–28° range) — ${28 - pitchDeg} degrees × €${PRICING.PITCH_SLOPE_20_28}/degree = €${pitchPrice}`);
    }
  } else if (pitchDeg >= 38 && pitchDeg <= 45) {
    // console.log(`Roof slope ${pitchDeg}° (38°–45° range) — FREE`);
  }

  // Style premium: Kader is €400 per meter more expensive than Traditioneel
  // Based on dormer total width in meters
  const stylePrice = config.styleType === "kader" ? Math.round(dormerTotalWidthMeters * 400) : 0;

  // Base price
  // const basePrice = totalAreaM2 * PRICING.BASE_PRICE_PER_M2;
  const basePrice = 0;

  // Dormer size base price from lookup table
  const dormerSizePrice = getDormerSizePrice(dormerTotalWidth);
  // console.log(`Dakkapel size price: ${dormerTotalWidth}mm → €${dormerSizePrice}`);

  // HPL cladding premium
  const claddingPrice = config.claddingMaterial === "hpl" ? PRICING.HPL_CLADDING_PRICE : 0;

  const totalPrice = dormerSizePrice + basePrice + heightPrice + widthPrice + clonePrice + colorPrice + optionsPrice + stylePrice + pitchPrice + claddingPrice;

  return {
    basePrice: Math.round(basePrice),
    heightPrice: Math.round(heightPrice),
    widthPrice: Math.round(widthPrice),
    clonePrice: Math.round(clonePrice),
    colorPrice: Math.round(colorPrice),
    optionsPrice: Math.round(optionsPrice),
    shutterPrice: Math.round(shutterPrice),
    stylePrice: Math.round(stylePrice),
    claddingPrice: Math.round(claddingPrice),
    totalPrice: Math.round(totalPrice),
    totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
    pitchPrice: Math.round(pitchPrice),
  };
}

// Format price as currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: false,
  }).format(price);
}

// Get price for a specific color hex
export function getColorPrice(hexColor: string): number {
  // Simple color pricing: white/cream = 0, others = 250
  const lightColors = ["#F7F9EF", "#FDF4E3"]; // Wit, Crème wit
  if (lightColors.includes(hexColor)) return 0;
  return 250;
}
