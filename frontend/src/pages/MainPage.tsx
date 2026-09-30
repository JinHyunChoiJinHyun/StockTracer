import { useMemo } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import TagFilterBar from "../components/TagFilterBar";
import StockCard from "../components/StockCard";
import { useMainStocks } from "../hooks/useStocks";
import { useStockFilters } from "../hooks/useStockFilters";
import { SORT_OPTIONS, isSortKey, type Stock } from "../types/stock";
import { getVisibleStocks } from "../utils/stock";

const EMPTY: Stock[] = [];

export default function MainPage() {
  const { state, reload } = useMainStocks();
  const {
    query,
    selectedTags,
    sortKey,
    setQuery,
    toggleTag,
    clearTags,
    setSortKey,
    resetFilters,
  } = useStockFilters();

  const stocks = state.status === "success" ? state.data.stocks : EMPTY;
  const baseDate = state.status === "success" ? state.data.baseDate : null;

  // 검색 → 태그(AND) → 정렬
  const visibleStocks = useMemo(
    () => getVisibleStocks(stocks, query, selectedTags, sortKey),
    [stocks, query, selectedTags, sortKey],
  );

  const isFiltered = query.trim() !== "" || selectedTags.length > 0;

  return (
    <>
      <Header baseDate={baseDate} />

      <main className="container main">
        <SearchBar value={query} onChange={setQuery} />
        <TagFilterBar selectedTags={selectedTags} onToggle={toggleTag} onClear={clearTags} />

        <div className="toolbar">
          <p className="toolbar__count" aria-live="polite">
            {state.status === "success" && (
              <>
                <strong>{visibleStocks.length}</strong>개 종목
                {selectedTags.length > 1 && (
                  <span className="toolbar__hint"> · 선택한 태그를 모두 가진 종목</span>
                )}
              </>
            )}
          </p>
          <select
            className="sort-select"
            aria-label="정렬 기준"
            value={sortKey}
            onChange={(e) => isSortKey(e.target.value) && setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {state.status === "loading" && (
          <div className="stock-list" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="card card--skeleton" />
            ))}
          </div>
        )}

        {state.status === "error" && (
          <div className="state-box">
            <p className="state-box__title">종목 목록을 불러오지 못했습니다</p>
            <p className="state-box__desc">{state.error.message}</p>
            <button type="button" className="outline-button" onClick={reload}>
              다시 불러오기
            </button>
          </div>
        )}

        {state.status === "success" && visibleStocks.length === 0 && (
          <div className="state-box">
            <p className="state-box__title">조건에 맞는 종목이 없습니다</p>
            <p className="state-box__desc">
              {isFiltered
                ? "검색어를 바꾸거나 선택한 태그를 줄여 보세요."
                : "오늘 분석된 종목이 아직 없습니다."}
            </p>
            {isFiltered && (
              <button type="button" className="outline-button" onClick={resetFilters}>
                필터 초기화
              </button>
            )}
          </div>
        )}

        {state.status === "success" && visibleStocks.length > 0 && (
          <div className="stock-list">
            {visibleStocks.map((stock) => (
              <StockCard key={stock.stockCode} stock={stock} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
