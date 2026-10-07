// ===============================================
// 데이터를 가져오는 함수 모음
// ===============================================

import { mockStocks } from "../mock/stocks";
import type {
  MainStockQuery,
  StockDetail,
  PriceHistory,
  FlowHistory,
  MainPageResponse,
} from "../types/stock";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"; // vite-env에서 설정

// -----------------------------------------------
// Main Page 종목 목록
// -----------------------------------------------
export async function getMainStocks(
  query: MainStockQuery
): Promise<MainPageResponse> {
  const params = new URLSearchParams();
  params.append("keyword", query.keyword);
  for (const tag of query.tags) {
    params.append("tags", tag);
  }
  params.append("sort", query.sort);
  params.append("page", String(query.page));
  params.append("size", String(query.size));
  
  const response = await fetch(`${API_BASE_URL}/api/v1/main/stocks?${params.toString()}`);

  // 서버 응답 실패 시 에러 반환
  if (!response.ok){
    throw new Error(`API 요청 실패: ${response.status}`)
  }
  
  const data: MainPageResponse = await response.json();
  return data;
}

// -----------------------------------------------
// 종목 상세 정보
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
