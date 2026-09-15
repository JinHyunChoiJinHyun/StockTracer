/**
 * 메인 페이지에서 쓰는 "종목 목록 상태"를 한곳에 모아둔 훅입니다.
 *
 * 화면 컴포넌트는 데이터를 어떻게 가져오는지 몰라도 되고,
 * 여기서 돌려주는 값과 handle 함수들만 사용하면 됩니다.
 */

import { useEffect, useState } from 'react';
import { fetchMainStocks } from '../api/stockApi';
import type { FilterId, SortId, Stock } from '../types/Stock';

/** 한 페이지에 보여줄 종목 수 */
const PAGE_SIZE = 20;

export function useStockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [keyword, setKeyword] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortId>('totalScoreDesc');

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /** "다시 시도" 버튼을 눌렀을 때 아래 useEffect 를 다시 실행시키기 위한 값입니다. */
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // 요청을 보낸 뒤 조건이 바뀌면 옛날 응답이 늦게 도착할 수 있습니다.
    // 그때 화면을 덮어쓰지 않도록 이 플래그로 막습니다.
    let isLatestRequest = true;

    async function loadStocks() {
      setIsLoading(true);
      setHasError(false);

      try {
        const result = await fetchMainStocks({
          page: currentPage,
          size: PAGE_SIZE,
          sort: selectedSort,
          keyword,
          filter: selectedFilter,
        });

        if (!isLatestRequest) return;

        setStocks(result.stocks);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      } catch (error) {
        if (!isLatestRequest) return;

        console.error('종목 목록을 불러오지 못했습니다.', error);
        setStocks([]);
        setTotalPages(0);
        setTotalCount(0);
        setHasError(true);
      } finally {
        if (isLatestRequest) {
          setIsLoading(false);
        }
      }
    }

    loadStocks();

    return () => {
      isLatestRequest = false;
    };
  }, [currentPage, selectedSort, keyword, selectedFilter, retryCount]);

  /** 검색어가 바뀌면 1페이지부터 다시 봅니다. */
  function handleSearch(newKeyword: string) {
    setKeyword(newKeyword);
    setCurrentPage(0);
  }

  function handleFilterChange(newFilter: FilterId) {
    setSelectedFilter(newFilter);
    setCurrentPage(0);
  }

  function handleSortChange(newSort: SortId) {
    setSelectedSort(newSort);
    setCurrentPage(0);
  }

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetry() {
    setRetryCount(retryCount + 1);
  }

  return {
    stocks,
    currentPage,
    totalPages,
    totalCount,
    keyword,
    selectedFilter,
    selectedSort,
    isLoading,
    hasError,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleRetry,
  };
}