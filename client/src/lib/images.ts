/**
 * Lookup layer over the generated image manifest.
 *
 * `script/optimize-assets.ts` writes `client/src/generated/images.json`, keyed by
 * the original filename in `attached_assets/`. Everything a component needs to
 * render a correct `<picture>` — intrinsic size, available widths, slugified
 * output name — comes from here, so no component ever hardcodes an asset path.
 */

import manifest from "@/generated/images.json";
import { withBase } from "@/config/site";

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

const images = manifest as unknown as Record<string, ImageEntry>;

export interface ImageSources {
  /** Fallback `src`: the widest WebP, which every current browser supports. */
  src: string;
  avifSrcSet: string;
  webpSrcSet: string;
  width: number;
  height: number;
  aspectRatio: string;
}

function url(slug: string, width: number, ext: "webp" | "avif"): string {
  return withBase(`img/${slug}-${width}.${ext}`);
}

/**
 * Resolve an original filename to its responsive derivatives. Missing entries
 * throw at render time rather than shipping a broken `<img>`: the manifest is
 * regenerated on every build, so a miss always means a stale reference.
 */
export function imageSources(name: string): ImageSources {
  const entry = images[name];
  if (!entry) {
    throw new Error(
      `No optimized derivatives for "${name}". Add the file to attached_assets/ and re-run \`npm run optimize-assets\`.`,
    );
  }

  const widest = entry.variants[entry.variants.length - 1];
  return {
    src: url(entry.slug, widest.width, "webp"),
    avifSrcSet: entry.variants.map((v) => `${url(entry.slug, v.width, "avif")} ${v.width}w`).join(", "),
    webpSrcSet: entry.variants.map((v) => `${url(entry.slug, v.width, "webp")} ${v.width}w`).join(", "),
    width: entry.width,
    height: entry.height,
    aspectRatio: `${entry.width} / ${entry.height}`,
  };
}

/**
 * A single derivative URL, for the places CSS needs one string rather than a
 * `srcset` (a decorative `background-image`, an OG tag).
 */
export function imageUrl(name: string, width = 1200, ext: "webp" | "avif" = "webp"): string {
  const entry = images[name];
  if (!entry) throw new Error(`No optimized derivatives for "${name}".`);
  const closest = entry.variants.reduce((best, v) =>
    Math.abs(v.width - width) < Math.abs(best.width - width) ? v : best,
  );
  return url(entry.slug, closest.width, ext);
}

export function hasImage(name: string): boolean {
  return Boolean(images[name]);
}
