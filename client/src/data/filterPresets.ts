/**
 * Prerendered filter pages.
 *
 * A query string is not a crawlable, linkable identity: `?condition=new` cannot
 * carry its own title, canonical or schema. Each preset below is a real URL that
 * renders the listing already filtered, so the valuable combinations are
 * indexable while the long tail stays behind the query string.
 *
 * Presets whose result set is a near-duplicate of the parent listing are marked
 * `indexable: false`: they still work as links, but they canonicalize to
 * `/inventory/` and carry `noindex`, so a thin combination cannot compete with
 * the page it duplicates.
 */

import type { FilterState } from "@/lib/inventory";
import { emptyFilterState } from "@/lib/inventory";

export interface FilterPreset {
  slug: string;
  /** <h1> on the preset page. */
  heading: string;
  /** <= 60 chars. */
  title: string;
  /** <= 155 chars. */
  description: string;
  /** The 40-60 word answer-first summary that opens the page. */
  answer: string;
  /** Partial filter state applied before the URL's own params. */
  filters: Partial<FilterState>;
  indexable: boolean;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    slug: "new",
    heading: "New All Terrain Golf Carts",
    title: "New All Terrain Golf Carts In Stock",
    description:
      "Every new all terrain golf cart in stock: 4X4 EVolution D-MAX XT4 and XT6 in six colors, with factory warranty and street-legal LSV packages.",
    answer:
      "Every all terrain golf cart in this listing is brand new, sold with the full factory warranty and a street-legal LSV equipment package. Stock covers the 4-passenger D-MAX XT4 from $15,595 and the 6-passenger D-MAX XT6 from $17,595, each in six exterior colors.",
    filters: { condition: ["new"] },
    indexable: true,
  },
  {
    slug: "used",
    heading: "Used All Terrain Golf Carts",
    title: "Used All Terrain Golf Carts",
    description:
      "Used and pre-owned 4X4 all terrain golf carts. See current used stock and how to be told when a pre-owned D-MAX comes in on trade.",
    answer:
      "Used all terrain golf carts are sold here only when a trade-in passes inspection, so this listing is often empty. When it is, the new D-MAX XT4 and XT6 start at $15,595 and $17,595 with a full factory warranty. Call (844) 884-6744 to be told when used stock arrives.",
    filters: { condition: ["used"] },
    indexable: true,
  },
  {
    slug: "4x4",
    heading: "4X4 Golf Carts",
    title: "4X4 Golf Carts | True All-Wheel Drive",
    description:
      "4X4 golf carts with two independent electric motors driving all four wheels. On-demand all-wheel drive, 25 MPH and 40-50 miles per charge.",
    answer:
      "A 4X4 golf cart drives all four wheels instead of two. The EVolution D-MAX uses two independent 6.3kW motors, one per axle, engaged on demand for 12.6kW of combined output. That is what lets it climb wet grass, sand and loose gravel where a 2WD cart spins.",
    filters: { drive: ["4x4"] },
    indexable: true,
  },
  {
    slug: "lifted",
    heading: "Lifted All Terrain Golf Carts",
    title: "Lifted Golf Carts | All-Terrain Suspension",
    description:
      'Lifted all terrain golf carts on 16" aluminum wheels with 24x10R16 all-terrain tires and hydraulic disc brakes. Street-legal LSV ready.',
    answer:
      'Every all terrain golf cart here ships lifted from the factory on 16" x 8.5" aluminum wheels wrapped in 24x10R16 all-terrain tires. The taller stance clears ruts, curbs and trail debris, and the hydraulic disc brakes are sized for the extra wheel and tire mass.',
    filters: { feature: ["lifted"] },
    indexable: true,
  },
  {
    slug: "street-legal",
    heading: "Street-Legal All Terrain Golf Carts",
    title: "Street Legal All Terrain Golf Carts (LSV)",
    description:
      "Street-legal all terrain golf carts equipped as Low Speed Vehicles: lights, turn signals, mirrors, horn, DOT tires, 3-point belts and a VIN.",
    answer:
      "A street-legal all terrain golf cart is registered as a Low Speed Vehicle (LSV). These carts leave the factory with headlights, taillights, turn signals, a horn, mirrors, DOT-approved tires, 3-point seat belts and a VIN, which is what state DMVs require for road use up to 25 MPH.",
    filters: { feature: ["street-legal"] },
    indexable: true,
  },
  {
    slug: "4-seat",
    heading: "4-Seat All Terrain Golf Carts",
    title: "4 Seat All Terrain Golf Carts | 4X4",
    description:
      "4-seat all terrain golf carts. The EVolution D-MAX XT4 carries four with 4X4 drive, 40-50 miles of range and a 2,270 lb payload. From $15,595.",
    answer:
      "A 4-seat all terrain golf cart fits four adults with 3-point belts for each. The D-MAX XT4 is the 4-seat model here: 122.6 inches long, 1,499 lb curb weight, 2,270 lb payload, 4X4 drive and 40-50 miles per charge, from $15,595.",
    filters: { seats: ["4"] },
    indexable: true,
  },
  {
    slug: "6-seat",
    heading: "6-Seat All Terrain Golf Carts",
    title: "6 Seat All Terrain Golf Carts | 4X4",
    description:
      "6-seat all terrain golf carts. The EVolution D-MAX XT6 seats six with selectable 4X2/4X4 drive and up to 50 miles of range. From $17,595.",
    answer:
      "A 6-seat all terrain golf cart carries six adults in forward-facing seats, all belted. The D-MAX XT6 is the 6-seat model here, with selectable 4X2/4X4 drive, dual 6.3kW motors, 30-50 miles of range and a 160Ah battery upgrade, from $17,595.",
    filters: { seats: ["6"] },
    indexable: true,
  },
  {
    slug: "lithium",
    heading: "Lithium All Terrain Golf Carts",
    title: "Lithium Battery All Terrain Golf Carts",
    description:
      "Lithium all terrain golf carts with 48V packs and smart battery management. No watering, faster charging, full power at a low state of charge.",
    answer:
      "Every all terrain golf cart here runs a 48V lithium pack with smart battery management rather than flooded lead-acid. Lithium needs no watering or terminal cleaning, charges faster on the onboard 25A charger, and holds voltage under load instead of fading as it discharges.",
    filters: { feature: ["lithium"] },
    indexable: true,
  },
  {
    slug: "new-4x4",
    heading: "New 4X4 All Terrain Golf Carts",
    title: "New 4X4 All Terrain Golf Carts",
    description:
      "New 4X4 all terrain golf carts in stock with dual-motor all-wheel drive and factory warranty. Browse every new EVolution D-MAX in inventory.",
    answer:
      "Every new cart in stock is 4X4, so this combination returns the same carts as the new-inventory listing. Both the D-MAX XT4 and XT6 use dual independent motors driving all four wheels on demand.",
    // Every new cart is already 4X4, so this page duplicates /inventory/new/.
    filters: { condition: ["new"], drive: ["4x4"] },
    indexable: false,
  },
];

const bySlug = new Map(FILTER_PRESETS.map((preset) => [preset.slug, preset]));

export function getPreset(slug: string): FilterPreset | undefined {
  return bySlug.get(slug);
}

/** Slugs that address a preset rather than an inventory item. */
export const PRESET_SLUGS: readonly string[] = FILTER_PRESETS.map((preset) => preset.slug);

/** A preset's filters merged with whatever the visitor has since selected. */
export function presetFilterState(preset: FilterPreset, fromUrl: FilterState): FilterState {
  const base = { ...emptyFilterState(), ...preset.filters };
  return {
    ...fromUrl,
    condition: fromUrl.condition.length ? fromUrl.condition : base.condition,
    model: fromUrl.model.length ? fromUrl.model : base.model,
    color: fromUrl.color.length ? fromUrl.color : base.color,
    seats: fromUrl.seats.length ? fromUrl.seats : base.seats,
    drive: fromUrl.drive.length ? fromUrl.drive : base.drive,
    feature: fromUrl.feature.length ? fromUrl.feature : base.feature,
  };
}
