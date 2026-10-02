import { useEffect, useMemo, useState } from "react";
import type { StockSummary, StockTag, SortKey} from "../types/stock";
import { getMainStocks } from "../api/stockApi";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import TagFilterBar from "../components/TagFilterBar";
import StockCard from "../components/StockCard";


const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "marketCap", label: "시가총액 높은 순" },
  { value: "divYield", label: "배당 높은 순" },
  { value: "changeRate", label: "등락률 높은 순" },
  { value: "stockName", label: "이름 순" },
  { value: "stockCode", label: "종목코드 순" },
];

function MainPage() {
  // 요청 파라미터
  const [searchText, setSearchText] = useState(""); // 검색창 입력값
  const [selectedTags, setSelectedTags] = useState<StockTag[]>([]); // 선택된 태그들 (빈 배열 = 전체)
  const [sortKey, setSortKey] = useState<SortKey>("marketCap"); // 현재 정렬 기준
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (1부터 시작)

  // 응답
  const [baseDate, setBaseDate] = useState("") // 분석 기준일
  const [stocks, setStocks] = useState<StockSummary[]>([]);  // 현재 페이지 종목
  const [totalElements, setTotalElements] = useState(0); // 조건에 맞는 전체 종목 수
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [isLoading, setIsLoading] = useState(true); // 데이터 불러오는 중인지

 
  // ----- 처음 화면이 열릴 때 종목 목록 불러오기 -----
  useEffect(() => {
    let ignore = false;

    async function loadStocks() {
      const res = await getMainStocks({
        keyword: searchText,
        tags: selectedTags,
        sort: sortKey,
        page: currentPage - 1,
        size: 20
      });

      if (ignore) {
        return;
      }
      
      setBaseDate(res.baseDate);
      setStocks(res.stocks);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
      setIsLoading(false);
    }
    loadStocks();

    // 응답 중 새로운 요청이 있는 경우 마지막 요청의 응답만 화면에 반영
    return () => {
      ignore = true;
    };
  }, [searchText, selectedTags, sortKey, currentPage]);
 
  // 검색·필터·정렬 재 실행 시 1페이지로 이동
  function handleSearchTextChange(text: string) {
    setSearchText(text);
    setCurrentPage(1);
  }
 
  function handleSelectedTagsChange(tags: StockTag[]) {
    setSelectedTags(tags);
    setCurrentPage(1);
  }
 
  function handleSortKeyChange(nextSortKey: SortKey) {
    setSortKey(nextSortKey);
    setCurrentPage(1);
  }
 
  // 페이지 버튼을 누르면 페이지를 바꾸고 화면 맨 위로 올림
  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  // 필터를 처음 상태로 되돌리기 (결과가 없을 때 사용)
  function resetFilters() {
    setSearchText("");
    setSelectedTags([]);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">오늘의 종목 판단</h1>
        <p className="page-subtitle">
          종합점수와 태그로 오늘 확인할 종목을 골라보세요.
          {baseDate !== "" && <span className="base-date">기준일 {baseDate}</span>}
        </p>
      </header>
 
      <section className="toolbar">
        <SearchBar searchText={searchText} onSearchTextChange={handleSearchTextChange} />
        <TagFilterBar
          selectedTags={selectedTags}
          onSelectedTagsChange={handleSelectedTagsChange}
        />
 
        <div className="toolbar-bottom">
          <span className="result-count">
            {isLoading ? "불러오는 중" : `${totalElements}개 종목`}
          </span>
          <select
            className="sort-select"
            value={sortKey}
            onChange={(event) => handleSortKeyChange(event.target.value as SortKey)}
            aria-label="정렬 기준"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>
 
      <section className="stock-list">
        {stocks.map((stock) => (
          <StockCard key={stock.stockCode} stock={stock} />
        ))}
 
        {!isLoading && totalElements === 0 && (
          <div className="empty-box">
            <p>조건에 맞는 종목이 없습니다. 검색어를 바꾸거나 태그 선택을 줄여보세요.</p>
            <button type="button" className="text-button" onClick={resetFilters}>
              검색·필터 초기화
            </button>
          </div>
        )}
      </section>
 
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default MainPage;
