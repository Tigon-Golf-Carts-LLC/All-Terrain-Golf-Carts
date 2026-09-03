/**
 * Sitemap and robots.txt.
 *
 * Both are generated from the same route registry the prerenderer walks, so the
 * sitemap can only ever list URLs that exist as files, and a `noindex` page can
 * never leak into it.
 *
 * Splits into a sitemap index if the URL count or file size gets near the
 * 50,000-URL / 50 MB limits.
 */

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer, type ViteDevServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_PATH = process.env.BASE_PATH || "/";

const MAX_URLS_PER_SITEMAP = 45_000;

/** AI crawlers are allowed on purpose: being cited in a zero-click answer depends on it. */
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "cohere-ai", "Meta-ExternalAgent"];

interface RouteMeta {
  path: string;
  indexable: boolean;
  lastmod: string;
  changefreq: string;
  priority: number;
  images?: string[];
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

function urlEntry(origin: string, route: RouteMeta, imageUrlFor: (name: string) => string): string {
  const images = (route.images ?? [])
    .map((name) => {
      try {
        return `      <image:image><image:loc>${xmlEscape(imageUrlFor(name))}</image:loc></image:image>`;
      } catch {
        // A stale image reference should not break the sitemap.
        return null;
      }
    })
    .filter((line): line is string => line !== null);

  return [
    "    <url>",
    `      <loc>${xmlEscape(absolute(origin, route.path))}</loc>`,
    `      <lastmod>${route.lastmod}</lastmod>`,
    `      <changefreq>${route.changefreq}</changefreq>`,
    `      <priority>${route.priority.toFixed(1)}</priority>`,
    ...images,
    "    </url>",
  ].join("\n");
}

function sitemapDocument(origin: string, routes: RouteMeta[], imageUrlFor: (name: string) => string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...routes.map((route) => urlEntry(origin, route, imageUrlFor)),
    "</urlset>",
    "",
  ].join("\n");
}

function sitemapIndex(origin: string, files: string[], lastmod: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...files.map((file) =>
      ["  <sitemap>", `    <loc>${origin}/${file}</loc>`, `    <lastmod>${lastmod}</lastmod>`, "  </sitemap>"].join("\n"),
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
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

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
async function assertRoutesExist(routes: RouteMeta[]) {
  const missing: string[] = [];
  for (const route of routes) {
    const file = route.path === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.path.slice(1), "index.html");
    if (!existsSync(file)) missing.push(route.path);
  }
  if (missing.length) {
    fail(`these sitemap URLs have no prerendered file:\n  - ${missing.join("\n  - ")}`);
  }
}

async function main() {
  if (!existsSync(DIST)) fail("no dist/ directory. Run `vite build` and `npm run prerender` first.");

  const { data, close } = await load();
  try {
    const indexable = data.routes.filter((route) => route.indexable);
    const excluded = data.routes.length - indexable.length;

    await assertRoutesExist(indexable);

    const lastmod = indexable.map((route) => route.lastmod).sort().reverse()[0];

    if (indexable.length <= MAX_URLS_PER_SITEMAP) {
      const xml = sitemapDocument(data.origin, indexable, data.imageUrlFor);
      await writeFile(path.join(DIST, "sitemap.xml"), xml, "utf-8");
      const bytes = Buffer.byteLength(xml);
      console.log(
        `[generate-seo] sitemap.xml: ${indexable.length} URLs, ${(bytes / 1024).toFixed(1)} KB ` +
          `(${excluded} noindex route${excluded === 1 ? "" : "s"} excluded)`,
      );
      if (bytes > 50 * 1024 * 1024) fail("sitemap.xml exceeds the 50 MB limit; raise MAX_URLS_PER_SITEMAP splitting");
    } else {
      const files: string[] = [];
      for (let i = 0; i < indexable.length; i += MAX_URLS_PER_SITEMAP) {
        const chunk = indexable.slice(i, i + MAX_URLS_PER_SITEMAP);
        const name = `sitemap-${files.length + 1}.xml`;
        await writeFile(path.join(DIST, name), sitemapDocument(data.origin, chunk, data.imageUrlFor), "utf-8");
        files.push(name);
      }
      await writeFile(path.join(DIST, "sitemap.xml"), sitemapIndex(data.origin, files, lastmod), "utf-8");
      console.log(`[generate-seo] sitemap index with ${files.length} sitemaps, ${indexable.length} URLs total`);
    }

    await writeFile(path.join(DIST, "robots.txt"), robots(data.origin), "utf-8");
    console.log("[generate-seo] robots.txt written (AI crawlers allowed)");
  } finally {
    await close();
  }
}

main().catch((error) => {
  fail((error as Error).stack ?? String(error));
});
