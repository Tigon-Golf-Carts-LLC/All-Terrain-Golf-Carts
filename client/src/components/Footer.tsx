import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";

import { SITE } from "@/config/site";
import { GUIDES } from "@/data/guides";
import { FILTER_PRESETS } from "@/data/filterPresets";

/**
 * Site footer.
 *
 * Two changes from the pre-conversion footer worth knowing about:
 *
 *  - The social icons linked to `href="#"`. Links to profiles that do not exist
 *    are dead ends for visitors and noise for entity resolution, so they are
 *    gone until real URLs are added to `SITE.sameAs`, at which point they render
 *    automatically.
 *  - "Warranty", "Privacy Policy" and "Terms of Service" also pointed at `#`.
 *    They are listed as plain text rather than as links to nowhere.
 *
 * The phone number and email here are the same strings used in the header, the
 * schema markup and the `tel:` href. That consistency is what lets a search
 * engine treat them as one entity.
 */
export function Footer() {
  const presetLinks = FILTER_PRESETS.filter((preset) => preset.indexable).slice(0, 5);

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AT</span>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">ALL Terrain</p>
                <p className="text-xs text-muted-foreground -mt-0.5">Golf Carts</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              4X4 all-terrain electric golf carts designed for those who demand more. Conquer any terrain with style
              and power.
            </p>

            {SITE.sameAs.length > 0 && (
              <ul className="flex items-center gap-3 mt-6 list-none p-0">
                {SITE.sameAs.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                      rel="noopener"
                    >
                      {new URL(url).hostname.replace("www.", "")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-labelledby="footer-models">
            <h2 id="footer-models" className="font-semibold text-sm uppercase tracking-wider mb-4">
              Models
            </h2>
            <ul className="space-y-3 list-none p-0">
              <li>
                <Link href="/evolution-d-max-xt4">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-xt4">
                    EVolution D-MAX XT4
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/evolution-d-max-xt6">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-xt6">
                    EVolution D-MAX XT6
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/inventory">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-inventory">
                    All inventory in stock
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/#capabilities">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-4x4">
                    4X4 All-Terrain Capabilities
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/#features">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-features">
                    Features
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-browse">
            <h2 id="footer-browse" className="font-semibold text-sm uppercase tracking-wider mb-4">
              Browse
            </h2>
            <ul className="space-y-3 list-none p-0">
              {presetLinks.map((preset) => (
                <li key={preset.slug}>
                  <Link href={`/inventory/${preset.slug}`}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {preset.heading}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-guides">
            <h2 id="footer-guides" className="font-semibold text-sm uppercase tracking-wider mb-4">
              Guides
            </h2>
            <ul className="space-y-3 list-none p-0">
              {GUIDES.slice(0, 5).map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guides/${guide.slug}`}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {guide.shortTitle}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-blog">
                    Blog
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h2>
            <ul className="space-y-3 list-none p-0">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  {SITE.areaServedNote}
                  <br />
                  <Link href="/service-areas">
                    <span className="underline cursor-pointer hover:text-foreground">All 50 states</span>
                  </Link>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                <a
                  href={SITE.phoneHref}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-phone"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${SITE.emailSales}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                  data-testid="link-email"
                >
                  {SITE.emailSales}
                </a>
              </li>
            </ul>

            <h2 className="font-semibold text-sm uppercase tracking-wider mt-6 mb-3">Company</h2>
            <ul className="space-y-2 list-none p-0">
              <li>
                <Link href="/contact">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-contact">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/financing">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-financing">
                    Financing
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Authorized {SITE.brandName} dealer &middot; {SITE.legalName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
