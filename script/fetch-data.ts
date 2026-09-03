/**
 * Build-time inventory snapshot.
 *
 * GitHub Pages serves files, not code, so every dataset the app used to read
 * from its own API is resolved here and written to `client/src/data/inventory.json`,
 * which the client imports at build time.
 *
 * Two sources, in priority order:
 *
 *  1. `INVENTORY_FEED_URL` (optional, with `INVENTORY_FEED_TOKEN` for auth) —
 *     a real inventory feed. Its rows are normalized onto the same enum
 *     vocabulary the filters use, so "Pre-Owned" can never leak through as a
 *     condition that `?condition=new` might match.
 *  2. The model catalog in `client/src/data/models.ts` — every model/color
 *     configuration the dealership sells, which is what the site advertises today.
 *
 * If a feed is configured but unreachable or malformed, this script fails loudly
 * and leaves the last good committed snapshot in place. It never writes a partial
 * or empty snapshot over a good one.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { models, makeId, makeName, type ModelDefinition, type ModelColor } from "../client/src/data/models";
import {
  normalizeCondition,
  normalizeColor,
  normalizeDrive,
  slugify,
  FACET_VOCABULARY,
  type InventoryItem,
  type InventorySnapshot,
} from "../client/src/lib/inventory";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "client/src/data/inventory.json");

/** Fields deliberately dropped from the snapshot because no view reads them. */
const DROPPED_FEED_FIELDS = [
  "internalNotes",
  "cost",
  "dealerCost",
  "floorplanStatus",
  "acquisitionDate",
  "vendorId",
  "rawHtmlDescription",
  "createdBy",
  "lastModifiedBy",
];

function fail(message: string): never {
  console.error(`\n[fetch-data] FAILED: ${message}`);
  if (existsSync(OUTPUT)) {
    console.error(`[fetch-data] The last good snapshot at ${path.relative(ROOT, OUTPUT)} was left untouched.`);
    console.error("[fetch-data] The build will continue against that fallback only if you run `npm run build:site`.");
  } else {
    console.error("[fetch-data] There is no committed fallback snapshot to fall back to.");
  }
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Source 1: the model catalog
 * ------------------------------------------------------------------ */

function buildItemFromCatalog(model: ModelDefinition, color: ModelColor, updatedAt: string): InventoryItem {
  const slug = slugify(`${model.year} ${model.name} ${color.name}`);
  const title = `${model.year} ${model.name} — ${color.name}`;

  return {
    id: `${model.sku}-${color.value.toUpperCase()}`,
    slug,
    sku: `${model.sku}-${color.value.toUpperCase()}`,
    year: model.year,
    condition: "new",
    make: makeId,
    makeName,
    model: model.id,
    modelName: model.name,
    trim: `${model.seats}-Passenger 4X4`,
    color: color.value,
    colorName: color.name,
    colorHex: color.hex,
    seats: model.seats,
    drive: model.drive,
    features: [...model.features],
    price: model.price,
    priceCurrency: model.priceCurrency,
    availability: model.availability,
    topSpeedMph: model.topSpeedMph,
    rangeMilesMin: model.rangeMilesMin,
    rangeMilesMax: model.rangeMilesMax,
    motorKw: model.motorKw,
    batteryVolts: model.batteryVolts,
    batteryType: model.batteryType,
    image: color.image,
    imageAlt: `${color.name} ${model.name} ${model.seats}-passenger 4X4 all terrain golf cart, new, shown in profile view`,
    title,
    description: `New ${color.name.toLowerCase()} ${model.name}: a ${model.seats}-passenger 4X4 all terrain golf cart with dual ${model.motorKw}kW motors, ${model.rangeMilesMin}-${model.rangeMilesMax} miles of range and a street-legal LSV package.`,
    highlights: [...model.highlights],
    modelPath: model.path,
    updatedAt,
  };
}

function buildFromCatalog(updatedAt: string): InventoryItem[] {
  return models.flatMap((model) => model.colors.map((color) => buildItemFromCatalog(model, color, updatedAt)));
}

/* ------------------------------------------------------------------ *
 * Source 2: an external feed
 * ------------------------------------------------------------------ */

function pickNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Map one feed row onto the normalized snapshot shape. Anything the feed cannot
 * supply falls back to the matching catalog model, so a thin feed still yields
 * pages with real specs rather than blanks.
 */
function normalizeFeedRow(row: Record<string, unknown>, index: number, updatedAt: string): InventoryItem | null {
  const modelRaw = String(row.model ?? row.modelName ?? "");
  const modelId = slugify(modelRaw).replace(/^evolution-/, "");
  const model = models.find((m) => m.id === modelId || slugify(m.name).includes(modelId)) ?? models[0];

  const condition = normalizeCondition(row.condition ?? row.itemCondition ?? "new");
  if (!condition) {
    console.warn(`[fetch-data] row ${index}: unrecognized condition ${JSON.stringify(row.condition)}, skipping`);
    return null;
  }

  const colorRaw = String(row.color ?? row.exteriorColor ?? "");
  const color = normalizeColor(colorRaw) ?? "unspecified";
  const catalogColor = model.colors.find((c) => c.value === color) ?? model.colors[0];

  const drive = normalizeDrive(row.drive ?? row.driveType ?? model.drive) ?? model.drive;
  const year = Math.round(pickNumber(row.year, model.year));
  const price = Math.round(pickNumber(row.price, model.price));
  const seats = Math.round(pickNumber(row.seats ?? row.seatingCapacity, model.seats));

  const features = Array.isArray(row.features)
    ? (row.features as unknown[]).map((f) => slugify(String(f))).filter((f) => FACET_VOCABULARY.feature.includes(f))
    : [...model.features];

  const colorName = catalogColor.name;
  const slug = slugify(`${year} ${model.name} ${colorName} ${row.stockNumber ?? row.vin ?? index}`);

  return {
    id: String(row.id ?? row.stockNumber ?? slug),
    slug,
    sku: String(row.stockNumber ?? row.sku ?? `${model.sku}-${index}`),
    year,
    condition,
    make: makeId,
    makeName,
    model: model.id,
    modelName: model.name,
    trim: String(row.trim ?? `${seats}-Passenger ${drive.toUpperCase()}`),
    color,
    colorName,
    colorHex: catalogColor.hex,
    seats,
    drive,
    features,
    price,
    priceCurrency: String(row.priceCurrency ?? model.priceCurrency),
    availability: String(row.availability ?? model.availability),
    topSpeedMph: Math.round(pickNumber(row.topSpeedMph, model.topSpeedMph)),
    rangeMilesMin: Math.round(pickNumber(row.rangeMilesMin, model.rangeMilesMin)),
    rangeMilesMax: Math.round(pickNumber(row.rangeMilesMax, model.rangeMilesMax)),
    motorKw: pickNumber(row.motorKw, model.motorKw),
    batteryVolts: Math.round(pickNumber(row.batteryVolts, model.batteryVolts)),
    batteryType: String(row.batteryType ?? model.batteryType),
    image: String(row.image ?? catalogColor.image),
    imageAlt: `${colorName} ${model.name} ${seats}-passenger ${drive.toUpperCase()} all terrain golf cart, ${condition}`,
    title: `${year} ${model.name} — ${colorName}`,
    description: String(
      row.description ??
        `${condition === "new" ? "New" : "Used"} ${colorName.toLowerCase()} ${model.name}: a ${seats}-passenger ${drive.toUpperCase()} all terrain golf cart.`,
    ),
    highlights: [...model.highlights],
    modelPath: model.path,
    updatedAt,
  };
}

async function fetchFromFeed(url: string, updatedAt: string): Promise<InventoryItem[]> {
  const token = process.env.INVENTORY_FEED_TOKEN;
  const headers: Record<string, string> = { accept: "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    fail(`could not reach INVENTORY_FEED_URL (${url}): ${(error as Error).message}`);
  }
  if (!response.ok) {
    fail(`INVENTORY_FEED_URL returned HTTP ${response.status} ${response.statusText}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    fail(`INVENTORY_FEED_URL did not return valid JSON: ${(error as Error).message}`);
  }

  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.items)
      ? ((payload as Record<string, unknown>).items as unknown[])
      : null;

  if (!rows) fail("INVENTORY_FEED_URL payload is neither an array nor an object with an `items` array");
  if (rows.length === 0) fail("INVENTORY_FEED_URL returned zero rows; refusing to overwrite a good snapshot with an empty one");

  const items = rows
    .map((row, index) => normalizeFeedRow(row as Record<string, unknown>, index, updatedAt))
    .filter((item): item is InventoryItem => item !== null);

  if (items.length === 0) fail("every feed row failed normalization; refusing to write an empty snapshot");
  return items;
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

async function main() {
  const updatedAt = new Date().toISOString();
  const feedUrl = process.env.INVENTORY_FEED_URL;

  let items: InventoryItem[];
  let source: string;

  if (feedUrl) {
    console.log(`[fetch-data] fetching inventory from ${feedUrl}`);
    items = await fetchFromFeed(feedUrl, updatedAt);
    source = "inventory-feed";
    console.log(`[fetch-data] dropped fields not read by any view: ${DROPPED_FEED_FIELDS.join(", ")}`);
  } else {
    console.log("[fetch-data] INVENTORY_FEED_URL is not set — generating the snapshot from the model catalog");
    items = buildFromCatalog(updatedAt);
    source = "model-catalog";
  }

  // Guard against duplicate slugs, which would make two detail pages collide.
  const seen = new Map<string, string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      fail(`duplicate slug "${item.slug}" produced by ${seen.get(item.slug)} and ${item.id}`);
    }
    seen.set(item.slug, item.id);
  }

  const snapshot: InventorySnapshot = {
    updatedAt,
    source,
    count: items.length,
    items: items.sort((a, b) => a.model.localeCompare(b.model) || a.color.localeCompare(b.color)),
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  // Minified on purpose: this file ships inside the client bundle.
  await writeFile(OUTPUT, JSON.stringify(snapshot), "utf-8");

  const bytes = (await readFile(OUTPUT)).byteLength;
  console.log(
    `[fetch-data] wrote ${items.length} items (${(bytes / 1024).toFixed(1)} KB) to ${path.relative(ROOT, OUTPUT)} from ${source}`,
  );
}

main().catch((error) => {
  fail((error as Error).stack ?? String(error));
});
