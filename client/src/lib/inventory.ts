/**
 * Inventory model, normalization and the client-side filter engine.
 *
 * The site is statically hosted, so there is no upstream inventory service to
 * filter against: every query runs in the browser over the build-time snapshot
 * in `client/src/data/inventory.json`. Three rules keep it honest:
 *
 *  1. The URL query string is the single source of truth. Component state is
 *     derived from it, never the other way around.
 *  2. Comparisons are made against normalized enum values (`"used"`), never the
 *     display strings ("Pre-Owned"), so `condition=new` can never match a used
 *     cart.
 *  3. A value that is part of a facet's declared vocabulary but matches nothing
 *     filters normally (and yields a named empty state). A value that is *not*
 *     in the vocabulary is reported as ignored and dropped from matching, so a
 *     typo or a stale link never silently returns zero results.
 *
 * This module is pure and has no DOM or React dependency, which is what lets the
 * build scripts and the test suite exercise exactly the code the browser runs.
 */

export type Condition = "new" | "used";
export type DriveType = "4x4" | "4x2";
export type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc" | "seats-asc" | "seats-desc";

export interface InventoryItem {
  id: string;
  slug: string;
  sku: string;
  year: number;
  condition: Condition;
  make: string;
  makeName: string;
  model: string;
  modelName: string;
  trim: string;
  color: string;
  colorName: string;
  colorHex: string;
  seats: number;
  drive: DriveType;
  features: string[];
  price: number;
  priceCurrency: string;
  availability: string;
  topSpeedMph: number;
  rangeMilesMin: number;
  rangeMilesMax: number;
  motorKw: number;
  batteryVolts: number;
  batteryType: string;
  /** Key into the generated image manifest. */
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  highlights: string[];
  modelPath: string;
  updatedAt: string;
}

export interface InventorySnapshot {
  updatedAt: string;
  source: string;
  count: number;
  items: InventoryItem[];
}

/* ------------------------------------------------------------------ *
 * Normalization
 * ------------------------------------------------------------------ */

const CONDITION_SYNONYMS: Record<string, Condition> = {
  new: "new",
  brandnew: "new",
  unused: "new",
  used: "used",
  preowned: "used",
  preloved: "used",
  secondhand: "used",
  certifiedpreowned: "used",
  cpo: "used",
};

const COLOR_SYNONYMS: Record<string, string> = {
  grey: "gray",
  charcoal: "gray",
  silver: "gray",
  skyblue: "sky-blue",
  lightblue: "sky-blue",
  navy: "blue",
  onyx: "black",
};

/** Lowercase, trim, collapse whitespace and punctuation into single hyphens. */
export function slugify(value: string): string {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map any spelling of a condition onto the `new` / `used` enum. */
export function normalizeCondition(value: unknown): Condition | null {
  if (value == null) return null;
  const key = String(value).toLowerCase().replace(/[^a-z]/g, "");
  return CONDITION_SYNONYMS[key] ?? null;
}

/** Map any spelling of a color onto the catalog color enum. */
export function normalizeColor(value: unknown): string | null {
  if (value == null) return null;
  const compact = String(value).toLowerCase().replace(/[^a-z]/g, "");
  if (COLOR_SYNONYMS[compact]) return COLOR_SYNONYMS[compact];
  const slug = slugify(String(value));
  return slug || null;
}

export function normalizeDrive(value: unknown): DriveType | null {
  if (value == null) return null;
  const compact = String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["4x4", "4wd", "awd", "fourwheeldrive", "44"].includes(compact)) return "4x4";
  if (["4x2", "2wd", "rwd", "reardrive", "42"].includes(compact)) return "4x2";
  return null;
}

/* ------------------------------------------------------------------ *
 * Facet vocabulary
 * ------------------------------------------------------------------ */

export type FacetKey = "condition" | "model" | "color" | "seats" | "drive" | "feature";

/**
 * The declared vocabulary for each facet. A URL value inside this list is a real
 * filter even when nothing matches it today (`?condition=used` on an all-new
 * catalog correctly returns nothing). A value outside it is treated as noise.
 */
export const FACET_VOCABULARY: Record<FacetKey, readonly string[]> = {
  condition: ["new", "used"],
  model: ["d-max-xt4", "d-max-xt6"],
  color: ["white", "black", "blue", "gray", "red", "sky-blue"],
  seats: ["4", "6"],
  drive: ["4x4", "4x2"],
  feature: ["street-legal", "lifted", "lithium", "all-terrain-tires", "4x4"],
};

export const FACET_LABELS: Record<FacetKey, string> = {
  condition: "Condition",
  model: "Model",
  color: "Color",
  seats: "Seats",
  drive: "Drive",
  feature: "Features",
};

/** Human-readable label for a single facet value, used in chips and empty states. */
export function facetValueLabel(facet: FacetKey, value: string): string {
  if (facet === "seats") return `${value}-Passenger`;
  if (facet === "model") return value === "d-max-xt4" ? "EVolution D-MAX XT4" : value === "d-max-xt6" ? "EVolution D-MAX XT6" : value;
  if (facet === "drive") return value.toUpperCase();
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ------------------------------------------------------------------ *
 * Filter state <-> URL
 * ------------------------------------------------------------------ */

export interface FilterState {
  condition: string[];
  model: string[];
  color: string[];
  seats: string[];
  drive: string[];
  feature: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortKey;
  page: number;
}

export const FACET_KEYS: readonly FacetKey[] = ["condition", "model", "color", "seats", "drive", "feature"];

export const SORT_KEYS: readonly SortKey[] = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "seats-asc",
  "seats-desc",
];

export const DEFAULT_SORT: SortKey = "featured";
export const PAGE_SIZE = 12;

export function emptyFilterState(): FilterState {
  return {
    condition: [],
    model: [],
    color: [],
    seats: [],
    drive: [],
    feature: [],
    minPrice: null,
    maxPrice: null,
    sort: DEFAULT_SORT,
    page: 1,
  };
}

/** Normalize a raw URL value for a facet so `?color=Sky%20Blue` and `?color=sky-blue` agree. */
function normalizeFacetValue(facet: FacetKey, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  switch (facet) {
    case "condition":
      return normalizeCondition(trimmed) ?? slugify(trimmed);
    case "color":
      return normalizeColor(trimmed) ?? slugify(trimmed);
    case "drive":
      return normalizeDrive(trimmed) ?? slugify(trimmed);
    case "seats": {
      const digits = trimmed.replace(/[^0-9]/g, "");
      return digits;
    }
    default:
      return slugify(trimmed);
  }
}

/**
 * Collect every value for a param, accepting both repeated params
 * (`?color=black&color=red`) and comma-joined values (`?color=black,red`).
 * Values are normalized, de-duplicated and sorted so serialization is stable.
 */
function readMulti(params: URLSearchParams, facet: FacetKey): string[] {
  const out = new Set<string>();
  for (const raw of params.getAll(facet)) {
    for (const part of raw.split(",")) {
      const value = normalizeFacetValue(facet, part);
      if (value) out.add(value);
    }
  }
  return Array.from(out).sort();
}

function readInt(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw == null || raw.trim() === "") return null;
  const parsed = Number.parseInt(raw.replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Reconstruct the complete view state from a query string. */
export function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const state = emptyFilterState();

  for (const facet of FACET_KEYS) {
    state[facet] = readMulti(params, facet);
  }

  let min = readInt(params, "minPrice");
  let max = readInt(params, "maxPrice");
  if (min != null && min < 0) min = 0;
  if (max != null && max < 0) max = null;
  if (min != null && max != null && min > max) {
    // A reversed range is a user error, not a reason to show nothing.
    [min, max] = [max, min];
  }
  state.minPrice = min;
  state.maxPrice = max;

  const sort = (params.get("sort") ?? "").trim().toLowerCase() as SortKey;
  state.sort = SORT_KEYS.includes(sort) ? sort : DEFAULT_SORT;

  const page = readInt(params, "page");
  state.page = page != null && page > 0 ? page : 1;

  return state;
}

/**
 * Canonical query string for a filter state. Keys appear in a fixed order and
 * values are sorted, so `serialize(parse(x))` is idempotent.
 */
export function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams();
  for (const facet of FACET_KEYS) {
    for (const value of [...state[facet]].sort()) {
      params.append(facet, value);
    }
  }
  if (state.minPrice != null) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice != null) params.set("maxPrice", String(state.maxPrice));
  if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveFilters(state: FilterState): boolean {
  return (
    FACET_KEYS.some((facet) => state[facet].length > 0) ||
    state.minPrice != null ||
    state.maxPrice != null
  );
}

/** Toggle one value of one facet, resetting pagination the way a user expects. */
export function toggleFacetValue(state: FilterState, facet: FacetKey, value: string): FilterState {
  const current = new Set(state[facet]);
  if (current.has(value)) current.delete(value);
  else current.add(value);
  return { ...state, [facet]: Array.from(current).sort(), page: 1 };
}

/* ------------------------------------------------------------------ *
 * Matching
 * ------------------------------------------------------------------ */

/** The value(s) an item exposes for a facet. */
function itemValues(item: InventoryItem, facet: FacetKey): string[] {
  switch (facet) {
    case "condition":
      return [item.condition];
    case "model":
      return [item.model];
    case "color":
      return [item.color];
    case "seats":
      return [String(item.seats)];
    case "drive":
      return [item.drive];
    case "feature":
      return item.features;
  }
}

export interface IgnoredFilter {
  facet: FacetKey;
  value: string;
}

export interface FilterResult {
  items: InventoryItem[];
  /** Items matching every facet, before pagination. */
  total: number;
  page: number;
  pageCount: number;
  /** URL values dropped because they are not part of the facet vocabulary. */
  ignored: IgnoredFilter[];
}

function splitRecognized(state: FilterState, facet: FacetKey) {
  const vocabulary = FACET_VOCABULARY[facet];
  const recognized: string[] = [];
  const unknown: string[] = [];
  for (const value of state[facet]) {
    if (vocabulary.includes(value)) recognized.push(value);
    else unknown.push(value);
  }
  return { recognized, unknown };
}

function matchesFacets(item: InventoryItem, recognizedByFacet: Record<FacetKey, string[]>): boolean {
  for (const facet of FACET_KEYS) {
    const selected = recognizedByFacet[facet];
    if (selected.length === 0) continue; // facet not constrained
    const values = itemValues(item, facet);
    // OR within a facet, AND across facets.
    if (!selected.some((value) => values.includes(value))) return false;
  }
  return true;
}

function matchesPrice(item: InventoryItem, state: FilterState): boolean {
  if (state.minPrice != null && item.price < state.minPrice) return false;
  if (state.maxPrice != null && item.price > state.maxPrice) return false;
  return true;
}

function compare(a: InventoryItem, b: InventoryItem, sort: SortKey): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price || a.title.localeCompare(b.title);
    case "price-desc":
      return b.price - a.price || a.title.localeCompare(b.title);
    case "name-asc":
      return a.title.localeCompare(b.title);
    case "seats-asc":
      return a.seats - b.seats || a.price - b.price;
    case "seats-desc":
      return b.seats - a.seats || a.price - b.price;
    case "featured":
    default:
      return a.model.localeCompare(b.model) || a.price - b.price || a.title.localeCompare(b.title);
  }
}

/** Apply a filter state to the snapshot. Pure; safe to call from tests and SSR. */
export function applyFilters(items: readonly InventoryItem[], state: FilterState): FilterResult {
  const recognizedByFacet = {} as Record<FacetKey, string[]>;
  const ignored: IgnoredFilter[] = [];

  for (const facet of FACET_KEYS) {
    const { recognized, unknown } = splitRecognized(state, facet);
    recognizedByFacet[facet] = recognized;
    for (const value of unknown) ignored.push({ facet, value });
  }

  const matched = items
    .filter((item) => matchesFacets(item, recognizedByFacet) && matchesPrice(item, state))
    .sort((a, b) => compare(a, b, state.sort));

  const pageCount = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, state.page), pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: matched.slice(start, start + PAGE_SIZE),
    total: matched.length,
    page,
    pageCount,
    ignored,
  };
}

/* ------------------------------------------------------------------ *
 * Facet counts
 * ------------------------------------------------------------------ */

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected: boolean;
}

/**
 * Counts for every option of every facet, computed against the current result
 * set. Standard faceting semantics: a facet's own selection is excluded from its
 * own counts, so a user can always see what selecting a second color would add.
 * A zero count means the option is a dead end and the UI disables it.
 */
export function computeFacets(
  items: readonly InventoryItem[],
  state: FilterState,
): Record<FacetKey, FacetOption[]> {
  const recognizedByFacet = {} as Record<FacetKey, string[]>;
  for (const facet of FACET_KEYS) {
    recognizedByFacet[facet] = splitRecognized(state, facet).recognized;
  }

  const result = {} as Record<FacetKey, FacetOption[]>;

  for (const facet of FACET_KEYS) {
    const others: Record<FacetKey, string[]> = { ...recognizedByFacet, [facet]: [] };
    const pool = items.filter((item) => matchesFacets(item, others) && matchesPrice(item, state));

    result[facet] = FACET_VOCABULARY[facet].map((value) => ({
      value,
      label: facetValueLabel(facet, value),
      count: pool.filter((item) => itemValues(item, facet).includes(value)).length,
      selected: state[facet].includes(value),
    }));
  }

  return result;
}

/** Chips describing what is currently filtered, for the header and empty state. */
export function describeActiveFilters(state: FilterState): string[] {
  const parts: string[] = [];
  for (const facet of FACET_KEYS) {
    for (const value of state[facet]) {
      parts.push(`${FACET_LABELS[facet]}: ${facetValueLabel(facet, value)}`);
    }
  }
  if (state.minPrice != null) parts.push(`Min price: $${state.minPrice.toLocaleString("en-US")}`);
  if (state.maxPrice != null) parts.push(`Max price: $${state.maxPrice.toLocaleString("en-US")}`);
  return parts;
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
