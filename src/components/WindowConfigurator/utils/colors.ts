export interface RalColorOption {
  id: string;
  name: string;
  hex: string;
  price: number;
  /** Custom brand colors without an official RAL code */
  noRal?: boolean;
}

/** KLEUR DAKKAPEL — voorkant, zijwangen, boei */
export const DAKKAPEL_COLORS: RalColorOption[] = [
  { id: "9010", name: "Wit", hex: "#F7F9EF", price: 0 },
  { id: "9001", name: "Crème wit", hex: "#FDF4E3", price: 0 },
  { id: "9005", name: "Zwart", hex: "#0A0A0D", price: 250 },
  { id: "7016", name: "Antraciet", hex: "#383E42", price: 250 },
  { id: "7021", name: "Zwartgrijs", hex: "#2F3234", price: 250 },
  { id: "7039", name: "Kwartsgrijs", hex: "#6C6960", price: 250 },
  { id: "7001", name: "Zilvergrijs", hex: "#8F999F", price: 250 },
  { id: "6009", name: "Dennengroen", hex: "#263928", price: 250 },
  { id: "monument-groen", name: "Monumentengroen", hex: "#0D2818", price: 250, noRal: true },
  { id: "5011", name: "Staalblauw", hex: "#232C3B", price: 250 },
  { id: "monument-blauw", name: "Monumentenblauw", hex: "#0D1520", price: 250, noRal: true },
  { id: "3005", name: "Wijnrood", hex: "#5E2129", price: 250 },
];

/** KLEUR KOZIJNEN — kozijn, draaikiepraam (excl. Monumentenblauw) */
export const KOZIJN_COLORS: RalColorOption[] = [
  { id: "9010", name: "Wit", hex: "#F7F9EF", price: 0 },
  { id: "9001", name: "Crème wit", hex: "#FDF4E3", price: 0 },
  { id: "9005", name: "Zwart", hex: "#0A0A0D", price: 250 },
  { id: "7016", name: "Antraciet", hex: "#383E42", price: 250 },
  { id: "7021", name: "Zwartgrijs", hex: "#2F3234", price: 250 },
  { id: "7039", name: "Kwartsgrijs", hex: "#6C6960", price: 250 },
  { id: "7001", name: "Zilvergrijs", hex: "#8F999F", price: 250 },
  { id: "6009", name: "Dennengroen", hex: "#263928", price: 250 },
  { id: "monument-groen", name: "Monumentengroen", hex: "#0D2818", price: 250, noRal: true },
  { id: "5011", name: "Staalblauw", hex: "#232C3B", price: 250 },
  { id: "3005", name: "Wijnrood", hex: "#5E2129", price: 250 },
];

/** All colors for price lookup */
export const ALL_RAL_COLORS: RalColorOption[] = [
  ...DAKKAPEL_COLORS,
  ...KOZIJN_COLORS.filter((c) => !DAKKAPEL_COLORS.some((d) => d.hex === c.hex)),
];

/** @deprecated Use ALL_RAL_COLORS, DAKKAPEL_COLORS, or KOZIJN_COLORS */
export const RAL_COLOR_PRICES = ALL_RAL_COLORS;

export function formatColorLabel(color: RalColorOption): string {
  return color.noRal ? color.name : `RAL ${color.id} ${color.name}`;
}

export function findColorByHex(hex: string, palette?: RalColorOption[]): RalColorOption | undefined {
  const normalized = hex.toLowerCase();
  const search = palette ?? ALL_RAL_COLORS;
  return search.find((c) => c.hex.toLowerCase() === normalized);
}
