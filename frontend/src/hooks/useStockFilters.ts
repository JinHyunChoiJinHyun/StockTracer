import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_SORT, isSortKey, isStockTag, type SortKey, type StockTag } from "../types/stock";

/**
 * 검색어 / 선택 태그(배열) / 정렬 상태.
 *
 * useState 대신 URL 쿼리(?q=&tag=&tag=&sort=)에 저장한다.
 * → 상세 페이지에서 뒤로 가기·새로고침해도 필터가 그대로 복원된다.
 * → 파라미터가 없으면 초기 상태(전체 / 검색어 없음 / 종합점수 순).
 * replace: true 로 갱신해서 입력할 때마다 히스토리가 쌓이지 않게 한다.
 */
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
