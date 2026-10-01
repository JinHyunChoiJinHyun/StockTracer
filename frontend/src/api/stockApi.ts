// ===============================================
// 데이터를 가져오는 함수 모음
// ===============================================
// 화면(페이지)은 mock 데이터를 직접 import 하지 않고
// 항상 이 파일의 함수만 호출한다.
//
// 그래서 나중에 백엔드가 준비되면 이 파일의 함수 "안쪽"만
// fetch 로 바꾸면 되고, 페이지 코드는 거의 수정할 필요가 없다.
//
// 지금은 Mock 데이터를 Promise로 감싸서 돌려준다.
// (실제 API처럼 async 함수로 만들어 두면 나중에 교체하기 쉽다)
// ===============================================

import { mockStocks } from "../mock/stocks";
import type {
  MainStockQuery,
  StockDetail,
  PriceHistory,
  FlowHistory,
  MainPageResponse,
} from "../types/stock";

const API_BASE_URL = "http://localhost:8080";

// -----------------------------------------------
// Main Page 종목 목록
// 나중에: GET /api/v1/main/stocks
// -----------------------------------------------
export async function getMainStocks(
  query: MainStockQuery
): Promise<MainPageResponse> {
  const params = new URLSearchParams();
  // params.append("keyword", query.keyword);
  for (const tag of query.tags) {
    params.append("tags", tag);
  }
  params.append("sort", query.sort);
  params.append("page", String(query.page));
  params.append("size", String(query.size));
  
  const response = await fetch(`${API_BASE_URL}/api/v1/main/stocks?${params.toString()}`);
  const data: MainPageResponse = await response.json();
  return data;

  // return mockStocks;
}

// -----------------------------------------------
// 종목 상세 정보
// 나중에: GET /api/v1/stocks/{stockCode}
// 종목이 없으면 null 을 돌려준다.
// -----------------------------------------------
export async function getStockDetail(
  stockCode: string
): Promise<StockDetail | null> {
  // [실제 API로 바꿀 때]
  // const response = await fetch(`${API_BASE_URL}/api/v1/stocks/${stockCode}`);
  // if (response.status === 404) return null;
  // const data: StockDetail = await response.json();
  // return data;

  const foundStock = mockStocks.find((stock) => stock.stockCode === stockCode);
  if (foundStock === undefined) {
    return null;
  }
  return foundStock;
}

// -----------------------------------------------
// 종가 이력 (라인 그래프용)
// 나중에: GET /api/v1/stocks/{stockCode}/prices
// -----------------------------------------------
export async function getPriceHistory(
  stockCode: string
): Promise<PriceHistory[]> {
  // [실제 API로 바꿀 때]
  // const response = await fetch(`${API_BASE_URL}/api/v1/stocks/${stockCode}/prices`);
  // const data: PriceHistory[] = await response.json();
  // return data;

  const foundStock = mockStocks.find((stock) => stock.stockCode === stockCode);
  if (foundStock === undefined) {
    return [];
  }
  return foundStock.priceHistory;
}

// -----------------------------------------------
// 투자자별 수급 이력 (라인 그래프용)
// 나중에: GET /api/v1/stocks/{stockCode}/flow
// -----------------------------------------------
export async function getFlowHistory(
  stockCode: string
): Promise<FlowHistory[]> {
  // [실제 API로 바꿀 때]
  // const response = await fetch(`${API_BASE_URL}/api/v1/stocks/${stockCode}/flow`);
  // const data: FlowHistory[] = await response.json();
  // return data;

  const foundStock = mockStocks.find((stock) => stock.stockCode === stockCode);
  if (foundStock === undefined) {
    return [];
  }
  return foundStock.flowHistory;
}
