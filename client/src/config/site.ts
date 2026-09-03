/**
 * Single source of truth for NAP (name / address / phone) and site-wide identity.
 *
 * Entity consistency matters for local SEO and AEO: the strings below are the ones
 * that must appear identically in visible text, in `tel:` hrefs and in JSON-LD.
 * Change them here and every surface follows.
 */

export const SITE = {
  name: "ALL Terrain Golf Carts",
  shortName: "ALL Terrain",
  legalName: "Tigon Golf Carts LLC",
  tagline: "Premium 4X4 Electric Golf Carts",
  description:
    "Authorized dealer of EVolution D-MAX 4X4 electric golf carts. Dual-motor all-wheel drive, street-legal LSV capability and nationwide delivery.",

  /** Bare domain, no protocol, no trailing slash. */
  domain: "allterraingolfcarts.com",
  /** Absolute origin used for canonicals, OG tags and the sitemap. */
  origin: "https://allterraingolfcarts.com",

  /** Primary CTA. `phoneDisplay` is what humans read, `phoneHref` what the browser dials. */
  phoneDisplay: "(844) 884-6744",
  phoneHref: "tel:+18448846744",
  /** E.164, for schema.org telephone. */
  phoneE164: "+1-844-884-6744",

  emailSales: "sales@tigongolfcarts.com",
  emailInfo: "info@allterraingolfcarts.com",

  /**
   * Delivery-only business: there is no public showroom address, so the site
   * publishes Organization + OnlineStore schema with a nationwide `areaServed`
   * rather than a LocalBusiness with an incomplete PostalAddress.
   */
  hasPhysicalStorefront: false,
  areaServed: "United States",
  areaServedNote: "Nationwide delivery available",

  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" },
    { days: ["Saturday"], opens: "09:00", closes: "17:00" },
  ],

  /**
   * Verified profile URLs for schema `sameAs`. Left empty on purpose: shipping
   * links to profiles that do not exist harms entity resolution more than it
   * helps. Add the Google Business Profile and social URLs here and they appear
   * in the footer and in JSON-LD automatically.
   */
  sameAs: [] as string[],
  googleBusinessProfile: "" as string,

  analytics: {
    ga4: "G-F0EB0R0CN9",
    gtm: "GTM-TCNMK7PS",
  },
  pinterestVerification: "c0d1a4d2d8cdbe9010c99fc8bde5b827",

  brandName: "EVolution Electric Vehicles",
  primaryKeyword: "All Terrain Golf Carts",
} as const;

/** Base path the app is served from ("/" for a custom domain, "/<repo>/" for a project site). */
export const BASE_PATH: string =
  typeof import.meta !== "undefined" && (import.meta as any).env?.BASE_URL
    ? (import.meta as any).env.BASE_URL
    : "/";

/** Prefix a root-relative site path with the deployment base path. */
export function withBase(path: string): string {
  const base = BASE_PATH.endsWith("/") ? BASE_PATH : `${BASE_PATH}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

/** Absolute URL for canonicals, OG tags and sitemap entries. */
export function absoluteUrl(path: string): string {
  return `${SITE.origin}/${path.replace(/^\/+/, "")}`;
}
