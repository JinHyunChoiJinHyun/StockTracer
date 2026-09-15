/**
 * ⚠️ 임시(mock) 목록 조회 함수입니다.
 *
 * 실제 API에서는 검색/필터/정렬/페이지를 백엔드가 처리하지만,
 * 지금은 백엔드가 없으므로 여기서 메모리 배열을 직접 걸러내고 잘라서 돌려줍니다.
 * 반환하는 모양(StockListResult)은 실제 API와 완전히 같기 때문에 화면 코드는 바뀌지 않습니다.
 */

import type { FilterId, SortId, Stock, StockListRequest, StockListResult } from '../types/Stock';
import { MOCK_STOCKS } from './MockStocks';

/** 에러 화면을 테스트하고 싶을 때 true 로 바꾸세요. */
const SIMULATE_ERROR = false;

/** 실제 네트워크처럼 보이도록 잠깐 기다립니다. (로딩 화면 확인용) */
const MOCK_DELAY_MS = 400;

/**
 * 필터 버튼과 임시 태그를 연결한 표입니다.
 * 태그가 mock이므로 이 표도 임시입니다. 실제 API에서는 filter 값을 서버로 보내면 됩니다.
 */
const FILTER_TO_TAG: Record<FilterId, string | null> = {
  ALL: null,
  UNDERVALUED: '저평가',
  LOW_PER: '저PER',
  LOW_PBR: '저PBR',
  HIGH_DIVIDEND: '배당 매력',
};

/** 정렬에 사용할 값을 꺼냅니다. 값이 없으면 맨 뒤로 보내기 위해 아주 작은 수를 씁니다. */
function getSortValue(stock: Stock, sort: SortId): number {
  if (sort === 'totalScoreDesc') return stock.totalScore;
  if (sort === 'supplyScoreDesc') return stock.supplyScore;
  if (sort === 'valueScoreDesc') return stock.valueScore ?? -Infinity;
  return stock.priceChange ?? -Infinity;
}

export async function fetchMainStocksFromMock(request: StockListRequest): Promise<StockListResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (SIMULATE_ERROR) {
    throw new Error('mock 에러 테스트');
  }

  // 1. 검색 (종목명 또는 종목코드)
  let filteredStocks = MOCK_STOCKS;
  const keyword = request.keyword.trim();
  if (keyword !== '') {
    filteredStocks = filteredStocks.filter(
      (stock) => stock.stockName.includes(keyword) || stock.stockCode.includes(keyword),
    );
  }

  // 2. 필터 (임시 태그 기준)
  const filterTag = FILTER_TO_TAG[request.filter];
  if (filterTag !== null) {
    filteredStocks = filteredStocks.filter((stock) => stock.tags.includes(filterTag));
  }

  // 3. 정렬 (전부 내림차순)
  const sortedStocks = [...filteredStocks].sort(
    (a, b) => getSortValue(b, request.sort) - getSortValue(a, request.sort),
  );

  // 4. 페이지 자르기
  const totalCount = sortedStocks.length;
  const totalPages = Math.ceil(totalCount / request.size);
  const startIndex = request.page * request.size;
  const pageStocks = sortedStocks.slice(startIndex, startIndex + request.size);

  return {
    stocks: pageStocks,
    page: request.page,
    totalPages,
    totalCount,
  };
}