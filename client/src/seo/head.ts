/**
 * Head tags for one route.
 *
 * `buildHeadTags` produces the exact string the prerenderer injects, and
 * `useDocumentHead` applies the same values to the live document during
 * client-side navigation. One builder means a crawler fetching
 * `/inventory/new/index.html` and a visitor clicking through to it see the same
 * title, description, canonical and structured data.
 */

import { useEffect } from "react";

import { SITE, absoluteUrl } from "@/config/site";
import { imageSources, imageUrl } from "@/lib/images";
import { getRouteMeta, notFoundMeta, type RouteMeta } from "@/seo/routes";
import { schemaForPath } from "@/seo/pageSchema";

export interface HeadData {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: string;
  ogImage: string;
  jsonLd: string;
  /** Preload tag for the LCP image, or "" when the page has none. */
  lcpPreload: string;
}

export function headDataFor(pathname: string): HeadData {
  const route: RouteMeta = getRouteMeta(pathname) ?? notFoundMeta;
  return {
    lcpPreload: buildLcpPreload(route),
    title: route.title,
    description: route.description,
    canonical: route.canonical,
    robots: route.indexable ? "index, follow, max-image-preview:large" : "noindex, follow",
    ogType: route.ogType ?? "website",
    ogImage: absoluteUrl("/og-image.png"),
    jsonLd: schemaForPath(pathname),
  };
}

/**
 * `<link rel="preload" as="image">` with `imagesrcset`/`imagesizes` so the
 * browser picks the same derivative the `<picture>` would and starts the fetch
 * during HTML parse. The `sizes` here must match the element's `sizes` exactly,
 * or the browser downloads one width and then uses another.
 */
function buildLcpPreload(route: RouteMeta): string {
  if (!route.lcpImage) return "";
  try {
    const { avifSrcSet } = imageSources(route.lcpImage);
    const sizes = route.lcpSizes ?? "100vw";
    const a = escapeAttribute;
    // Exactly one format. Preloading both AVIF and WebP makes the browser fetch
    // both and use one, which costs more than the preload saves. Browsers
    // without AVIF simply skip this and fetch WebP from the <picture> as usual.
    const tags = [
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${a(avifSrcSet)}" imagesizes="${a(sizes)}" fetchpriority="high" />`,
    ];
    if (route.preloadBackdrop) {
      tags.push(
        `<link rel="preload" as="image" type="image/webp" href="${a(imageUrl(route.preloadBackdrop.name, route.preloadBackdrop.width))}" />`,
      );
    }
    return tags.join("\n    ");
  } catch {
    // A stale manifest reference must not break the page head.
    return "";
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape only what can terminate a script element early. */
function escapeJsonLd(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

/** The full head block for a prerendered page. */
export function buildHeadTags(pathname: string): string {
  const head = headDataFor(pathname);
  const a = escapeAttribute;

  return [
    `<title>${a(head.title)}</title>`,
    head.lcpPreload,
    `<meta name="description" content="${a(head.description)}" />`,
    `<meta name="robots" content="${head.robots}" />`,
    `<link rel="canonical" href="${a(head.canonical)}" />`,
    `<meta property="og:type" content="${head.ogType}" />`,
    `<meta property="og:site_name" content="${a(SITE.name)}" />`,
    `<meta property="og:title" content="${a(head.title)}" />`,
    `<meta property="og:description" content="${a(head.description)}" />`,
    `<meta property="og:url" content="${a(head.canonical)}" />`,
    `<meta property="og:image" content="${a(head.ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${a(`${SITE.name} - ${SITE.tagline}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${a(head.title)}" />`,
    `<meta name="twitter:description" content="${a(head.description)}" />`,
    `<meta name="twitter:image" content="${a(head.ogImage)}" />`,
    `<script type="application/ld+json">${escapeJsonLd(head.jsonLd)}</script>`,
  ].join("\n    ");
}

/* ------------------------------------------------------------------ *
 * Client-side head updates
 * ------------------------------------------------------------------ */

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Keeps the document head in step with the current route after a client-side
 * navigation. The prerendered HTML already carries the correct tags on first
 * paint, so this only matters from the second page onward.
 */
export function useDocumentHead(pathname: string): void {
  useEffect(() => {
    const head = headDataFor(pathname);

    document.title = head.title;
    setMeta('meta[name="description"]', "name", "description", head.description);
    setMeta('meta[name="robots"]', "name", "robots", head.robots);
    setMeta('meta[property="og:title"]', "property", "og:title", head.title);
    setMeta('meta[property="og:description"]', "property", "og:description", head.description);
    setMeta('meta[property="og:url"]', "property", "og:url", head.canonical);
    setMeta('meta[property="og:type"]', "property", "og:type", head.ogType);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", head.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", head.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = head.canonical;

    let jsonLd = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = head.jsonLd;
  }, [pathname]);
}
