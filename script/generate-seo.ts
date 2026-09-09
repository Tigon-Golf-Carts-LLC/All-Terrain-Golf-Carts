/**
 * Sitemaps and robots.txt.
 *
 * `dist/sitemap.xml` is a **sitemap index**: one entry per section sitemap
 * (`sitemap-pages.xml`, `sitemap-inventory.xml`, ...), which is the single URL
 * submitted to Search Console. Every indexable URL lives in exactly one section
 * file, so a section can grow past the 50,000-URL limit without disturbing the
 * others, and coverage is reported per section rather than as one pile.
 *
 * Both the index and the section files are generated from the same route
 * registry the prerenderer walks, so a sitemap can only ever list URLs that
 * exist as files, and a `noindex` page can never leak into one.
 *
 * Image entries are harvested from the prerendered HTML itself rather than
 * curated by hand: whatever the page renders is what the sitemap advertises, so
 * the two cannot drift apart as pages change.
 */

import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer, type ViteDevServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_PATH = process.env.BASE_PATH || "/";

/** Google's hard limits are 50,000 URLs and 50 MB uncompressed, per file. */
const MAX_URLS_PER_SITEMAP = 45_000;
const MAX_SITEMAP_BYTES = 50 * 1024 * 1024;
/** Google reads at most 1,000 images per URL. */
const MAX_IMAGES_PER_URL = 1000;

type SitemapSection = "pages" | "models" | "inventory" | "guides" | "blog" | "locations";

/** Order the section sitemaps are listed in the index: broadest first. */
const SECTION_ORDER: SitemapSection[] = ["pages", "models", "inventory", "guides", "blog", "locations"];

/** AI crawlers are allowed on purpose: being cited in a zero-click answer depends on it. */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "cohere-ai", "Meta-ExternalAgent"];

interface RouteMeta {
  path: string;
  indexable: boolean;
  section: SitemapSection;
  lastmod: string;
  changefreq: string;
  priority: number;
  images?: string[];
}

/** A route paired with the absolute image URLs to advertise for it. */
interface SitemapEntry {
  route: RouteMeta;
  images: string[];
}

interface WrittenSitemap {
  name: string;
  urls: number;
  images: number;
  lastmod: string;
  bytes: number;
}

interface Loaded {
  routes: RouteMeta[];
  origin: string;
  imageUrlFor: (name: string) => string;
}

function fail(message: string): never {
  console.error(`\n[generate-seo] FAILED: ${message}`);
  process.exit(1);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absolute(origin: string, routePath: string): string {
  return routePath === "/" ? `${origin}/` : `${origin}${routePath}/`;
}

/** The prerendered file backing a route. */
function fileFor(route: RouteMeta): string {
  return route.path === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.path.slice(1), "index.html");
}

/* ------------------------------------------------------------------ *
 * Image harvesting
 * ------------------------------------------------------------------ */

const IMAGE_EXTENSION = /\.(?:avif|webp|png|jpe?g|gif|svg)$/i;

/**
 * Collapses a derivative URL to the image it is a version of, so the same
 * picture is never advertised twice at two widths:
 * `/img/evolution-d-max-xt4-red-800.webp` -> `evolution-d-max-xt4-red`.
 */
function imageIdentity(url: string): string {
  const file = url.split("/").pop() ?? url;
  return file.replace(/-\d+(?=\.[a-z0-9]+$)/i, "").replace(/\.[a-z0-9]+$/i, "");
}

function cleanUrl(raw: string): string | null {
  const url = raw
    .trim()
    .replace(/^(?:&quot;|&#34;|['"])+/, "")
    .replace(/(?:&quot;|&#34;|['"])+$/, "")
    .split("?")[0]
    .split("#")[0];
  if (!url || url.startsWith("data:")) return null;
  return IMAGE_EXTENSION.test(url) ? url : null;
}

/**
 * Every image the prerendered page actually renders.
 *
 * Only the `<img src>` fallback is taken from a `<picture>`, not the whole
 * `<source srcset>` ladder: one canonical, universally fetchable URL per image
 * is what an image sitemap is for. CSS backdrops are included because they are
 * real page images that a crawler cannot discover from the markup at all.
 */
function renderedImages(html: string): string[] {
  const found: string[] = [];

  for (const match of html.matchAll(/<img\b[^>]*?\ssrc=["']([^"']+)["']/gi)) {
    const url = cleanUrl(match[1]);
    if (url) found.push(url);
  }
  for (const match of html.matchAll(/background-image:\s*url\(([^)]+)\)/gi)) {
    const url = cleanUrl(match[1]);
    if (url) found.push(url);
  }

  return found;
}

/** Site-relative image paths become absolute; off-site images are not ours to advertise. */
function absoluteImage(origin: string, url: string): string | null {
  if (/^https?:\/\//i.test(url)) return url.startsWith(`${origin}/`) ? url : null;
  if (url.startsWith("//")) return null;
  return url.startsWith("/") ? `${origin}${url}` : null;
}

/**
 * The image list for one URL: what the page renders, plus anything the registry
 * declares that the markup could not express, deduplicated by image identity so
 * a declared entry never restates a rendered one at a different width.
 */
function imagesFor(route: RouteMeta, html: string, origin: string, imageUrlFor: (name: string) => string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | null) => {
    if (!url) return;
    const identity = imageIdentity(url);
    if (seen.has(identity)) return;
    seen.add(identity);
    urls.push(url);
  };

  // What the page renders wins: it is the URL a crawler will fetch.
  for (const src of renderedImages(html)) add(absoluteImage(origin, src));

  for (const name of route.images ?? []) {
    try {
      add(imageUrlFor(name));
    } catch {
      // A stale image reference should not break the sitemap.
    }
  }

  return urls.slice(0, MAX_IMAGES_PER_URL);
}

/* ------------------------------------------------------------------ *
 * XML
 * ------------------------------------------------------------------ */

function urlEntry(origin: string, entry: SitemapEntry): string {
  const { route, images } = entry;
  return [
    "  <url>",
    `    <loc>${xmlEscape(absolute(origin, route.path))}</loc>`,
    `    <lastmod>${route.lastmod}</lastmod>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority.toFixed(1)}</priority>`,
    ...images.map((image) => `    <image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>`),
    "  </url>",
  ].join("\n");
}

function sitemapDocument(origin: string, entries: SitemapEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map((entry) => urlEntry(origin, entry)),
    "</urlset>",
    "",
  ].join("\n");
}

function sitemapIndex(origin: string, files: WrittenSitemap[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...files.map((file) =>
      [
        "  <sitemap>",
        `    <loc>${xmlEscape(`${origin}/${file.name}`)}</loc>`,
        `    <lastmod>${file.lastmod}</lastmod>`,
        "  </sitemap>",
      ].join("\n"),
    ),
    "</sitemapindex>",
    "",
  ].join("\n");
}

function robots(origin: string): string {
  return [
    "# robots.txt for ALL Terrain Golf Carts",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    "# Query-string filter combinations duplicate the prerendered listing pages.",
    "# The prerendered URLs (/inventory/new/, /inventory/4x4/, ...) are the",
    "# canonical, crawlable form, so the parameterised variants are excluded.",
    "Disallow: /*?*condition=",
    "Disallow: /*?*color=",
    "Disallow: /*?*model=",
    "Disallow: /*?*seats=",
    "Disallow: /*?*drive=",
    "Disallow: /*?*feature=",
    "Disallow: /*?*minPrice=",
    "Disallow: /*?*maxPrice=",
    "Disallow: /*?*sort=",
    "Disallow: /*?*page=",
    "",
    "# AI crawlers are welcome: being cited inside an AI answer depends on them",
    "# being able to read the pages.",
    ...AI_CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
    "# A sitemap index. Every section sitemap is listed inside it, so this one",
    "# line is all a crawler (or Search Console) needs.",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ *
 * Load
 * ------------------------------------------------------------------ */

async function load(): Promise<{ data: Loaded; close: () => Promise<void> }> {
  let vite: ViteDevServer | undefined;
  vite = await createServer({
    root: path.join(ROOT, "client"),
    base: BASE_PATH,
    configFile: path.join(ROOT, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "warn",
  });

  const routesModule = (await vite.ssrLoadModule("/src/seo/routes.ts")) as { routes: RouteMeta[] };
  const siteModule = (await vite.ssrLoadModule("/src/config/site.ts")) as {
    SITE: { origin: string };
    absoluteUrl: (p: string) => string;
  };
  const imagesModule = (await vite.ssrLoadModule("/src/lib/images.ts")) as {
    imageUrl: (name: string, width?: number) => string;
  };

  const origin = siteModule.SITE.origin;
  return {
    data: {
      routes: routesModule.routes,
      origin,
      imageUrlFor: (name: string) => {
        const relative = imagesModule.imageUrl(name, 1200);
        return relative.startsWith("http") ? relative : siteModule.absoluteUrl(relative);
      },
    },
    close: async () => {
      await vite?.close();
    },
  };
}

/** Every prerendered URL must resolve to a file that actually exists. */
function assertRoutesExist(routes: RouteMeta[]) {
  const missing = routes.filter((route) => !existsSync(fileFor(route))).map((route) => route.path);
  if (missing.length) {
    fail(`these sitemap URLs have no prerendered file:\n  - ${missing.join("\n  - ")}`);
  }
}

/** A route filed under a section the index does not know would vanish silently. */
function assertSectionsKnown(routes: RouteMeta[]) {
  const unknown = [...new Set(routes.filter((route) => !SECTION_ORDER.includes(route.section)).map((r) => r.section))];
  if (unknown.length) {
    fail(`unknown sitemap section(s): ${unknown.join(", ")}. Add them to SECTION_ORDER.`);
  }
}

/** Sitemaps from an earlier build must not linger and be indexed as orphans. */
async function removeStaleSitemaps(keep: Set<string>) {
  for (const name of await readdir(DIST)) {
    if (/^sitemap.*\.xml$/i.test(name) && !keep.has(name)) {
      await rm(path.join(DIST, name));
      console.log(`[generate-seo] removed stale ${name}`);
    }
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function main() {
  if (!existsSync(DIST)) fail("no dist/ directory. Run `vite build` and `npm run prerender` first.");

  const { data, close } = await load();
  try {
    const indexable = data.routes.filter((route) => route.indexable);
    const excluded = data.routes.length - indexable.length;

    assertSectionsKnown(indexable);
    assertRoutesExist(indexable);

    const entries: SitemapEntry[] = [];
    for (const route of indexable) {
      const html = await readFile(fileFor(route), "utf-8");
      entries.push({ route, images: imagesFor(route, html, data.origin, data.imageUrlFor) });
    }

    const written: WrittenSitemap[] = [];
    for (const section of SECTION_ORDER) {
      const inSection = entries.filter((entry) => entry.route.section === section);
      if (inSection.length === 0) continue;

      const parts = chunk(inSection, MAX_URLS_PER_SITEMAP);
      for (const [index, part] of parts.entries()) {
        const name = parts.length === 1 ? `sitemap-${section}.xml` : `sitemap-${section}-${index + 1}.xml`;
        const xml = sitemapDocument(data.origin, part);
        const bytes = Buffer.byteLength(xml);
        if (bytes > MAX_SITEMAP_BYTES) fail(`${name} is ${(bytes / 1024 / 1024).toFixed(1)} MB, over the 50 MB limit`);

        await writeFile(path.join(DIST, name), xml, "utf-8");
        written.push({
          name,
          urls: part.length,
          images: part.reduce((total, entry) => total + entry.images.length, 0),
          lastmod: part.map((entry) => entry.route.lastmod).sort().reverse()[0],
          bytes,
        });
      }
    }

    if (written.length === 0) fail("no indexable routes; refusing to write an empty sitemap index");

    const index = sitemapIndex(data.origin, written);
    await writeFile(path.join(DIST, "sitemap.xml"), index, "utf-8");
    await removeStaleSitemaps(new Set(["sitemap.xml", ...written.map((file) => file.name)]));

    const totalUrls = written.reduce((total, file) => total + file.urls, 0);
    const totalImages = written.reduce((total, file) => total + file.images, 0);
    const urlsWithoutImage = entries.filter((entry) => entry.images.length === 0);

    console.log(`\n[generate-seo] sitemap.xml: index of ${written.length} sitemaps`);
    for (const file of written) {
      console.log(
        `[generate-seo]   ${file.name.padEnd(26)} ${String(file.urls).padStart(4)} URLs, ` +
          `${String(file.images).padStart(4)} images, ${(file.bytes / 1024).toFixed(1)} KB`,
      );
    }
    console.log(
      `[generate-seo] ${totalUrls} URLs, ${totalImages} images total ` +
        `(${excluded} noindex route${excluded === 1 ? "" : "s"} excluded)`,
    );
    if (urlsWithoutImage.length) {
      console.log(`[generate-seo] note: ${urlsWithoutImage.length} URL(s) render no image:`);
      for (const entry of urlsWithoutImage.slice(0, 10)) console.log(`[generate-seo]   ${entry.route.path}`);
    }

    await writeFile(path.join(DIST, "robots.txt"), robots(data.origin), "utf-8");
    console.log("[generate-seo] robots.txt written (AI crawlers allowed, sitemap index referenced)");
  } finally {
    await close();
  }
}

main().catch((error) => {
  fail((error as Error).stack ?? String(error));
});
