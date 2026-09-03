/**
 * Image pipeline.
 *
 * Raw originals stay in `attached_assets/` (outside the deployed output). This
 * script derives responsive WebP + AVIF versions into `client/public/img/`, which
 * Vite copies verbatim into `dist/`, and writes a manifest that
 * `<ResponsiveImage>` reads to emit `srcset`, `sizes` and intrinsic dimensions.
 *
 * Only optimized derivatives ship. The originals are never referenced from the
 * built site, so the 600 KB source PNGs never reach a visitor.
 */

import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { optimize as svgoOptimize } from "svgo";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIRS = [path.join(ROOT, "attached_assets"), path.join(ROOT, "attached_assets/stock_images")];
const OUT_DIR = path.join(ROOT, "client/public/img");
const MANIFEST = path.join(ROOT, "client/src/generated/images.json");
const PUBLIC_DIR = path.join(ROOT, "client/public");

/** Responsive widths. Nothing is upscaled past its source. */
const WIDTHS = [400, 800, 1200, 1600];
/** Cap for non-gallery sources; anything wider is downscaled. */
const MAX_WIDTH = 2000;

/**
 * Quality is graduated by width. Small tiers are viewed at close to 1:1 and
 * benefit from the extra bits; the 1200/1600 tiers are scaled down in every
 * layout that uses them, so a lower quality is invisible and keeps the LCP
 * image inside its budget.
 */
function webpQuality(width: number): number {
  return width >= 1200 ? 72 : 80;
}
function avifQuality(width: number): number {
  return width >= 1200 ? 45 : 50;
}

/** Source image for the favicon, apple-touch icon and OG card. */
const BRAND_SOURCE = "allterraingolfcarts.com_1768251737476.png";

export interface ImageVariant {
  width: number;
  height: number;
}

export interface ImageEntry {
  slug: string;
  width: number;
  height: number;
  variants: ImageVariant[];
}

export type ImageManifest = Record<string, ImageEntry>;

function slugifyFilename(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    // Replit appends an upload timestamp; it carries no meaning for a reader or a crawler.
    .replace(/_\d{10,}$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Filenames actually referenced from the source tree. `attached_assets/` holds
 * every file ever uploaded to the Replit project, including images no page shows;
 * shipping derivatives for those would be dead weight in `dist/`.
 */
async function collectReferencedNames(): Promise<Set<string>> {
  const referenced = new Set<string>([BRAND_SOURCE]);
  const roots = [path.join(ROOT, "client/src"), path.join(ROOT, "script")];

  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(tsx?|json|html|css)$/.test(entry.name)) continue;
      if (entry.name === "images.json") continue;
      const source = await readFile(full, "utf-8");
      // Filenames here contain &, parentheses, dots and apostrophes.
      for (const match of source.matchAll(/[\w().&'-]+\.(?:jpe?g|png)/gi)) {
        referenced.add(match[0]);
      }
    }
  }

  for (const root of roots) {
    if (existsSync(root)) await walk(root);
  }
  return referenced;
}

async function listImages(): Promise<{ sources: string[]; skipped: string[] }> {
  const referenced = await collectReferencedNames();
  const sources: string[] = [];
  const skipped: string[] = [];

  for (const dir of SOURCE_DIRS) {
    if (!existsSync(dir)) continue;
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;
      if (referenced.has(entry.name)) sources.push(path.join(dir, entry.name));
      else skipped.push(entry.name);
    }
  }
  return { sources: sources.sort(), skipped: skipped.sort() };
}

async function processImage(sourcePath: string, manifest: ImageManifest, seen: Map<string, string>) {
  const filename = path.basename(sourcePath);
  let slug = slugifyFilename(filename);

  // The originals were uploaded more than once, so several filenames differ only
  // by their trailing timestamp. Identical bytes share one set of derivatives;
  // same name but different bytes gets a content-hash suffix instead.
  const digest = createHash("sha1").update(await readFile(sourcePath)).digest("hex");
  const previous = seen.get(slug);
  if (previous) {
    if (previous === digest) {
      const original = Object.entries(manifest).find(([, entry]) => entry.slug === slug);
      if (original) {
        manifest[filename] = original[1];
        return;
      }
    }
    slug = `${slug}-${digest.slice(0, 6)}`;
  }
  seen.set(slug, digest);

  const input = sharp(sourcePath, { failOn: "error" });
  const metadata = await input.metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  if (!sourceWidth || !sourceHeight) throw new Error(`could not read dimensions of ${filename}`);

  const cappedWidth = Math.min(sourceWidth, MAX_WIDTH);
  const cappedHeight = Math.round((sourceHeight / sourceWidth) * cappedWidth);

  // Standard tiers only. A source that sits just above the top tier (a 1920px
  // hero over the 1600 tier) does not earn a variant of its own: the extra
  // ~350 KB buys about 20% more pixels that no layout uses.
  const targetWidths = WIDTHS.filter((w) => w <= cappedWidth);
  if (targetWidths.length === 0) targetWidths.push(cappedWidth);

  const variants: ImageVariant[] = [];
  for (const width of targetWidths) {
    const height = Math.round((sourceHeight / sourceWidth) * width);
    // `.rotate()` bakes in EXIF orientation; sharp then drops all other metadata.
    const pipeline = sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });
    await pipeline.clone().webp({ quality: webpQuality(width), effort: 5 }).toFile(path.join(OUT_DIR, `${slug}-${width}.webp`));
    await pipeline.clone().avif({ quality: avifQuality(width), effort: 4 }).toFile(path.join(OUT_DIR, `${slug}-${width}.avif`));
    variants.push({ width, height });
  }

  manifest[filename] = { slug, width: cappedWidth, height: cappedHeight, variants };
}

/** Favicon, apple-touch icon and a correctly sized 1200x630 OG card. */
async function buildBrandAssets() {
  const source = path.join(ROOT, "attached_assets", BRAND_SOURCE);
  if (!existsSync(source)) {
    console.warn(`[optimize-assets] brand source ${BRAND_SOURCE} is missing; leaving favicon/og-image as-is`);
    return;
  }

  await sharp(source).rotate().resize(512, 512, { fit: "cover" }).png({ compressionLevel: 9, palette: true })
    .toFile(path.join(PUBLIC_DIR, "favicon.png"));
  await sharp(source).rotate().resize(180, 180, { fit: "cover" }).png({ compressionLevel: 9, palette: true })
    .toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));
  // Open Graph wants 1.91:1. A center crop of the square source keeps the mark centered.
  await sharp(source).rotate().resize(1200, 630, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(PUBLIC_DIR, "og-image.png"));

  console.log("[optimize-assets] rebuilt favicon.png (512), apple-touch-icon.png (180), og-image.png (1200x630)");
}

async function optimizeSvgs() {
  if (!existsSync(PUBLIC_DIR)) return;
  let count = 0;
  for (const entry of await readdir(PUBLIC_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".svg")) continue;
    const filePath = path.join(PUBLIC_DIR, entry.name);
    const source = await readFile(filePath, "utf-8");
    const { data } = svgoOptimize(source, { path: filePath, multipass: true });
    await writeFile(filePath, data, "utf-8");
    count += 1;
  }
  if (count) console.log(`[optimize-assets] ran SVGO over ${count} SVG(s)`);
}

async function dirSize(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? await dirSize(full) : (await stat(full)).size;
  }
  return total;
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const { sources, skipped } = await listImages();
  if (sources.length === 0) {
    console.error("[optimize-assets] FAILED: no referenced source images found under attached_assets/");
    process.exit(1);
  }
  if (skipped.length) {
    console.log(`[optimize-assets] skipped ${skipped.length} unreferenced original(s): ${skipped.join(", ")}`);
  }

  let before = 0;
  for (const source of sources) before += (await stat(source)).size;

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const manifest: ImageManifest = {};
  const seen = new Map<string, string>();
  for (const source of sources) {
    await processImage(source, manifest, seen);
  }

  await buildBrandAssets();
  await optimizeSvgs();

  await writeFile(MANIFEST, JSON.stringify(manifest), "utf-8");

  const after = await dirSize(OUT_DIR);
  console.log(
    `[optimize-assets] ${sources.length} source images (${mb(before)}) -> ` +
      `${Object.values(manifest).reduce((n, e) => n + e.variants.length * 2, 0)} derivatives (${mb(after)})`,
  );
  console.log(`[optimize-assets] manifest: ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((error) => {
  console.error(`[optimize-assets] FAILED: ${(error as Error).stack ?? error}`);
  process.exit(1);
});
