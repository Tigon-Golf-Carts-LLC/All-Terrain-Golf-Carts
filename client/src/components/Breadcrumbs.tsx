import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

import { withBase } from "@/config/site";
import { getRouteMeta } from "@/seo/routes";

/**
 * Rendered breadcrumbs for the current route.
 *
 * The trail comes from the same registry entry that produces the BreadcrumbList
 * JSON-LD, so the visible trail and the marked-up trail cannot drift apart.
 */
export function Breadcrumbs({ path, className }: { path: string; className?: string }) {
  const route = getRouteMeta(path);
  if (!route || route.breadcrumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {route.breadcrumbs.map((crumb, index) => {
          const isLast = index === route.breadcrumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span className="text-foreground font-medium line-clamp-1" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path}>
                  <span className="hover:text-foreground transition-colors cursor-pointer">{crumb.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Skip the router for links that must work before hydration. */
export function baseHref(path: string): string {
  return withBase(path === "/" ? "/" : `${path.replace(/^\/+/, "")}/`);
}
