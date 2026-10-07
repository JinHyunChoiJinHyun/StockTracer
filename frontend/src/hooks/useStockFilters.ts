import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_SORT, isSortKey, isStockTag, type SortKey, type StockTag } from "../types/stock";

export function useStockFilters() {
  const [params, setParams] = useSearchParams();

  const query = params.get("q") ?? "";
  const tagParams = params.getAll("tag");
  const selectedTags = useMemo<StockTag[]>(
    () => [...new Set(tagParams.filter(isStockTag))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tagParams.join("|")],
  );
  const sortParam = params.get("sort") ?? "";
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : DEFAULT_SORT;

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setQuery = useCallback(
    (value: string) => update((p) => (value ? p.set("q", value) : p.delete("q"))),
    [update],
  );

  const setSelectedTags = useCallback(
    (tags: StockTag[]) =>
      update((p) => {
        p.delete("tag");
        tags.forEach((t) => p.append("tag", t));
      }),
    [update],
  );

  const toggleTag = useCallback(
    (tag: StockTag) =>
      setSelectedTags(
        selectedTags.includes(tag)
          ? selectedTags.filter((t) => t !== tag)
          : [...selectedTags, tag],
      ),
    [selectedTags, setSelectedTags],
  );

  const clearTags = useCallback(() => setSelectedTags([]), [setSelectedTags]);

  const setSortKey = useCallback(
    (key: SortKey) => update((p) => (key === DEFAULT_SORT ? p.delete("sort") : p.set("sort", key))),
    [update],
  );

  const resetFilters = useCallback(
    () =>
      update((p) => {
        p.delete("q");
        p.delete("tag");
      }),
    [update],
  );

  return {
    query,
    selectedTags,
    sortKey,
    setQuery,
    toggleTag,
    clearTags,
    setSortKey,
    resetFilters,
  };
}
