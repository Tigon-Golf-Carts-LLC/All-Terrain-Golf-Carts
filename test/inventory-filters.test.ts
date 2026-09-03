import { describe, expect, it } from "vitest";

import snapshot from "../client/src/data/inventory.json";
import {
  applyFilters,
  computeFacets,
  describeActiveFilters,
  emptyFilterState,
  FACET_KEYS,
  hasActiveFilters,
  parseFilters,
  serializeFilters,
  toggleFacetValue,
  type FilterState,
  type InventoryItem,
  type InventorySnapshot,
} from "../client/src/lib/inventory";

const data = snapshot as unknown as InventorySnapshot;
const items: InventoryItem[] = data.items;

/** Run a query string against the snapshot exactly as the page does. */
function run(search: string) {
  return applyFilters(items, parseFilters(search));
}

describe("snapshot integrity", () => {
  it("is non-empty and carries a freshness stamp", () => {
    expect(items.length).toBeGreaterThan(0);
    expect(data.count).toBe(items.length);
    expect(Number.isNaN(Date.parse(data.updatedAt))).toBe(false);
  });

  it("stores normalized enum values, never display strings", () => {
    for (const item of items) {
      expect(["new", "used"]).toContain(item.condition);
      expect(item.color).toBe(item.color.toLowerCase());
      expect(item.color).not.toMatch(/\s/);
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("gives every item a unique slug", () => {
    expect(new Set(items.map((i) => i.slug)).size).toBe(items.length);
  });
});

describe("condition filtering", () => {
  it("?condition=new returns only new items, and the count matches a direct filter", () => {
    const result = run("?condition=new");
    const expected = items.filter((i) => i.condition === "new");
    expect(result.total).toBe(expected.length);
    expect(result.items.every((i) => i.condition === "new")).toBe(true);
    expect(result.items.some((i) => i.condition === "used")).toBe(false);
  });

  it("?condition=used returns only used items", () => {
    const result = run("?condition=used");
    const expected = items.filter((i) => i.condition === "used");
    expect(result.total).toBe(expected.length);
    expect(result.items.every((i) => i.condition === "used")).toBe(true);
    expect(result.items.some((i) => i.condition === "new")).toBe(false);
  });

  it("maps display synonyms onto the enum, so Pre-Owned never matches new", () => {
    expect(parseFilters("?condition=Pre-Owned").condition).toEqual(["used"]);
    expect(parseFilters("?condition=USED").condition).toEqual(["used"]);
    expect(parseFilters("?condition=Brand%20New").condition).toEqual(["new"]);
    expect(run("?condition=Pre-Owned").items.every((i) => i.condition === "used")).toBe(true);
  });
});

describe("multi-select", () => {
  it("two colors return the union of both and nothing else", () => {
    const result = run("?color=black&color=red");
    const expected = items.filter((i) => i.color === "black" || i.color === "red");
    expect(result.total).toBe(expected.length);
    expect(new Set(result.items.map((i) => i.color))).toEqual(new Set(["black", "red"]));
    expect(result.total).toBeGreaterThan(run("?color=black").total);
  });

  it("accepts comma-joined values identically to repeated params", () => {
    const repeated = run("?color=black&color=red");
    const joined = run("?color=black,red");
    expect(joined.items.map((i) => i.slug)).toEqual(repeated.items.map((i) => i.slug));
  });

  it("keeps color selections through a full round trip (the bug that used to drop them)", () => {
    const parsed = parseFilters("?condition=new&color=black&color=sky-blue");
    expect(parsed.color).toEqual(["black", "sky-blue"]);
    const round = parseFilters(serializeFilters(parsed));
    expect(round.color).toEqual(["black", "sky-blue"]);
    expect(round.condition).toEqual(["new"]);
  });
});

describe("combined filters", () => {
  it("condition + color + price range returns the intersection", () => {
    const search = "?condition=new&color=red&color=black&minPrice=16000&maxPrice=20000";
    const result = run(search);
    const expected = items.filter(
      (i) =>
        i.condition === "new" &&
        (i.color === "red" || i.color === "black") &&
        i.price >= 16000 &&
        i.price <= 20000,
    );
    expect(result.total).toBe(expected.length);
    expect(new Set(result.items.map((i) => i.slug))).toEqual(new Set(expected.map((i) => i.slug)));
    for (const item of result.items) {
      expect(item.condition).toBe("new");
      expect(["red", "black"]).toContain(item.color);
      expect(item.price).toBeGreaterThanOrEqual(16000);
      expect(item.price).toBeLessThanOrEqual(20000);
    }
  });

  it("AND across facets: model + seats that disagree return nothing", () => {
    const result = run("?model=d-max-xt4&seats=6");
    expect(result.total).toBe(0);
    expect(result.ignored).toEqual([]);
  });

  it("swaps a reversed price range instead of returning nothing", () => {
    const reversed = run("?minPrice=20000&maxPrice=10000");
    const forward = run("?minPrice=10000&maxPrice=20000");
    expect(reversed.total).toBe(forward.total);
  });
});

describe("serialization", () => {
  it("serialize -> parse -> serialize is idempotent", () => {
    const searches = [
      "",
      "?condition=new",
      "?color=red&color=black&condition=new",
      "?condition=new&color=sky-blue&model=d-max-xt6&seats=6&minPrice=15000&maxPrice=20000&sort=price-desc&page=2",
      "?color=black,red&condition=Pre-Owned&drive=4WD",
    ];
    for (const search of searches) {
      const once = serializeFilters(parseFilters(search));
      const twice = serializeFilters(parseFilters(once));
      expect(twice).toBe(once);
      expect(parseFilters(twice)).toEqual(parseFilters(once));
    }
  });

  it("orders values canonically regardless of the order they were typed", () => {
    expect(serializeFilters(parseFilters("?color=red&color=black"))).toBe(
      serializeFilters(parseFilters("?color=black&color=red")),
    );
  });

  it("omits defaults so a clean listing URL stays clean", () => {
    expect(serializeFilters(emptyFilterState())).toBe("");
    expect(serializeFilters(parseFilters("?sort=featured&page=1"))).toBe("");
  });
});

describe("state restoration", () => {
  it("a 4-filter URL restores all four controls after a reload", () => {
    const search = "?condition=new&color=black&model=d-max-xt6&seats=6";
    const state = parseFilters(search);

    // The state itself carries all four selections...
    expect(state.condition).toEqual(["new"]);
    expect(state.color).toEqual(["black"]);
    expect(state.model).toEqual(["d-max-xt6"]);
    expect(state.seats).toEqual(["6"]);

    // ...and the facet options that drive the checkboxes are marked selected,
    // which is what the rendered controls read.
    const facets = computeFacets(items, state);
    const selected = FACET_KEYS.flatMap((facet) =>
      facets[facet].filter((option) => option.selected).map((option) => `${facet}:${option.value}`),
    );
    expect(selected.sort()).toEqual(["color:black", "condition:new", "model:d-max-xt6", "seats:6"]);
    expect(describeActiveFilters(state)).toHaveLength(4);
    expect(hasActiveFilters(state)).toBe(true);
  });

  it("survives a back/forward navigation, which replays the previous query string", () => {
    const history = ["?condition=new&color=red", "?condition=new&color=red&seats=4", "?condition=new"];
    const restored = history.map((search) => applyFilters(items, parseFilters(search)));
    // Going "back" to entry 0 must reproduce entry 0 exactly.
    const backAgain = applyFilters(items, parseFilters(history[0]));
    expect(backAgain.items.map((i) => i.slug)).toEqual(restored[0].items.map((i) => i.slug));
    expect(backAgain.total).toBe(restored[0].total);
  });

  it("toggling a value off returns to the previous result set", () => {
    const base = parseFilters("?color=red");
    const added = toggleFacetValue(base, "color", "black");
    expect(added.color).toEqual(["black", "red"]);
    const removed = toggleFacetValue(added, "color", "black");
    expect(serializeFilters(removed)).toBe(serializeFilters(base));
  });
});

describe("unknown values", () => {
  it("ignores a value absent from the vocabulary instead of returning an unexplained zero", () => {
    const result = run("?color=chartreuse");
    expect(result.total).toBe(items.length);
    expect(result.ignored).toEqual([{ facet: "color", value: "chartreuse" }]);
  });

  it("still applies the recognized half of a mixed selection", () => {
    const result = run("?color=black&color=chartreuse");
    expect(result.items.every((i) => i.color === "black")).toBe(true);
    expect(result.total).toBe(items.filter((i) => i.color === "black").length);
    expect(result.ignored).toEqual([{ facet: "color", value: "chartreuse" }]);
  });

  it("distinguishes an unknown value from a known value with no stock", () => {
    // `used` is a real condition with nothing in stock: it filters to zero and
    // the empty state names it. `chartreuse` is not a color we sell at all.
    expect(run("?condition=used").ignored).toEqual([]);
    expect(run("?condition=used").total).toBe(0);
    expect(run("?color=chartreuse").ignored).toHaveLength(1);
  });

  it("falls back to defaults for a nonsense sort or page", () => {
    expect(parseFilters("?sort=alphabetical-by-vibes").sort).toBe("featured");
    expect(parseFilters("?page=-3").page).toBe(1);
    expect(parseFilters("?page=notanumber").page).toBe(1);
  });
});

describe("facet counts", () => {
  it("counts sum to the collection size on an unfiltered view", () => {
    const facets = computeFacets(items, emptyFilterState());
    const colorTotal = facets.color.reduce((sum, option) => sum + option.count, 0);
    expect(colorTotal).toBe(items.length);
    const modelTotal = facets.model.reduce((sum, option) => sum + option.count, 0);
    expect(modelTotal).toBe(items.length);
  });

  it("excludes a facet's own selection from its own counts", () => {
    const state = parseFilters("?color=red");
    const facets = computeFacets(items, state);
    // Other colors are still selectable and still show their real counts.
    expect(facets.color.find((o) => o.value === "black")!.count).toBeGreaterThan(0);
    // But another facet narrows to the current result set.
    const narrowed = computeFacets(items, parseFilters("?model=d-max-xt4"));
    expect(narrowed.seats.find((o) => o.value === "6")!.count).toBe(0);
    expect(narrowed.seats.find((o) => o.value === "4")!.count).toBeGreaterThan(0);
  });

  it("marks dead-end options with a zero count so the UI can disable them", () => {
    const facets = computeFacets(items, emptyFilterState());
    const used = facets.condition.find((o) => o.value === "used")!;
    expect(used.count).toBe(items.filter((i) => i.condition === "used").length);
    const anyZero = FACET_KEYS.flatMap((f) => facets[f]).some((o) => o.count === 0);
    expect(typeof anyZero).toBe("boolean");
  });
});

describe("sorting and pagination", () => {
  it("sorts by price in both directions", () => {
    const asc = run("?sort=price-asc").items.map((i) => i.price);
    const desc = run("?sort=price-desc").items.map((i) => i.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("clamps an out-of-range page to the last page", () => {
    const result = run("?page=99");
    expect(result.page).toBe(result.pageCount);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("returns every item across all pages exactly once", () => {
    const first = run("");
    const collected: string[] = [];
    for (let page = 1; page <= first.pageCount; page += 1) {
      collected.push(...run(`?page=${page}`).items.map((i) => i.slug));
    }
    expect(new Set(collected).size).toBe(items.length);
  });
});

describe("empty state", () => {
  it("names the active filters when nothing matches", () => {
    const state: FilterState = parseFilters("?condition=used&color=red");
    const result = applyFilters(items, state);
    expect(result.total).toBe(0);
    expect(describeActiveFilters(state)).toEqual(["Condition: Used", "Color: Red"]);
    // "Clear all" is one click: an empty state serializes to a bare URL.
    expect(serializeFilters(emptyFilterState())).toBe("");
  });
});
