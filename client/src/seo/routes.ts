/**
 * The route registry.
 *
 * Every URL the site serves is declared here once, with its title, meta
 * description, canonical, schema type and indexability. `script/prerender.ts`
 * walks this list to emit one real `index.html` per route,
 * `script/generate-seo.ts` walks it to emit `sitemap.xml`, and the running app
 * reads it to update the document head on client-side navigation.
 *
 * One list means the sitemap can never disagree with what was prerendered, and a
 * `noindex` page can never leak into the sitemap.
 */

import snapshot from "@/data/inventory.json";
import { blogPosts } from "@/data/blogPosts";
import { locations } from "@/data/locations";
import { models } from "@/data/models";
import { SITE, absoluteUrl } from "@/config/site";
import type { InventorySnapshot } from "@/lib/inventory";
import { FILTER_PRESETS } from "@/data/filterPresets";
import { GUIDES } from "@/data/guides";

const inventory = snapshot as unknown as InventorySnapshot;

export type SchemaType =
  | "WebPage"
  | "AboutPage"
  | "ContactPage"
  | "CollectionPage"
  | "ItemList"
  | "Product"
  | "Article"
  | "FAQPage"
  | "Blog";

export interface RouteMeta {
  /** Root-relative path with a leading slash and no trailing slash (except "/"). */
  path: string;
  /** <= 60 characters. */
  title: string;
  /** <= 155 characters. */
  description: string;
  /** Self-referencing unless this page canonicalizes to a parent. */
  canonical: string;
  /** Schema types present on the page, beyond the site-wide Organization/WebSite. */
  schemaTypes: SchemaType[];
  /** Excluded from the sitemap and marked `noindex` when false. */
  indexable: boolean;
  /** ISO date for `lastmod` and `dateModified`. */
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  /** Breadcrumb trail, root first. The last entry is the current page. */
  breadcrumbs: { name: string; path: string }[];
  /** Images to advertise in the sitemap for this URL. */
  images?: string[];
  /**
   * The image that is this page's Largest Contentful Paint, as a manifest key.
   * Preloaded from the head so the browser starts fetching it during HTML parse
   * rather than after the layout that references it.
   */
  lcpImage?: string;
  /** `sizes` for the preload, which must match the `<img sizes>` exactly. */
  lcpSizes?: string;
  /**
   * Additional images to preload at a fixed width. Used for CSS
   * `background-image` backdrops, which the browser cannot discover until the
   * stylesheet has parsed and layout has run.
   */
  preloadBackdrop?: { name: string; width: number };
  ogType?: "website" | "article" | "product";
}

const SNAPSHOT_DATE = inventory.updatedAt.slice(0, 10);
/** Decorative hero backdrop shared by the home page and every service-area page. */
const HERO_BACKDROP = "mountain_landscape_s_e3842dcf.jpg";
const HOME: { name: string; path: string } = { name: "Home", path: "/" };

/**
 * Guarantees a title fits the ~60-character SERP budget.
 *
 * Trailing `| qualifier` segments are dropped first, because the distinctive
 * part of a title is at the front; only if that is not enough does it truncate
 * on a word boundary. Applied to every route so imported content (the blog
 * posts, whose titles were written without a length budget) cannot regress it.
 */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

function clampTitle(title: string): string {
  if (title.length <= TITLE_LIMIT) return title;

  const segments = title.split("|").map((part) => part.trim());
  while (segments.length > 1 && segments.join(" | ").length > TITLE_LIMIT) {
    segments.pop();
  }
  let clamped = segments.join(" | ");
  if (clamped.length <= TITLE_LIMIT) return clamped;

  clamped = clamped.slice(0, TITLE_LIMIT);
  const lastSpace = clamped.lastIndexOf(" ");
  return (lastSpace > 30 ? clamped.slice(0, lastSpace) : clamped).replace(/[\s:|,-]+$/, "");
}

/**
 * Guarantees a meta description fits the ~155-character budget, cutting at a
 * sentence boundary where possible so the snippet still reads as a whole thought.
 */
function clampDescription(description: string): string {
  if (description.length <= DESCRIPTION_LIMIT) return description;

  const window = description.slice(0, DESCRIPTION_LIMIT);
  const lastStop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (lastStop > 80) return window.slice(0, lastStop + 1);

  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > 80 ? window.slice(0, lastSpace) : window).replace(/[\s,;:-]+$/, "")}.`;
}

/* ------------------------------------------------------------------ *
 * Static pages
 * ------------------------------------------------------------------ */

const staticRoutes: RouteMeta[] = [
  {
    path: "/",
    title: "All Terrain Golf Carts | 4X4 Electric Carts",
    description:
      "All terrain golf carts with true 4X4 dual-motor drive. Shop the EVolution D-MAX XT4 and XT6, street-legal and LSV ready. Call (844) 884-6744.",
    canonical: absoluteUrl("/"),
    schemaTypes: ["WebPage", "ItemList", "FAQPage"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "weekly",
    priority: 1.0,
    breadcrumbs: [HOME],
    images: models.map((model) => model.colors[0].image),
    lcpImage: models[1].colors[0].image,
    lcpSizes: "(min-width: 1024px) 45vw, 90vw",
    preloadBackdrop: { name: HERO_BACKDROP, width: 800 },
    ogType: "website",
  },
  {
    path: "/inventory",
    title: "All Terrain Golf Cart Inventory | In Stock",
    description:
      "Browse every all terrain golf cart in stock. Filter by model, seats, color and price. New 4X4 EVolution D-MAX carts, delivered nationwide.",
    canonical: absoluteUrl("/inventory/"),
    schemaTypes: ["CollectionPage", "ItemList"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "daily",
    priority: 0.9,
    breadcrumbs: [HOME, { name: "Inventory", path: "/inventory" }],
    ogType: "website",
  },
  {
    path: "/financing",
    title: "Golf Cart Financing | Monthly Payment Options",
    description:
      "Finance an all terrain golf cart with flexible monthly terms. Six lenders, from no-credit-impact prequalification to rent-to-own. Call (844) 884-6744.",
    canonical: absoluteUrl("/financing/"),
    schemaTypes: ["WebPage", "FAQPage"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "monthly",
    priority: 0.7,
    breadcrumbs: [HOME, { name: "Financing", path: "/financing" }],
    ogType: "website",
  },
  {
    path: "/contact",
    title: "Contact ALL Terrain Golf Carts | (844) 884-6744",
    description:
      "Talk to a real person about an all terrain golf cart. Call (844) 884-6744 for pricing, availability and nationwide delivery, Monday to Saturday.",
    canonical: absoluteUrl("/contact/"),
    schemaTypes: ["ContactPage", "FAQPage"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "monthly",
    priority: 0.8,
    breadcrumbs: [HOME, { name: "Contact", path: "/contact" }],
    ogType: "website",
  },
  {
    path: "/blog",
    title: "All Terrain Golf Cart Guides & Articles",
    description:
      "Guides on all terrain golf carts: 4WD performance, snow and sand handling, resort and campground use, and street-legal rules for LSV registration.",
    canonical: absoluteUrl("/blog/"),
    schemaTypes: ["Blog", "ItemList"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "weekly",
    priority: 0.7,
    breadcrumbs: [HOME, { name: "Blog", path: "/blog" }],
    ogType: "website",
  },
  {
    path: "/service-areas",
    title: "Golf Cart Delivery by State | 50 States",
    description:
      "All terrain golf cart delivery to all 50 states and U.S. territories. Street-legal rules, local uses and delivery details for your state.",
    canonical: absoluteUrl("/service-areas/"),
    schemaTypes: ["CollectionPage", "ItemList"],
    indexable: true,
    lastmod: SNAPSHOT_DATE,
    changefreq: "monthly",
    priority: 0.6,
    breadcrumbs: [HOME, { name: "Service Areas", path: "/service-areas" }],
    ogType: "website",
  },
];

/* ------------------------------------------------------------------ *
 * Model pages
 * ------------------------------------------------------------------ */

const modelRoutes: RouteMeta[] = models.map((model) => ({
  path: model.path,
  title: `${model.name} | ${model.seats}-Seat 4X4 Cart`,
  description: `${model.name}: ${model.seats}-passenger 4X4 all terrain golf cart with dual ${model.motorKw}kW motors, ${model.rangeMilesMin}-${model.rangeMilesMax} mile range and LSV street-legal package. From $${model.price.toLocaleString("en-US")}.`,
  canonical: absoluteUrl(`${model.path}/`),
  schemaTypes: ["Product", "FAQPage"],
  indexable: true,
  lastmod: SNAPSHOT_DATE,
  changefreq: "weekly",
  priority: 0.9,
  breadcrumbs: [HOME, { name: "Models", path: "/inventory" }, { name: model.shortName, path: model.path }],
  images: model.colors.map((color) => color.image),
  lcpImage: model.colors[0].image,
  lcpSizes: "(min-width: 1024px) 50vw, 100vw",
  ogType: "product",
}));

/* ------------------------------------------------------------------ *
 * Prerendered filter pages
 * ------------------------------------------------------------------ */

const presetRoutes: RouteMeta[] = FILTER_PRESETS.map((preset) => ({
  path: `/inventory/${preset.slug}`,
  title: preset.title,
  description: preset.description,
  // Thin or near-duplicate combinations point back at the parent listing.
  canonical: preset.indexable ? absoluteUrl(`/inventory/${preset.slug}/`) : absoluteUrl("/inventory/"),
  schemaTypes: ["CollectionPage", "ItemList"],
  indexable: preset.indexable,
  lastmod: SNAPSHOT_DATE,
  changefreq: "daily",
  priority: preset.indexable ? 0.8 : 0.3,
  breadcrumbs: [
    HOME,
    { name: "Inventory", path: "/inventory" },
    { name: preset.heading, path: `/inventory/${preset.slug}` },
  ],
  ogType: "website",
}));

/* ------------------------------------------------------------------ *
 * Inventory detail pages
 * ------------------------------------------------------------------ */

const inventoryRoutes: RouteMeta[] = inventory.items.map((item) => ({
  path: `/inventory/${item.slug}`,
  title: `${item.year} ${item.modelName} ${item.colorName}`,
  description: `${item.condition === "new" ? "New" : "Used"} ${item.colorName.toLowerCase()} ${item.year} ${item.modelName}: ${item.seats}-passenger ${item.drive.toUpperCase()} all terrain golf cart, $${item.price.toLocaleString("en-US")}. Call (844) 884-6744.`,
  canonical: absoluteUrl(`/inventory/${item.slug}/`),
  schemaTypes: ["Product"],
  indexable: true,
  lastmod: SNAPSHOT_DATE,
  changefreq: "daily",
  priority: 0.7,
  breadcrumbs: [
    HOME,
    { name: "Inventory", path: "/inventory" },
    { name: `${item.modelName} ${item.colorName}`, path: `/inventory/${item.slug}` },
  ],
  images: [item.image],
  lcpImage: item.image,
  lcpSizes: "(min-width: 1024px) 50vw, 92vw",
  ogType: "product",
}));

/* ------------------------------------------------------------------ *
 * Guides (the topic cluster around the pillar page)
 * ------------------------------------------------------------------ */

const guideRoutes: RouteMeta[] = GUIDES.map((guide) => ({
  path: `/guides/${guide.slug}`,
  title: guide.seoTitle,
  description: guide.metaDescription,
  canonical: absoluteUrl(`/guides/${guide.slug}/`),
  schemaTypes: ["Article", "FAQPage"],
  indexable: true,
  lastmod: guide.dateModified,
  changefreq: "monthly",
  priority: 0.7,
  breadcrumbs: [HOME, { name: "Guides", path: "/guides" }, { name: guide.shortTitle, path: `/guides/${guide.slug}` }],
  images: [guide.heroImage],
  lcpImage: guide.heroImage,
  lcpSizes: "(min-width: 1024px) 900px, 100vw",
  ogType: "article",
}));

const guideIndexRoute: RouteMeta = {
  path: "/guides",
  title: "All Terrain Golf Cart Buying Guides",
  description:
    "Buying guides for all terrain golf carts: what they are, what they cost, street-legal rules, battery choice, and tire and suspension setup.",
  canonical: absoluteUrl("/guides/"),
  schemaTypes: ["CollectionPage", "ItemList"],
  indexable: true,
  lastmod: GUIDES.map((g) => g.dateModified).sort().reverse()[0] ?? SNAPSHOT_DATE,
  changefreq: "monthly",
  priority: 0.7,
  breadcrumbs: [HOME, { name: "Guides", path: "/guides" }],
  ogType: "website",
};

/* ------------------------------------------------------------------ *
 * Blog posts
 * ------------------------------------------------------------------ */

const blogRoutes: RouteMeta[] = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  title: post.seoTitle,
  description: post.metaDescription,
  canonical: absoluteUrl(`/blog/${post.slug}/`),
  schemaTypes: ["Article"],
  indexable: true,
  lastmod: post.publishDate,
  changefreq: "yearly",
  priority: 0.6,
  breadcrumbs: [HOME, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }],
  images: [post.heroImage],
  lcpImage: post.heroImage,
  lcpSizes: "100vw",
  ogType: "article",
}));

/* ------------------------------------------------------------------ *
 * Service-area pages
 * ------------------------------------------------------------------ */

const locationRoutes: RouteMeta[] = locations.map((location) => ({
  path: `/${location.slug}`,
  title: `${location.name} All Terrain Golf Carts`,
  description: `4X4 all terrain golf carts delivered to ${location.name}: street-legal LSV rules, popular uses in ${location.majorCities.slice(0, 2).join(" and ")}, and D-MAX XT4/XT6 pricing.`,
  canonical: absoluteUrl(`/${location.slug}/`),
  schemaTypes: ["WebPage", "FAQPage", "ItemList"],
  indexable: true,
  lastmod: SNAPSHOT_DATE,
  changefreq: "monthly",
  priority: 0.5,
  breadcrumbs: [
    HOME,
    { name: "Service Areas", path: "/service-areas" },
    { name: location.name, path: `/${location.slug}` },
  ],
  lcpImage: models[1].colors[0].image,
  lcpSizes: "(min-width: 1024px) 45vw, 90vw",
  preloadBackdrop: { name: HERO_BACKDROP, width: 800 },
  ogType: "website",
}));

/* ------------------------------------------------------------------ *
 * The registry
 * ------------------------------------------------------------------ */

export const routes: RouteMeta[] = [
  ...staticRoutes,
  guideIndexRoute,
  ...modelRoutes,
  ...presetRoutes,
  ...inventoryRoutes,
  ...guideRoutes,
  ...blogRoutes,
  ...locationRoutes,
].map((route) => ({
  ...route,
  title: clampTitle(route.title),
  description: clampDescription(route.description),
}));

const byPath = new Map(routes.map((route) => [route.path, route]));

/** Normalize a browser path to registry form: leading slash, no trailing slash. */
export function normalizePath(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0];
  const trimmed = clean.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function getRouteMeta(pathname: string): RouteMeta | undefined {
  return byPath.get(normalizePath(pathname));
}

/** Fallback head for a URL with no registry entry (the 404 shell). */
export const notFoundMeta: RouteMeta = {
  path: "/404",
  title: "Page Not Found | ALL Terrain Golf Carts",
  description: `That page does not exist. Browse all terrain golf cart models and inventory, or call ${SITE.phoneDisplay}.`,
  canonical: absoluteUrl("/404/"),
  schemaTypes: ["WebPage"],
  indexable: false,
  lastmod: SNAPSHOT_DATE,
  changefreq: "yearly",
  priority: 0.1,
  breadcrumbs: [HOME],
  ogType: "website",
};

export const indexableRoutes = (): RouteMeta[] => routes.filter((route) => route.indexable);
