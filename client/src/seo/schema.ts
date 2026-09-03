/**
 * JSON-LD builders.
 *
 * Every builder takes the same data the page renders, so schema can never
 * describe content that is not on the page. The site-wide graph carries
 * Organization + OnlineStore + WebSite; each page adds only the types listed in
 * its registry entry.
 *
 * The business has no public showroom, so it is modelled as an Organization /
 * OnlineStore with a nationwide `areaServed` rather than a LocalBusiness with an
 * incomplete PostalAddress. An address-less LocalBusiness is an invalid entity
 * and Google treats it as such.
 */

import { SITE, absoluteUrl } from "@/config/site";
import type { Guide } from "@/data/guides";
import type { BlogPost } from "@/data/blogPosts";
import type { ModelDefinition } from "@/data/models";
import type { InventoryItem } from "@/lib/inventory";
import type { RouteMeta } from "@/seo/routes";

type Json = Record<string, unknown>;

const ORG_ID = `${SITE.origin}/#organization`;
const WEBSITE_ID = `${SITE.origin}/#website`;

/** Absolute URL for an image, given a manifest key and a derivative width. */
export type ImageResolver = (name: string, width?: number) => string;

function openingHours(): Json[] {
  return SITE.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.days.length === 1 ? slot.days[0] : slot.days,
    opens: slot.opens,
    closes: slot.closes,
  }));
}

/** Organization + OnlineStore + WebSite. Emitted on every page. */
export function siteGraph(resolveImage: ImageResolver): Json[] {
  const organization: Json = {
    "@type": ["Organization", "OnlineStore", "AutoDealer"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin,
    description: SITE.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/favicon.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl("/og-image.png"),
    telephone: SITE.phoneE164,
    email: SITE.emailSales,
    priceRange: "$$$$",
    currenciesAccepted: "USD",
    areaServed: { "@type": "Country", name: SITE.areaServed },
    openingHoursSpecification: openingHours(),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phoneE164,
        email: SITE.emailSales,
        contactType: "sales",
        areaServed: "US",
        availableLanguage: "English",
      },
    ],
    brand: { "@type": "Brand", name: SITE.brandName },
  };

  // Only emit `sameAs` once there are verified profiles to point at.
  const profiles = [...SITE.sameAs, SITE.googleBusinessProfile].filter(Boolean);
  if (profiles.length) organization.sameAs = profiles;

  const website: Json = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.origin,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
  };

  return [organization, website];
}

export function breadcrumbList(route: RouteMeta): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": `${route.canonical}#breadcrumb`,
    itemListElement: route.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path === "/" ? "/" : `${crumb.path}/`),
    })),
  };
}

export function webPage(route: RouteMeta, extra: Json = {}): Json {
  return {
    "@type": route.schemaTypes.includes("ContactPage")
      ? "ContactPage"
      : route.schemaTypes.includes("CollectionPage")
        ? "CollectionPage"
        : "WebPage",
    "@id": `${route.canonical}#webpage`,
    url: route.canonical,
    name: route.title,
    description: route.description,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en-US",
    dateModified: route.lastmod,
    breadcrumb: { "@id": `${route.canonical}#breadcrumb` },
    ...extra,
  };
}

export function faqPage(route: RouteMeta, faqs: { question: string; answer: string }[]): Json | null {
  if (faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    "@id": `${route.canonical}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

const CONDITION_URL: Record<string, string> = {
  new: "https://schema.org/NewCondition",
  used: "https://schema.org/UsedCondition",
};

/**
 * Product + Vehicle for one inventory item. `itemCondition` is derived from the
 * same normalized `condition` field the filters use, so schema and filtering can
 * never disagree about whether a cart is new.
 */
export function inventoryProduct(item: InventoryItem, route: RouteMeta, resolveImage: ImageResolver): Json {
  return {
    "@type": ["Product", "Vehicle"],
    "@id": `${route.canonical}#product`,
    name: item.title,
    description: item.description,
    image: [resolveImage(item.image, 1200)],
    sku: item.sku,
    mpn: item.sku,
    brand: { "@type": "Brand", name: item.makeName },
    manufacturer: { "@type": "Organization", name: item.makeName },
    model: item.modelName,
    vehicleModelDate: String(item.year),
    productionDate: String(item.year),
    vehicleConfiguration: `${item.trim} ${item.drive.toUpperCase()}`,
    itemCondition: CONDITION_URL[item.condition],
    color: item.colorName,
    numberOfDoors: 0,
    vehicleSeatingCapacity: {
      "@type": "QuantitativeValue",
      value: item.seats,
      unitText: "passengers",
    },
    driveWheelConfiguration:
      item.drive === "4x4"
        ? "https://schema.org/FourWheelDriveConfiguration"
        : "https://schema.org/RearWheelDriveConfiguration",
    fuelType: "Electric",
    vehicleEngine: {
      "@type": "EngineSpecification",
      engineType: `Dual electric motors, ${item.motorKw}kW combined`,
      enginePower: { "@type": "QuantitativeValue", value: item.motorKw, unitCode: "KWT" },
    },
    speed: { "@type": "QuantitativeValue", maxValue: item.topSpeedMph, unitCode: "HM" },
    vehicleTransmission: "Direct drive",
    offers: {
      "@type": "Offer",
      "@id": `${route.canonical}#offer`,
      url: route.canonical,
      price: item.price,
      priceCurrency: item.priceCurrency,
      priceValidUntil: `${item.year}-12-31`,
      itemCondition: CONDITION_URL[item.condition],
      availability: `https://schema.org/${item.availability}`,
      seller: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: SITE.areaServed },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Drive System", value: item.drive.toUpperCase() },
      { "@type": "PropertyValue", name: "Seating Capacity", value: `${item.seats} passengers` },
      { "@type": "PropertyValue", name: "Battery", value: item.batteryType },
      { "@type": "PropertyValue", name: "Range", value: `${item.rangeMilesMin}-${item.rangeMilesMax} miles` },
      { "@type": "PropertyValue", name: "Top Speed", value: `${item.topSpeedMph} MPH` },
      { "@type": "PropertyValue", name: "Street Legal", value: item.features.includes("street-legal") ? "LSV ready" : "Off-road only" },
    ],
  };
}

/** Product for a model page, priced from the model's starting price. */
export function modelProduct(model: ModelDefinition, route: RouteMeta, resolveImage: ImageResolver): Json {
  return {
    "@type": ["Product", "Vehicle"],
    "@id": `${route.canonical}#product`,
    name: model.name,
    description: model.description,
    image: model.colors.map((color) => resolveImage(color.image, 1200)),
    sku: model.sku,
    brand: { "@type": "Brand", name: SITE.brandName },
    model: model.name,
    vehicleModelDate: String(model.year),
    vehicleConfiguration: `${model.seats}-Passenger ${model.drive.toUpperCase()}`,
    itemCondition: CONDITION_URL.new,
    fuelType: "Electric",
    vehicleSeatingCapacity: {
      "@type": "QuantitativeValue",
      value: model.seats,
      unitText: "passengers",
    },
    driveWheelConfiguration: "https://schema.org/FourWheelDriveConfiguration",
    speed: { "@type": "QuantitativeValue", maxValue: model.topSpeedMph, unitCode: "HM" },
    offers: {
      "@type": "AggregateOffer",
      "@id": `${route.canonical}#offer`,
      url: route.canonical,
      lowPrice: model.price,
      highPrice: model.price,
      priceCurrency: model.priceCurrency,
      offerCount: model.colors.length,
      availability: `https://schema.org/${model.availability}`,
      seller: { "@id": ORG_ID },
    },
  };
}

export interface ListEntry {
  name: string;
  path: string;
}

export function itemList(route: RouteMeta, name: string, entries: ListEntry[]): Json {
  return {
    "@type": "ItemList",
    "@id": `${route.canonical}#itemlist`,
    name,
    numberOfItems: entries.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: absoluteUrl(`${entry.path}/`),
    })),
  };
}

export function article(
  route: RouteMeta,
  data: { headline: string; description: string; datePublished: string; dateModified: string; image: string },
): Json {
  return {
    "@type": "Article",
    "@id": `${route.canonical}#article`,
    headline: data.headline,
    description: data.description,
    image: [data.image],
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    inLanguage: "en-US",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@id": `${route.canonical}#webpage` },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function guideArticle(guide: Guide, route: RouteMeta, resolveImage: ImageResolver): Json {
  return article(route, {
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    image: resolveImage(guide.heroImage, 1200),
  });
}

export function blogArticle(post: BlogPost, route: RouteMeta, resolveImage: ImageResolver): Json {
  return article(route, {
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    image: resolveImage(post.heroImage, 1200),
  });
}

/** Wrap a page's nodes in the `@graph` envelope with the site-wide nodes. */
export function buildGraph(nodes: (Json | null)[], resolveImage: ImageResolver): string {
  const graph = [...siteGraph(resolveImage), ...nodes.filter((node): node is Json => node !== null)];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}
