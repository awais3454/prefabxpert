export type StyleType = "traditional" | "kader";
export type CladdingMaterial = "rondkantpanelen" | "hpl";

export interface WindowConfig {
  // Navigation
  currentStep: number;   // 1–10

  // Base Dimensions
  windowWidth: number;   // mm — single/default kozijn width
  windowWidths: number[]; // mm — per-copy kozijn widths (length = windowCopies)
  windowHeight: number;  // mm
  lintelLevel: number;   // mm — subtracted from windowHeight
  panelCount: 1 | 2 | 3 | 4 | 5;
  windowCopies: number;  // 1–5
  spacings: number[];    // mm — penanten between adjacent kopijnen (length = windowCopies-1), 200–4000
  wallSideOffset: number; // mm — margin around window envelope on all 4 sides

  // Style & Cladding
  styleType: StyleType;
  claddingMaterial: CladdingMaterial;

  // Colors
  frontColor: string;    // CSS/HEX color e.g. "Anthracite"
  sideColor: string;     // Color for side cheeks
  fasciaColor: string;   // Color for the top front board
  frameColor: string;    // Color for window frames
  sashColor: string;     // Color for window sashes (draaikiepraam)

  // Roof & Pitch
  roofEnabled: boolean;
  roofOffset: number;    // mm — overhang beyond wall edges
  pitchDeg: number;      // degrees — roof pitch angle

  // Dakkapel step — roof covering & connection
  roofCovering: "bitumen" | "epdm";       // Dakbedekking
  roofConnection: "lood" | "loodvervanger"; // Aansluiting pannendak

  // Roof tile color (Dakpankleur)
  roofTileColor: "rood" | "antraciet";

  // Step 2: customer doesn't know the roof pitch angle
  pitchUnknown?: boolean;

  // Rolluik (roller shutter) color
  shutterColor?: string;

  // Options
  trimEnabled: boolean;
  trimThickness: number; // mm
  trimDepth: number;     // mm — extrusion from wall
  trimOffset: number;    // mm — distance from window frame
  shutterEnabled: boolean;
  shutterOpen: number;   // 0–100 (0=open, 100=closed)
  slatHeight: number;    // mm
  slatDepth: number;     // mm
  guideWidth: number;    // mm
  boxHeight: number;     // mm
  shutterOffset: number; // mm — distance from wall face
  insectScreenEnabled: boolean;
  insectScreenOffset: number;  // mm — Z offset from glass
  insectScreenDepth: number;   // mm
  insectScreenOpacity: number; // 0–1
  ventGrillEnabled: boolean;
  ventGrillHeight: number;     // mm
  ventGrillDepth: number;      // mm
  ventGrillOffsetFromTop: number; // mm
  ventGrillInset: number;      // mm — inset from window width
  ventGrillBiColor?: boolean;
  zonwerendGlasEnabled?: boolean;
  glasroedenEnabled?: boolean;
  tripleGlasEnabled?: boolean;
  kruiroeden4VaksEnabled?: boolean;
  kruiroedenColor?: "9001" | "9010";
  houtnerfEnabled?: boolean;
  // Step 9: Extra Options
  afvalAfvoerenEnabled?: boolean;
  externalScreensEnabled?: boolean;
  aircoEnabled?: boolean;
  melkglasEnabled?: boolean;
  screenlineEnabled?: boolean;
  skgBeslagEnabled?: boolean;
  ventilatiestandEnabled?: boolean;
  // Step 10: Position
  dormerPosition: "voorzijde" | "achterzijde" | "linkerkant" | "rechterkant";
  demountExisting: boolean;
  // Normalized dormer placement on the roof plane (0 = left/bottom edge, 1 = right/top edge)
  dormerOffsetX: number; // 0–1, horizontal position along roof ridge
  dormerOffsetY: number; // 0–1, vertical position along roof slope
}

/** Fixed wall thicknesses — not user-configurable */
export const FRONT_WALL_THICKNESS = 250; // mm — main front wall
export const BACK_WALL_THICKNESS = 200;  // mm — back extrusion walls
/** @deprecated Use FRONT_WALL_THICKNESS or BACK_WALL_THICKNESS */
export const WALL_THICKNESS = FRONT_WALL_THICKNESS;

export const DEFAULT_CONFIG: WindowConfig = {
  currentStep: 1,
  windowWidth: 2000,
  windowWidths: [2000],
  windowHeight: 1500,
  lintelLevel: 0,
  panelCount: 1,
  windowCopies: 1,
  spacings: [200, 200, 200, 200],
  wallSideOffset: 0,
  styleType: "traditional",
  claddingMaterial: "rondkantpanelen",
  frontColor: "#F7F9EF", // RAL 9010 Wit
  sideColor: "#F7F9EF",
  fasciaColor: "#F7F9EF",
  frameColor: "#F7F9EF",  // RAL 9010 Wit
  sashColor: "#F7F9EF",
  roofEnabled: true,
  roofOffset: 150,
  pitchDeg: 35,
  roofCovering: "bitumen",
  roofConnection: "lood",
  roofTileColor: "antraciet",
  pitchUnknown: false,
  shutterColor: "#F7F9EF",
  trimEnabled: false,
  trimThickness: 40,
  trimDepth: 30,
  trimOffset: 0,
  shutterEnabled: false,
  shutterOpen: 0,
  slatHeight: 12,
  slatDepth: 10,
  guideWidth: 20,
  boxHeight: 80,
  shutterOffset: 5,
  insectScreenEnabled: false,
  insectScreenOffset: 10,
  insectScreenDepth: 5,
  insectScreenOpacity: 0.35,
  ventGrillEnabled: false,
  ventGrillHeight: 120,
  ventGrillDepth: 60,
  ventGrillOffsetFromTop: 20,
  ventGrillInset: 10,
  ventGrillBiColor: false,
  zonwerendGlasEnabled: false,
  glasroedenEnabled: false,
  tripleGlasEnabled: false,
  kruiroeden4VaksEnabled: false,
  kruiroedenColor: "9001",
  houtnerfEnabled: false,
  // Step 9: Extra Options
  afvalAfvoerenEnabled: false,
  externalScreensEnabled: false,
  aircoEnabled: false,
  melkglasEnabled: false,
  screenlineEnabled: false,
  skgBeslagEnabled: false,
  ventilatiestandEnabled: false,
  // Step 10: Position
  dormerPosition: "achterzijde",
  demountExisting: false,
  dormerOffsetX: 0.5,
  dormerOffsetY: 0.5,
};

// All in mm
export const FRAME_CONSTANTS = {
  outerFrameThickness: 60,
  outerFrameDepth: 80,
  sashThickness: 45,
  sashDepth: 70,
  glassDepth: 6,
  mullionWidth: 50,
  mullionDepth: 80,
};

export const WALL_CONSTANTS = {
  wallDepth: 200,        // mm (legacy, kept for reference)
  wallBottomMargin: 600, // mm below sill
  wallTopMargin: 400,    // mm above window top
};

export function computeEffectiveHeight(config: WindowConfig): number {
  return Math.max(300, config.windowHeight - config.lintelLevel);
}