/**
 * Canonical model catalog.
 *
 * This is the source of truth for pricing, colors, drivetrain and headline specs.
 * The model pages render from it, and `script/fetch-data.ts` expands it into the
 * inventory snapshot, so a price only ever has to change in one place.
 *
 * Images are referenced by their original filename in `attached_assets/`;
 * `script/optimize-assets.ts` turns each one into responsive WebP/AVIF
 * derivatives and records them in the generated image manifest.
 */

export interface ModelColor {
  /** Normalized enum value used in URLs, filters and schema. */
  value: string;
  name: string;
  hex: string;
  /** Source filename in `attached_assets/`. */
  image: string;
}

export interface ModelDefinition {
  /** Normalized enum value used in URLs and filters. */
  id: string;
  sku: string;
  name: string;
  shortName: string;
  path: string;
  year: number;
  price: number;
  priceCurrency: string;
  seats: number;
  drive: "4x4" | "4x2";
  availability: string;
  topSpeedMph: number;
  rangeMilesMin: number;
  rangeMilesMax: number;
  motorKw: number;
  batteryVolts: number;
  batteryType: string;
  features: string[];
  highlights: string[];
  tagline: string;
  description: string;
  specSheet: string;
  colors: ModelColor[];
}

const SHARED_FEATURES = ["street-legal", "lifted", "lithium", "all-terrain-tires", "4x4"];

export const models: ModelDefinition[] = [
  {
    id: "d-max-xt4",
    sku: "EV-DMAX-XT4",
    name: "EVolution D-MAX XT4",
    shortName: "D-MAX XT4",
    path: "/evolution-d-max-xt4",
    year: 2026,
    price: 15595,
    priceCurrency: "USD",
    seats: 4,
    drive: "4x4",
    availability: "InStock",
    topSpeedMph: 25,
    rangeMilesMin: 40,
    rangeMilesMax: 50,
    motorKw: 12.6,
    batteryVolts: 48,
    batteryType: "48V Lithium",
    features: SHARED_FEATURES,
    highlights: [
      "On-demand 4-wheel drive with dual 6.3kW AC motors",
      "40-50 mile range on a 48V lithium pack",
      '10.1" touchscreen with Apple CarPlay and Android Auto',
      "24-speaker surround sound system",
      "Built-in dash refrigerator and 74-qt portable cooler",
      "LSV street-legal equipment package",
    ],
    tagline: "4-Passenger 4X4 All-Terrain Golf Cart",
    description:
      "The EVolution D-MAX XT4 is a 4-passenger 4X4 electric golf cart with dual 6.3kW motors, on-demand all-wheel drive, 40-50 miles of range and a full LSV street-legal package.",
    specSheet: "/xt4-spec-sheet.pdf",
    colors: [
      { value: "red", name: "Red", hex: "#dc2626", image: "EVOLUTION_D-MAX_XT4_RED_1768250430375.png" },
      { value: "white", name: "White", hex: "#FFFFFF", image: "EVOLUTION_D-MAX_XT4_WHITE_1768251453734.png" },
      { value: "black", name: "Black", hex: "#1a1a1a", image: "EVOLUTION_D-MAX_XT4_BLACK_1768251453733.png" },
      { value: "blue", name: "Blue", hex: "#1e40af", image: "EVOLUTION_D-MAX_XT4_BLUE_1768251453733.png" },
      { value: "gray", name: "Gray", hex: "#6b7280", image: "EVOLUTION_D-MAX_XT4_GRAY_1768251453733.png" },
      { value: "sky-blue", name: "Sky Blue", hex: "#0ea5e9", image: "EVOLUTION_D-MAX_XT4_SKY_BLUE_1768251453732.png" },
    ],
  },
  {
    id: "d-max-xt6",
    sku: "EV-DMAX-XT6",
    name: "EVolution D-MAX XT6",
    shortName: "D-MAX XT6",
    path: "/evolution-d-max-xt6",
    year: 2026,
    price: 17595,
    priceCurrency: "USD",
    seats: 6,
    drive: "4x4",
    availability: "InStock",
    topSpeedMph: 25,
    rangeMilesMin: 30,
    rangeMilesMax: 50,
    motorKw: 12.6,
    batteryVolts: 48,
    batteryType: "48V Lithium",
    features: SHARED_FEATURES,
    highlights: [
      "Selectable 4X2 / 4X4 drive with dual 6.3kW AC motors",
      "6 forward-facing seats with 3-point belts",
      "30-50 mile range, 160Ah battery upgrade available",
      '10.1" touchscreen with Apple CarPlay and Android Auto',
      "Multicolor LED lighted soundbar speakers",
      "LSV street-legal equipment package",
    ],
    tagline: "6-Passenger 4X4 All-Terrain Golf Cart",
    description:
      "The EVolution D-MAX XT6 is a 6-passenger 4X4 electric golf cart with selectable 4X2/4X4 drive, dual 6.3kW motors, up to 50 miles of range and a full LSV street-legal package.",
    specSheet: "/xt6-spec-sheet.pdf",
    colors: [
      { value: "red", name: "Red", hex: "#dc2626", image: "EVOLUTION_D-MAX_XT6_RED_1768250430374.png" },
      { value: "white", name: "White", hex: "#FFFFFF", image: "EVOLUTION_D-MAX_XT6_WHITE_1768251535645.png" },
      { value: "black", name: "Black", hex: "#1a1a1a", image: "EVOLUTION_D-MAX_XT6_BLACK_1768251535645.png" },
      { value: "blue", name: "Blue", hex: "#1e40af", image: "EVOLUTION_D-MAX_XT6_BLUE_1768251535644.png" },
      { value: "gray", name: "Gray", hex: "#6b7280", image: "EVOLUTION_D-MAX_XT6_GRAY_1768251535644.png" },
      { value: "sky-blue", name: "Sky Blue", hex: "#0ea5e9", image: "EVOLUTION_D-MAX_XT6_SKY_BLUE_1768251535644.png" },
    ],
  },
];

export function getModel(id: string): ModelDefinition | undefined {
  return models.find((model) => model.id === id);
}

export const makeName = "EVolution Electric Vehicles";
export const makeId = "evolution";
