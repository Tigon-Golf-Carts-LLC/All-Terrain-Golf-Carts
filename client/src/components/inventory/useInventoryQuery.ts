/**
 * The URL is the state.
 *
 * This hook reads the query string, derives the filter state from it, and gives
 * callers a single `update` function that writes a new query string back to
 * history. There is no `useState` mirror of the filters anywhere: a component
 * that wants to change a filter changes the URL, the URL change re-renders, and
 * the new view is derived from the URL again.
 *
 * That is what makes reload, deep links and browser back/forward all behave.
 * `popstate` needs no special handling because wouter's `useSearch` is
 * subscribed to it, and there is no local state to fall out of step.
 */

import { useCallback, useMemo } from "react";
import { useLocation, useSearch } from "wouter";

import {
  applyFilters,
  computeFacets,
  parseFilters,
  serializeFilters,
  toggleFacetValue,
  type FacetKey,
  type FilterState,
  type InventoryItem,
  type SortKey,
} from "@/lib/inventory";

export interface InventoryQuery {
  /** Filter state derived from the URL, with any preset merged in. */
  state: FilterState;
  result: ReturnType<typeof applyFilters>;
  facets: ReturnType<typeof computeFacets>;
  /** Toggle one facet value and push the resulting URL. */
  toggle: (facet: FacetKey, value: string) => void;
  setSort: (sort: SortKey) => void;
  setPage: (page: number) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  /** Reset to the page's baseline (the preset, or an empty listing). */
  clearAll: () => void;
  /** Canonical query string for the current state, for building links. */
  search: string;
}

export function useInventoryQuery(
  items: readonly InventoryItem[],
  /** Merges a preset's baseline filters with what the URL carries. */
  derive: (fromUrl: FilterState) => FilterState = (fromUrl) => fromUrl,
): InventoryQuery {
  const search = useSearch();
  const [pathname, navigate] = useLocation();

  const state = useMemo(() => derive(parseFilters(search)), [search, derive]);
  const result = useMemo(() => applyFilters(items, state), [items, state]);
  const facets = useMemo(() => computeFacets(items, state), [items, state]);

  const push = useCallback(
    (next: FilterState) => {
      const qs = serializeFilters(next);
      // `replace: false` keeps every filter change in history, so Back undoes
      // exactly one selection rather than leaving the listing entirely.
      navigate(`${pathname}${qs}`, { replace: false });
    },
    [navigate, pathname],
  );

  const toggle = useCallback(
    (facet: FacetKey, value: string) => push(toggleFacetValue(state, facet, value)),
    [push, state],
  );

  const setSort = useCallback((sort: SortKey) => push({ ...state, sort, page: 1 }), [push, state]);

  const setPage = useCallback((page: number) => push({ ...state, page }), [push, state]);

  const setPriceRange = useCallback(
    (minPrice: number | null, maxPrice: number | null) => push({ ...state, minPrice, maxPrice, page: 1 }),
    [push, state],
  );

  const clearAll = useCallback(() => {
    navigate(pathname, { replace: false });
  }, [navigate, pathname]);

  return {
    state,
    result,
    facets,
    toggle,
    setSort,
    setPage,
    setPriceRange,
    clearAll,
    search: serializeFilters(state),
  };
}
