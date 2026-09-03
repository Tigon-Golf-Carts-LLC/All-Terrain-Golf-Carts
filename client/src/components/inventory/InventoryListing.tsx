import { Link } from "wouter";
import { AlertCircle, Info, Phone } from "lucide-react";

import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { ActiveFilterChips, InventoryFilters } from "@/components/inventory/InventoryFilters";
import type { InventoryQuery } from "@/components/inventory/useInventoryQuery";
import { SITE } from "@/config/site";
import {
  describeActiveFilters,
  FACET_LABELS,
  SORT_KEYS,
  type SortKey,
} from "@/lib/inventory";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
  "seats-asc": "Seats: fewest first",
  "seats-desc": "Seats: most first",
};

/**
 * The listing view, shared by `/inventory/` and every prerendered filter page.
 *
 * The only difference between those pages is the heading, the answer-first
 * paragraph and the baseline filters, all passed in. The controls, results,
 * facet counts and empty state are identical, so a preset page is never a
 * second implementation that can drift from the main listing.
 */
export function InventoryListing({
  path,
  heading,
  question,
  answer,
  query,
  updatedAt,
  totalInStock,
}: {
  path: string;
  heading: string;
  question?: string;
  answer: string;
  query: InventoryQuery;
  updatedAt: string;
  totalInStock: number;
}) {
  const { state, result, setSort, setPage, clearAll } = query;
  const activeDescriptions = describeActiveFilters(state);

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={path} className="pt-6" />

        <header className="py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5">{heading}</h1>
          <AnswerFirst question={question} answer={answer} />
          <p className="mt-4 text-sm text-muted-foreground">
            {totalInStock} configurations in stock &middot; Inventory updated{" "}
            <time dateTime={updatedAt}>
              {new Date(updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </p>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          <InventoryFilters query={query} />

          <section aria-label="Results">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground tabular-nums" data-testid="result-count">
                Showing {result.items.length} of {result.total} {result.total === 1 ? "cart" : "carts"}
                {result.pageCount > 1 && ` (page ${result.page} of ${result.pageCount})`}
              </p>

              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort</span>
                <select
                  value={state.sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  data-testid="select-sort"
                >
                  {SORT_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-6">
              <ActiveFilterChips query={query} />
            </div>

            {result.ignored.length > 0 && (
              <div
                className="mb-6 flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm"
                data-testid="ignored-filters"
              >
                <Info className="w-5 h-5 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  Ignored{" "}
                  {result.ignored
                    .map((entry) => `${FACET_LABELS[entry.facet].toLowerCase()} "${entry.value}"`)
                    .join(", ")}{" "}
                  &mdash; we do not carry that option, so it was left out rather than returning nothing. The
                  remaining filters are applied.
                </p>
              </div>
            )}

            {result.total === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center" data-testid="empty-state">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-bold mb-2">No carts match these filters</h2>
                <p className="text-muted-foreground mb-2">
                  Nothing in stock matches{" "}
                  {activeDescriptions.length > 0 ? activeDescriptions.join(", ") : "the current filters"}.
                </p>
                <p className="text-muted-foreground mb-6">
                  Clear the filters to see all {totalInStock} configurations, or call {SITE.phoneDisplay} and we
                  will tell you when one arrives.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={clearAll} data-testid="button-empty-clear-all">
                    Clear all filters
                  </Button>
                  <a href={SITE.phoneHref}>
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      Call {SITE.phoneDisplay}
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
                  {result.items.map((item, index) => (
                    <li key={item.slug}>
                      <InventoryCard item={item} priority={index === 0} />
                    </li>
                  ))}
                </ul>

                {result.pageCount > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                    {Array.from({ length: result.pageCount }, (_, index) => index + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === result.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(page)}
                        aria-current={page === result.page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    ))}
                  </nav>
                )}
              </>
            )}

            <div className="mt-12 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-2">Not sure which model fits your property?</h2>
              <p className="text-muted-foreground mb-4">
                The 4-passenger{" "}
                <Link href="/evolution-d-max-xt4">
                  <span className="text-primary underline cursor-pointer">D-MAX XT4</span>
                </Link>{" "}
                and the 6-passenger{" "}
                <Link href="/evolution-d-max-xt6">
                  <span className="text-primary underline cursor-pointer">D-MAX XT6</span>
                </Link>{" "}
                share the same 4X4 drivetrain, so the choice is seating and body length. Our{" "}
                <Link href="/guides/4x4-vs-2wd-golf-carts">
                  <span className="text-primary underline cursor-pointer">4X4 vs 2WD comparison</span>
                </Link>{" "}
                covers whether you need all-wheel drive at all.
              </p>
              <a href={SITE.phoneHref}>
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Talk to a real person: {SITE.phoneDisplay}
                </Button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
