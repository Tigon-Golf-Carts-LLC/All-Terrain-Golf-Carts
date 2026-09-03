/**
 * Resolves one route to the JSON-LD graph for that page.
 *
 * Shared by the prerenderer (which inlines the result into the emitted HTML) and
 * by the running app (which swaps it on client-side navigation), so a crawler
 * and a visitor always see the same structured data.
 */

import snapshot from "@/data/inventory.json";
import { blogPosts } from "@/data/blogPosts";
import { locations } from "@/data/locations";
import { models } from "@/data/models";
import { GUIDES, getGuide } from "@/data/guides";
import { FILTER_PRESETS, getPreset } from "@/data/filterPresets";
import { SITE, absoluteUrl } from "@/config/site";
import { imageUrl } from "@/lib/images";
import { applyFilters, emptyFilterState, type InventorySnapshot } from "@/lib/inventory";
import { HOME_FAQS, CONTACT_FAQS, FINANCING_FAQS } from "@/data/faqs";
import {
  blogArticle,
  breadcrumbList,
  buildGraph,
  faqPage,
  guideArticle,
  inventoryProduct,
  itemList,
  modelProduct,
  webPage,
  type ImageResolver,
} from "@/seo/schema";
import { getRouteMeta, normalizePath, type RouteMeta } from "@/seo/routes";

const inventory = snapshot as unknown as InventorySnapshot;

/** Absolute URL for a manifest image key, as schema.org requires. */
const resolveImage: ImageResolver = (name, width = 1200) => {
  const relative = imageUrl(name, width);
  return relative.startsWith("http") ? relative : absoluteUrl(relative.replace(/^\/+/, "/"));
};

function inventoryEntries() {
  return inventory.items.map((item) => ({ name: item.title, path: `/inventory/${item.slug}` }));
}

/** The JSON-LD graph for a path, or the site-wide graph alone if unknown. */
export function schemaForPath(pathname: string): string {
  const path = normalizePath(pathname);
  const route: RouteMeta | undefined = getRouteMeta(path);
  if (!route) return buildGraph([], resolveImage);

  const nodes: (Record<string, unknown> | null)[] = [breadcrumbList(route)];

  // --- home -------------------------------------------------------------
  if (path === "/") {
    nodes.push(webPage(route));
    nodes.push(
      itemList(
        route,
        "All Terrain Golf Cart Models",
        models.map((model) => ({ name: model.name, path: model.path })),
      ),
    );
    nodes.push(faqPage(route, HOME_FAQS));
    return buildGraph(nodes, resolveImage);
  }

  // --- inventory listing -------------------------------------------------
  if (path === "/inventory") {
    nodes.push(webPage(route, { about: { "@id": `${SITE.origin}/#organization` } }));
    nodes.push(itemList(route, "All Terrain Golf Cart Inventory", inventoryEntries()));
    return buildGraph(nodes, resolveImage);
  }

  // --- prerendered filter presets ---------------------------------------
  const presetSlug = path.startsWith("/inventory/") ? path.slice("/inventory/".length) : null;
  const preset = presetSlug ? getPreset(presetSlug) : undefined;
  if (preset) {
    const state = { ...emptyFilterState(), ...preset.filters };
    const matched = applyFilters(inventory.items, state);
    nodes.push(webPage(route));
    nodes.push(
      itemList(
        route,
        preset.heading,
        matched.items.map((item) => ({ name: item.title, path: `/inventory/${item.slug}` })),
      ),
    );
    return buildGraph(nodes, resolveImage);
  }

  // --- inventory detail --------------------------------------------------
  if (presetSlug) {
    const item = inventory.items.find((candidate) => candidate.slug === presetSlug);
    if (item) {
      nodes.push(webPage(route));
      nodes.push(inventoryProduct(item, route, resolveImage));
      return buildGraph(nodes, resolveImage);
    }
  }

  // --- model pages -------------------------------------------------------
  const model = models.find((candidate) => candidate.path === path);
  if (model) {
    nodes.push(webPage(route));
    nodes.push(modelProduct(model, route, resolveImage));
    nodes.push(faqPage(route, HOME_FAQS.slice(0, 4)));
    return buildGraph(nodes, resolveImage);
  }

  // --- guides ------------------------------------------------------------
  if (path === "/guides") {
    nodes.push(webPage(route));
    nodes.push(
      itemList(
        route,
        "All Terrain Golf Cart Guides",
        GUIDES.map((guide) => ({ name: guide.title, path: `/guides/${guide.slug}` })),
      ),
    );
    return buildGraph(nodes, resolveImage);
  }
  if (path.startsWith("/guides/")) {
    const guide = getGuide(path.slice("/guides/".length));
    if (guide) {
      nodes.push(webPage(route));
      nodes.push(guideArticle(guide, route, resolveImage));
      nodes.push(faqPage(route, guide.faqs));
      return buildGraph(nodes, resolveImage);
    }
  }

  // --- blog --------------------------------------------------------------
  if (path === "/blog") {
    nodes.push(webPage(route));
    nodes.push(
      itemList(
        route,
        "All Terrain Golf Cart Articles",
        blogPosts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
      ),
    );
    return buildGraph(nodes, resolveImage);
  }
  if (path.startsWith("/blog/")) {
    const post = blogPosts.find((candidate) => candidate.slug === path.slice("/blog/".length));
    if (post) {
      nodes.push(webPage(route));
      nodes.push(blogArticle(post, route, resolveImage));
      return buildGraph(nodes, resolveImage);
    }
  }

  // --- contact / financing ----------------------------------------------
  if (path === "/contact") {
    nodes.push(webPage(route));
    nodes.push(faqPage(route, CONTACT_FAQS));
    return buildGraph(nodes, resolveImage);
  }
  if (path === "/financing") {
    nodes.push(webPage(route));
    nodes.push(faqPage(route, FINANCING_FAQS));
    return buildGraph(nodes, resolveImage);
  }

  // --- service areas -----------------------------------------------------
  if (path === "/service-areas") {
    nodes.push(webPage(route));
    nodes.push(
      itemList(
        route,
        "Golf Cart Delivery by State",
        locations.map((location) => ({ name: location.name, path: `/${location.slug}` })),
      ),
    );
    return buildGraph(nodes, resolveImage);
  }

  const location = locations.find((candidate) => `/${candidate.slug}` === path);
  if (location) {
    nodes.push(webPage(route, { about: { "@type": "Place", name: location.name } }));
    nodes.push(
      itemList(
        route,
        `All Terrain Golf Carts in ${location.name}`,
        models.map((candidate) => ({ name: candidate.name, path: candidate.path })),
      ),
    );
    nodes.push(faqPage(route, location.faqs));
    return buildGraph(nodes, resolveImage);
  }

  nodes.push(webPage(route));
  return buildGraph(nodes, resolveImage);
}
