import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  FACET_KEYS,
  FACET_LABELS,
  facetValueLabel,
  formatPrice,
  hasActiveFilters,
  type FacetKey,
  type FacetOption,
  type FilterState,
} from "@/lib/inventory";
import type { InventoryQuery } from "@/components/inventory/useInventoryQuery";

/** Price buckets offered as one-click ranges alongside the facets. */
const PRICE_RANGES: { label: string; min: number | null; max: number | null }[] = [
  { label: "Under $16,000", min: null, max: 15999 },
  { label: "$16,000 - $18,000", min: 16000, max: 18000 },
  { label: "Over $18,000", min: 18001, max: null },
];

function FacetGroup({
  facet,
  options,
  onToggle,
}: {
  facet: FacetKey;
  options: FacetOption[];
  onToggle: (facet: FacetKey, value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold mb-2">{FACET_LABELS[facet]}</legend>
      {options.map((option) => {
        // A zero-count option is a dead end. It stays visible so the vocabulary
        // is discoverable, but it cannot be selected into an empty result set.
        const deadEnd = option.count === 0 && !option.selected;
        const id = `facet-${facet}-${option.value}`;
        return (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={option.selected}
              disabled={deadEnd}
              onCheckedChange={() => onToggle(facet, option.value)}
              data-testid={id}
            />
            <label
              htmlFor={id}
              className={`flex-1 flex items-center justify-between text-sm cursor-pointer ${
                deadEnd ? "text-muted-foreground/50 cursor-not-allowed" : ""
              }`}
            >
              <span>{option.label}</span>
              <span className="tabular-nums text-xs text-muted-foreground" aria-label={`${option.count} matching`}>
                {option.count}
              </span>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

/** Chips for everything currently applied, each removable in one click. */
export function ActiveFilterChips({ query }: { query: InventoryQuery }) {
  const { state, toggle, setPriceRange, clearAll } = query;
  if (!hasActiveFilters(state)) return null;

  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const facet of FACET_KEYS) {
    for (const value of state[facet]) {
      chips.push({
        key: `${facet}:${value}`,
        label: `${FACET_LABELS[facet]}: ${facetValueLabel(facet, value)}`,
        remove: () => toggle(facet, value),
      });
    }
  }
  if (state.minPrice != null || state.maxPrice != null) {
    chips.push({
      key: "price",
      label: priceLabel(state),
      remove: () => setPriceRange(null, null),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="active-filter-chips">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium hover:border-primary transition-colors"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      ))}
      <Button variant="ghost" size="sm" onClick={clearAll} data-testid="button-clear-all">
        Clear all
      </Button>
    </div>
  );
}

function priceLabel(state: FilterState): string {
  if (state.minPrice != null && state.maxPrice != null) {
    return `${formatPrice(state.minPrice)} - ${formatPrice(state.maxPrice)}`;
  }
  if (state.maxPrice != null) return `Under ${formatPrice(state.maxPrice)}`;
  return `Over ${formatPrice(state.minPrice ?? 0)}`;
}

export function InventoryFilters({ query }: { query: InventoryQuery }) {
  const { state, facets, toggle, setPriceRange, result } = query;

  return (
    <aside className="space-y-6" aria-label="Filter inventory">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <Badge variant="secondary" className="tabular-nums">
          {result.total} {result.total === 1 ? "cart" : "carts"}
        </Badge>
      </div>

      {FACET_KEYS.map((facet) => (
        <div key={facet}>
          <FacetGroup facet={facet} options={facets[facet]} onToggle={toggle} />
          <Separator className="mt-5" />
        </div>
      ))}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold mb-2">Price</legend>
        {PRICE_RANGES.map((range) => {
          const active = state.minPrice === range.min && state.maxPrice === range.max;
          return (
            <button
              key={range.label}
              type="button"
              onClick={() => setPriceRange(active ? null : range.min, active ? null : range.max)}
              aria-pressed={active}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                active ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/50"
              }`}
              data-testid={`price-${range.min ?? "min"}-${range.max ?? "max"}`}
            >
              {range.label}
            </button>
          );
        })}
      </fieldset>
    </aside>
  );
}
