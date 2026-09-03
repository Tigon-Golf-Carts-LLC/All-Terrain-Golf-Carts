import { useCallback } from "react";

import snapshot from "@/data/inventory.json";
import { InventoryListing } from "@/components/inventory/InventoryListing";
import { useInventoryQuery } from "@/components/inventory/useInventoryQuery";
import { presetFilterState, type FilterPreset } from "@/data/filterPresets";
import type { FilterState, InventorySnapshot } from "@/lib/inventory";

const inventory = snapshot as unknown as InventorySnapshot;

/**
 * A prerendered filter page, e.g. `/inventory/new/`.
 *
 * The preset supplies the baseline filters; anything in the query string layers
 * on top and wins, so a visitor can narrow further from a preset page and still
 * get a URL that fully describes the view.
 */
export default function InventoryPreset({ preset }: { preset: FilterPreset }) {
  const derive = useCallback(
    (fromUrl: FilterState) => presetFilterState(preset, fromUrl),
    [preset],
  );
  const query = useInventoryQuery(inventory.items, derive);

  return (
    <InventoryListing
      path={`/inventory/${preset.slug}`}
      heading={preset.heading}
      answer={preset.answer}
      query={query}
      updatedAt={inventory.updatedAt}
      totalInStock={inventory.count}
    />
  );
}
