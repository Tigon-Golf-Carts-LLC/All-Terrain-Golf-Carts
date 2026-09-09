/**
 * Build verification.
 *
 * Runs against the finished `dist/` and fails the build on anything that would
 * break the deployed site. Every check reports what it actually found rather
 * than what it expected, so the output doubles as the build report.
 *
 * Checks, in order:
 *   1. Required files exist (index.html, 404.html, .nojekyll, CNAME, snapshot,
 *      sitemap.xml, robots.txt) and every route has a prerendered directory.
 *   2. No route ships as a blank shell.
 *   3. Images are served as WebP/AVIF with srcset, not as the originals.
 *   4. Size budgets, with the 20 largest files listed.
 *   5. No `localhost`, `/api/`, `replit` or secret name survives in the bundle.
 *   6. No broken internal link or image reference.
 *   7. The sitemap index lists every section sitemap, every sitemap URL and
 *      image resolves to a file, and no noindex page is listed.
 *   8. JSON-LD parses on one page of each type.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseHTML } from "linkedom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_PATH = process.env.BASE_PATH || "/";
const SITE_DOMAIN = process.env.SITE_DOMAIN ?? "allterraingolfcarts.com";

/** Hard fail past this; loud warning past WARN_FILE_BYTES. */
const FAIL_FILE_BYTES = 100 * 1024 * 1024;
const WARN_FILE_BYTES = 25 * 1024 * 1024;
const FAIL_TOTAL_BYTES = 500 * 1024 * 1024;
const LIST_FILE_BYTES = 1024 * 1024;

/** Strings that must not survive into the deployed output. */
const FORBIDDEN = ["localhost", "/api/", "replit", "REPL_ID", "DATABASE_URL", "SMTP_USER", "SMTP_PASS", "SMTP_HOST", "INVENTORY_FEED_TOKEN"];

const failures: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  failures.push(message);
}
function warn(message: string) {
  warnings.push(message);
}

function section(title: string) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface FileInfo {
  relative: string;
  absolute: string;
  size: number;
}

async function walk(dir: string, out: FileInfo[] = []): Promise<FileInfo[]> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute, out);
    else out.push({ relative: path.relative(DIST, absolute), absolute, size: (await stat(absolute)).size });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 1. Required files and route coverage
 * ------------------------------------------------------------------ */

async function checkRequiredFiles(routes: { path: string; indexable: boolean }[]) {
  section("1. Required files");

  const required = ["index.html", "404.html", ".nojekyll", "sitemap.xml", "robots.txt", "data/inventory.json"];
  if (SITE_DOMAIN) required.push("CNAME");

  for (const name of required) {
    const present = existsSync(path.join(DIST, name));
    console.log(`  ${present ? "PASS" : "FAIL"}  ${name}`);
    if (!present) fail(`missing required file: dist/${name}`);
  }

  if (SITE_DOMAIN && existsSync(path.join(DIST, "CNAME"))) {
    const contents = (await readFile(path.join(DIST, "CNAME"), "utf-8")).trim();
    const ok = contents === SITE_DOMAIN;
    console.log(`  ${ok ? "PASS" : "FAIL"}  CNAME contains the bare domain (${contents})`);
    if (!ok) fail(`CNAME contains "${contents}", expected "${SITE_DOMAIN}"`);
  }

  const missing = routes.filter((route) => {
    const file = route.path === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.path.slice(1), "index.html");
    return !existsSync(file);
  });
  console.log(`  ${missing.length === 0 ? "PASS" : "FAIL"}  ${routes.length} routes prerendered`);
  if (missing.length) fail(`routes with no prerendered file: ${missing.map((r) => r.path).join(", ")}`);
}

/* ------------------------------------------------------------------ *
 * 2 + 3. Rendered content and image formats
 * ------------------------------------------------------------------ */

async function checkRenderedPages(files: FileInfo[]) {
  section("2. Rendered content (no blank shells)");

  const pages = files.filter((file) => file.relative.endsWith("index.html"));
  let thin = 0;
  let minText = Number.POSITIVE_INFINITY;
  let minPage = "";

  for (const page of pages) {
    const html = await readFile(page.absolute, "utf-8");
    const body = html.slice(html.indexOf("<body"));
    const text = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < minText) {
      minText = text.length;
      minPage = page.relative;
    }
    if (text.length < 500) {
      thin += 1;
      fail(`${page.relative} renders only ${text.length} characters of text`);
    }
    if (!html.includes("<h1")) fail(`${page.relative} has no <h1>`);
    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Count > 1) fail(`${page.relative} has ${h1Count} <h1> elements`);
  }

  console.log(`  ${thin === 0 ? "PASS" : "FAIL"}  ${pages.length} pages carry rendered content`);
  console.log(`        thinnest page: ${minPage} (${minText} chars of text)`);

  section("3. Image delivery");

  const home = await readFile(path.join(DIST, "index.html"), "utf-8");
  const { document } = parseHTML(home);
  const imgs = Array.from(document.querySelectorAll("img"));
  const withSrcset = Array.from(document.querySelectorAll("source[srcset]"));
  const avif = withSrcset.filter((el) => (el.getAttribute("type") ?? "").includes("avif"));
  const webp = withSrcset.filter((el) => (el.getAttribute("type") ?? "").includes("webp"));

  console.log(`  ${imgs.length > 0 ? "PASS" : "FAIL"}  ${imgs.length} <img> on the home page`);
  console.log(`  ${avif.length > 0 ? "PASS" : "FAIL"}  ${avif.length} AVIF <source srcset>`);
  console.log(`  ${webp.length > 0 ? "PASS" : "FAIL"}  ${webp.length} WebP <source srcset>`);
  if (avif.length === 0 || webp.length === 0) fail("home page does not serve AVIF/WebP via <source srcset>");

  const originalFormats = imgs.filter((img) => /\.(jpe?g)$/i.test(img.getAttribute("src") ?? ""));
  console.log(`  ${originalFormats.length === 0 ? "PASS" : "FAIL"}  no original JPEG served as an <img> src`);
  if (originalFormats.length) fail(`${originalFormats.length} <img> still point at a source JPEG`);

  const missingDims = imgs.filter((img) => !img.getAttribute("width") || !img.getAttribute("height"));
  console.log(`  ${missingDims.length === 0 ? "PASS" : "FAIL"}  every <img> declares width and height`);
  if (missingDims.length) fail(`${missingDims.length} <img> lack intrinsic dimensions (layout shift)`);

  const missingAlt = imgs.filter((img) => img.getAttribute("alt") === null);
  console.log(`  ${missingAlt.length === 0 ? "PASS" : "FAIL"}  every <img> has alt text`);
  if (missingAlt.length) fail(`${missingAlt.length} <img> have no alt attribute`);

  // No source images should have been copied into the deployed output.
  const shippedOriginals = (await walk(DIST)).filter((file) =>
    /^(?!img\/).*\.(jpe?g)$/i.test(file.relative),
  );
  console.log(`  ${shippedOriginals.length === 0 ? "PASS" : "WARN"}  no unoptimized JPEG in dist/`);
  if (shippedOriginals.length) warn(`unoptimized images in dist/: ${shippedOriginals.map((f) => f.relative).join(", ")}`);
}

/* ------------------------------------------------------------------ *
 * 4. Size budgets
 * ------------------------------------------------------------------ */

function checkBudgets(files: FileInfo[]) {
  section("4. Size budgets");

  const total = files.reduce((sum, file) => sum + file.size, 0);
  console.log(`  total dist/: ${mb(total)} across ${files.length} files`);

  const overFail = files.filter((file) => file.size > FAIL_FILE_BYTES);
  const overWarn = files.filter((file) => file.size > WARN_FILE_BYTES && file.size <= FAIL_FILE_BYTES);

  console.log(`  ${overFail.length === 0 ? "PASS" : "FAIL"}  no single file over 100 MB`);
  for (const file of overFail) fail(`${file.relative} is ${mb(file.size)}, over the 100 MB Pages hard limit`);

  console.log(`  ${overWarn.length === 0 ? "PASS" : "WARN"}  no single file over 25 MB`);
  for (const file of overWarn) warn(`${file.relative} is ${mb(file.size)}, over the 25 MB warning threshold`);

  console.log(`  ${total <= FAIL_TOTAL_BYTES ? "PASS" : "FAIL"}  total under 500 MB`);
  if (total > FAIL_TOTAL_BYTES) fail(`dist/ is ${mb(total)}, over the 500 MB budget`);

  const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 20);
  console.log("\n  20 largest files:");
  for (const file of largest) {
    console.log(`    ${mb(file.size).padStart(9)}  ${file.relative}`);
  }

  const overMb = files.filter((file) => file.size > LIST_FILE_BYTES);
  if (overMb.length) {
    console.log("\n  Files over 1 MB:");
    for (const file of overMb) console.log(`    ${mb(file.size).padStart(9)}  ${file.relative}`);
  } else {
    console.log("\n  No file over 1 MB.");
  }

  const js = files.filter((file) => file.relative.endsWith(".js"));
  const jsTotal = js.reduce((sum, file) => sum + file.size, 0);
  console.log(`\n  JavaScript: ${js.length} files, ${kb(jsTotal)} uncompressed`);
}

/* ------------------------------------------------------------------ *
 * 5. Forbidden strings
 * ------------------------------------------------------------------ */

async function checkForbiddenStrings(files: FileInfo[]) {
  section("5. Forbidden strings in the shipped bundle");

  const scannable = files.filter((file) => /\.(js|css|html|json|txt|xml)$/.test(file.relative));
  const hits = new Map<string, string[]>();

  for (const file of scannable) {
    const contents = await readFile(file.absolute, "utf-8");
    for (const needle of FORBIDDEN) {
      if (contents.includes(needle)) {
        if (!hits.has(needle)) hits.set(needle, []);
        hits.get(needle)!.push(file.relative);
      }
    }
  }

  for (const needle of FORBIDDEN) {
    const found = hits.get(needle);
    if (!found) {
      console.log(`  PASS  "${needle}" absent`);
      continue;
    }
    console.log(`  FAIL  "${needle}" found in ${found.length} file(s): ${found.slice(0, 5).join(", ")}`);
    fail(`"${needle}" appears in the shipped output: ${found.join(", ")}`);
  }
}

/* ------------------------------------------------------------------ *
 * 6. Internal links and image references
 * ------------------------------------------------------------------ */

async function checkLinks(files: FileInfo[]) {
  section("6. Internal links and image references");

  const { resolveFile } = await import("./serve.ts");
  const pages = files.filter((file) => file.relative.endsWith(".html"));
  const brokenLinks = new Set<string>();
  const brokenImages = new Set<string>();
  const base = BASE_PATH.replace(/\/$/, "");

  let linkCount = 0;
  let imageCount = 0;

  for (const page of pages) {
    const { document } = parseHTML(await readFile(page.absolute, "utf-8"));

    for (const anchor of Array.from(document.querySelectorAll("a[href]"))) {
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href.startsWith("//")) continue; // external, tel:, mailto:, #
      linkCount += 1;
      const target = href.split("#")[0].split("?")[0];
      if (!target || target === "/") continue;
      if (!resolveFile(target)) brokenLinks.add(`${href}  (from ${page.relative})`);
    }

    const sources = [
      ...Array.from(document.querySelectorAll("img[src]")).map((el) => el.getAttribute("src") ?? ""),
      ...Array.from(document.querySelectorAll("link[rel=icon], link[rel=manifest], link[rel=apple-touch-icon]")).map(
        (el) => el.getAttribute("href") ?? "",
      ),
    ];
    for (const src of sources) {
      if (!src.startsWith("/") || src.startsWith("//")) continue;
      imageCount += 1;
      if (!resolveFile(src)) brokenImages.add(`${src}  (from ${page.relative})`);
    }

    // srcset entries, which the browser fetches just as eagerly.
    for (const el of Array.from(document.querySelectorAll("source[srcset]"))) {
      for (const entry of (el.getAttribute("srcset") ?? "").split(",")) {
        const url = entry.trim().split(/\s+/)[0];
        if (!url || !url.startsWith("/") || url.startsWith("//")) continue;
        imageCount += 1;
        if (!resolveFile(url)) brokenImages.add(`${url}  (from ${page.relative})`);
      }
    }
  }

  console.log(`  checked ${linkCount} internal links and ${imageCount} asset references across ${pages.length} pages`);
  console.log(`  ${brokenLinks.size === 0 ? "PASS" : "FAIL"}  no broken internal link`);
  for (const broken of Array.from(brokenLinks).slice(0, 15)) {
    console.log(`        ${broken}`);
    fail(`broken internal link: ${broken}`);
  }
  console.log(`  ${brokenImages.size === 0 ? "PASS" : "FAIL"}  no broken image or asset reference`);
  for (const broken of Array.from(brokenImages).slice(0, 15)) {
    console.log(`        ${broken}`);
    fail(`broken asset reference: ${broken}`);
  }

  // Every root-absolute href/src must carry the base path.
  if (base) {
    let unbased = 0;
    for (const page of pages) {
      const html = await readFile(page.absolute, "utf-8");
      for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
        if (!match[1].startsWith(`${base}/`)) unbased += 1;
      }
    }
    console.log(`  ${unbased === 0 ? "PASS" : "FAIL"}  every root-absolute URL carries BASE_PATH "${base}/"`);
    if (unbased) fail(`${unbased} root-absolute URLs do not start with the base path`);
  } else {
    console.log(`  SKIP  BASE_PATH is "/", so root-absolute URLs need no prefix`);
  }
}

/* ------------------------------------------------------------------ *
 * 7. Sitemap
 * ------------------------------------------------------------------ */

async function checkSitemap(routes: { path: string; indexable: boolean }[]) {
  section("7. Sitemap");

  const { resolveFile } = await import("./serve.ts");

  const locsIn = (xml: string, tag: "loc" | "image:loc"): string[] => {
    // <loc> must not also match <image:loc>, which is a different element.
    const pattern = tag === "loc" ? /(?<!image:)<loc>([^<]+)<\/loc>/g : /<image:loc>([^<]+)<\/image:loc>/g;
    return Array.from(xml.matchAll(pattern)).map((match) => match[1]);
  };

  const indexXml = await readFile(path.join(DIST, "sitemap.xml"), "utf-8");

  const isIndex = /<sitemapindex[\s>]/.test(indexXml);
  console.log(`  ${isIndex ? "PASS" : "FAIL"}  sitemap.xml is a sitemap index`);
  if (!isIndex) {
    fail("sitemap.xml is not a sitemap index");
    return;
  }

  // Each child the index advertises must exist as a file in dist/.
  const children = locsIn(indexXml, "loc").map((loc) => new URL(loc).pathname.replace(/^\//, ""));
  const missingChildren = children.filter((name) => !existsSync(path.join(DIST, name)));
  console.log(`  ${missingChildren.length === 0 ? "PASS" : "FAIL"}  all ${children.length} section sitemaps exist`);
  for (const name of missingChildren) fail(`sitemap index lists a missing file: ${name}`);

  // ...and no sitemap file may sit in dist/ unlisted, where nothing would crawl it.
  const onDisk = (await readdir(DIST)).filter((name) => /^sitemap.*\.xml$/i.test(name) && name !== "sitemap.xml");
  const orphans = onDisk.filter((name) => !children.includes(name));
  console.log(`  ${orphans.length === 0 ? "PASS" : "FAIL"}  no sitemap file is missing from the index`);
  for (const name of orphans) fail(`sitemap file not listed in the index: ${name}`);

  const locs: string[] = [];
  const images: string[] = [];
  for (const name of children) {
    const file = path.join(DIST, name);
    if (!existsSync(file)) continue;
    const xml = await readFile(file, "utf-8");
    const childLocs = locsIn(xml, "loc");
    const childImages = locsIn(xml, "image:loc");
    console.log(`    ${name}: ${childLocs.length} URLs, ${childImages.length} images`);
    locs.push(...childLocs);
    images.push(...childImages);
  }

  console.log(`  ${locs.length} URLs and ${images.length} image references listed in total`);

  const unresolved = locs.filter((loc) => !resolveFile(new URL(loc).pathname));
  console.log(`  ${unresolved.length === 0 ? "PASS" : "FAIL"}  every sitemap URL resolves to a file in dist/`);
  for (const loc of unresolved) fail(`sitemap URL does not resolve: ${loc}`);

  // A URL listed under two sections would be submitted twice.
  const duplicates = locs.filter((loc, i) => locs.indexOf(loc) !== i);
  console.log(`  ${duplicates.length === 0 ? "PASS" : "FAIL"}  no URL is listed in more than one sitemap`);
  for (const loc of new Set(duplicates)) fail(`URL listed in more than one sitemap: ${loc}`);

  // An advertised image that 404s is a crawl error Google reports back.
  const brokenImages = [...new Set(images)].filter((loc) => !resolveFile(new URL(loc).pathname));
  console.log(
    `  ${brokenImages.length === 0 ? "PASS" : "FAIL"}  every image URL resolves to a file in dist/ ` +
      `(${new Set(images).size} unique)`,
  );
  for (const loc of brokenImages) fail(`sitemap image does not resolve: ${loc}`);

  const noindexPaths = routes.filter((route) => !route.indexable).map((route) => route.path);
  const leaked = locs.filter((loc) => {
    const pathname = new URL(loc).pathname.replace(/\/$/, "") || "/";
    return noindexPaths.includes(pathname);
  });
  console.log(`  ${leaked.length === 0 ? "PASS" : "FAIL"}  no noindex page listed (${noindexPaths.length} excluded)`);
  for (const loc of leaked) fail(`noindex page listed in sitemap: ${loc}`);

  // Cross-check: every indexable route should be listed.
  const listed = new Set(locs.map((loc) => new URL(loc).pathname.replace(/\/$/, "") || "/"));
  const unlisted = routes.filter((route) => route.indexable && !listed.has(route.path));
  console.log(`  ${unlisted.length === 0 ? "PASS" : "FAIL"}  every indexable route is listed`);
  for (const route of unlisted) fail(`indexable route missing from sitemap: ${route.path}`);

  const robots = await readFile(path.join(DIST, "robots.txt"), "utf-8");
  const hasAbsoluteSitemap = /^Sitemap: https?:\/\//m.test(robots);
  console.log(`  ${hasAbsoluteSitemap ? "PASS" : "FAIL"}  robots.txt references an absolute sitemap URL`);
  if (!hasAbsoluteSitemap) fail("robots.txt does not reference an absolute sitemap URL");
}

/* ------------------------------------------------------------------ *
 * 8. JSON-LD
 * ------------------------------------------------------------------ */

async function checkJsonLd() {
  section("8. JSON-LD validation");

  const samples: [string, string][] = [
    ["home (WebPage + ItemList + FAQPage)", "index.html"],
    ["listing (CollectionPage + ItemList)", "inventory/index.html"],
    ["filter preset (CollectionPage)", "inventory/new/index.html"],
    ["inventory detail (Product + Vehicle)", "inventory/2026-evolution-d-max-xt4-red/index.html"],
    ["model (Product)", "evolution-d-max-xt4/index.html"],
    ["guide (Article + FAQPage)", "guides/what-is-an-all-terrain-golf-cart/index.html"],
    ["blog post (Article)", "blog/all-terrain-golf-carts-ultimate-guide-4wd-electric-vehicles/index.html"],
    ["service area (WebPage + FAQPage)", "florida/index.html"],
    ["contact (ContactPage + FAQPage)", "contact/index.html"],
  ];

  for (const [label, relative] of samples) {
    const file = path.join(DIST, relative);
    if (!existsSync(file)) {
      console.log(`  FAIL  ${label}: ${relative} does not exist`);
      fail(`JSON-LD sample page missing: ${relative}`);
      continue;
    }

    const { document } = parseHTML(await readFile(file, "utf-8"));
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    if (scripts.length === 0) {
      console.log(`  FAIL  ${label}: no JSON-LD`);
      fail(`${relative} has no JSON-LD`);
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(scripts[0].textContent ?? "");
    } catch (error) {
      console.log(`  FAIL  ${label}: JSON-LD does not parse (${(error as Error).message})`);
      fail(`${relative} JSON-LD is not valid JSON`);
      continue;
    }

    const graph = (parsed as { "@graph"?: { "@type"?: string | string[] }[] })["@graph"] ?? [];
    const types = graph.flatMap((node) => (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]));
    const missingContext = !(parsed as Record<string, unknown>)["@context"];
    if (missingContext) fail(`${relative} JSON-LD has no @context`);

    console.log(`  ${missingContext ? "FAIL" : "PASS"}  ${label}`);
    console.log(`        types: ${Array.from(new Set(types)).join(", ")}`);
  }
}

/* ------------------------------------------------------------------ *
 * Head-tag sanity across every page
 * ------------------------------------------------------------------ */

async function checkHeadTags(files: FileInfo[]) {
  section("9. Head tags");

  const pages = files.filter((file) => file.relative.endsWith("index.html"));
  let longTitles = 0;
  let longDescriptions = 0;
  let missing = 0;
  const seenTitles = new Map<string, string[]>();
  const seenCanonicals = new Set<string>();
  let duplicateCanonicals = 0;

  for (const page of pages) {
    const { document } = parseHTML(await readFile(page.absolute, "utf-8"));
    const title = document.querySelector("title")?.textContent ?? "";
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
    const og = document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";

    if (!title || !description || !canonical || !og) {
      missing += 1;
      fail(`${page.relative} is missing a title, description, canonical or og:image`);
    }
    if (title.length > 60) longTitles += 1;
    if (description.length > 155) longDescriptions += 1;

    if (!seenTitles.has(title)) seenTitles.set(title, []);
    seenTitles.get(title)!.push(page.relative);

    if (seenCanonicals.has(canonical)) duplicateCanonicals += 1;
    else seenCanonicals.add(canonical);
  }

  console.log(`  ${missing === 0 ? "PASS" : "FAIL"}  all ${pages.length} pages have title, description, canonical, og:image`);
  console.log(`  ${longTitles === 0 ? "PASS" : "WARN"}  titles within 60 chars (${longTitles} over)`);
  if (longTitles) warn(`${longTitles} page titles exceed 60 characters`);
  console.log(`  ${longDescriptions === 0 ? "PASS" : "WARN"}  descriptions within 155 chars (${longDescriptions} over)`);
  if (longDescriptions) warn(`${longDescriptions} meta descriptions exceed 155 characters`);

  const duplicateTitles = Array.from(seenTitles.entries()).filter(([, pagesWith]) => pagesWith.length > 1);
  console.log(`  ${duplicateTitles.length === 0 ? "PASS" : "WARN"}  every title is unique (${duplicateTitles.length} duplicated)`);
  for (const [title, pagesWith] of duplicateTitles.slice(0, 5)) {
    console.log(`        "${title}" on ${pagesWith.length} pages`);
    warn(`duplicate title "${title}" on ${pagesWith.join(", ")}`);
  }

  // A preset that canonicalizes to its parent is intentional, so this is a note.
  console.log(`  NOTE  ${duplicateCanonicals} page(s) canonicalize to another URL (intentional for thin filter combos)`);
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

async function loadRoutes(): Promise<{ path: string; indexable: boolean }[]> {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: path.join(ROOT, "client"),
    base: BASE_PATH,
    configFile: path.join(ROOT, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = (await vite.ssrLoadModule("/src/seo/routes.ts")) as {
      routes: { path: string; indexable: boolean }[];
    };
    return module.routes.map((route) => ({ path: route.path, indexable: route.indexable }));
  } finally {
    await vite.close();
  }
}

async function main() {
  if (!existsSync(DIST)) {
    console.error("[verify] no dist/ directory. Run `npm run build` first.");
    process.exit(1);
  }

  console.log("=".repeat(64));
  console.log("BUILD VERIFICATION");
  console.log(`dist:      ${path.relative(ROOT, DIST)}`);
  console.log(`BASE_PATH: ${BASE_PATH}`);
  console.log(`domain:    ${SITE_DOMAIN || "(none)"}`);
  console.log("=".repeat(64));

  const files = await walk(DIST);
  const routes = await loadRoutes();

  await checkRequiredFiles(routes);
  await checkRenderedPages(files);
  checkBudgets(files);
  await checkForbiddenStrings(files);
  await checkLinks(files);
  await checkSitemap(routes);
  await checkJsonLd();
  await checkHeadTags(files);

  section("Summary");
  console.log(`  ${failures.length} failure(s), ${warnings.length} warning(s)`);
  for (const warning of warnings) console.log(`  WARN  ${warning}`);
  for (const failure of failures) console.log(`  FAIL  ${failure}`);

  if (failures.length > 0) {
    console.error(`\n[verify] FAILED with ${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log("\n[verify] all checks passed");
}

main().catch((error) => {
  console.error(`[verify] FAILED: ${(error as Error).stack ?? error}`);
  process.exit(1);
});
