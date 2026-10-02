// ===============================================
// StockTracer에서 사용하는 타입 모음
// ===============================================

// 종목에 붙는 태그 (union type)
// 새 태그가 생기면 여기와 아래 ALL_TAGS 두 곳에 추가하면 된다.

export const STOCK_TAG_LABELS = {
  FLOW_STRONG: "천군만마",
  UNDERVALUED: "진흙 속 진주",
  HIGH_DIVIDEND: "황금알 거위",
  VALUE_TRAP: "싼 게 비지떡",
  RECOMMENDED: "금상첨화",
  RISK: "살얼음판",
} as const;

export type StockTag = keyof typeof STOCK_TAG_LABELS;

export const isStockTag = (value:string): value is StockTag =>
  value in STOCK_TAG_LABELS;

// 태그 필터 버튼을 그릴 때 사용하는 전체 태그 목록 (버튼 순서 = 배열 순서)
export const ALL_TAGS: StockTag[] = [
  "FLOW_STRONG",
  "UNDERVALUED",
  "HIGH_DIVIDEND",
  "VALUE_TRAP",
  "RECOMMENDED",
  "RISK",
];

export type Market = "KOSPI" | "KOSDAQ";

// -----------------------------------------------
// 1) Main Page 목록용 데이터
//    GET /api/v1/main/stocks 응답의 한 항목에 해당
// -----------------------------------------------
export interface StockSummary {
  stockCode: string;
  stockName: string;
  market: Market;
  sector: string;
  closePrice: number; // 현재가 (원)
  changeRate: number; // 등락률 (%) 예: 1.13 → +1.13%
  flowScore: number; // 수급 점수 (0~100) - 목록에서는 정렬에만 사용
  valueScore: number; // 저평가 점수 (0~100) - 목록에서는 정렬에만 사용
  tags: StockTag[];
}

// 정렬 기준
export type SortKey = "MARKET_CAP" | "DIV_YIELD" | "CHANGE_RATE" | "STOCK_NAME" | "STOCK_CODE";

export interface MainStockQuery{
  keyword: string,
  tags: StockTag[],
  sort: SortKey,
  page: number,
  size: number
}

export interface MainPageResponse{
  baseDate: string,
  page: number,
  size: number,
  stocks: StockSummary[],
  totalElements: number,
  totalPages: number,
}

// -----------------------------------------------
// 2) Stock Detail Page 데이터
//    GET /api/v1/stocks/{stockCode} 응답에 해당
//    StockSummary의 모든 필드 + 상세 지표
// -----------------------------------------------
export interface StockDetail extends StockSummary {
  per: number;
  pbr: number;
  eps: number; // 주당순이익 (원)
  bps: number; // 주당순자산 (원)
  dividendYield: number; // 배당수익률 (%)
  // 태그별 분석 이유. 모든 태그에 이유가 있는 건 아니므로 Partial 사용
  tagReasons: Partial<Record<StockTag, string>>;
}

// -----------------------------------------------
// 3) 그래프용 데이터
// -----------------------------------------------

// 종가 한 건 (GET /api/v1/stocks/{stockCode}/prices 배열의 한 항목)
export interface PriceHistory {
  date: string; // "2026-09-01"
  close: number; // 종가 (원)
}

// 투자자별 순매수 한 건 (GET /api/v1/stocks/{stockCode}/flow 배열의 한 항목)
// 양수 = 순매수, 음수 = 순매도 (단위: 원)
export interface FlowHistory {
  date: string;
  institution: number; // 기관
  foreign: number; // 외국인
  individual: number; // 개인
}

// -----------------------------------------------
// 4) Mock 데이터 전용 타입
//    Mock 파일 하나에 모든 정보를 모아두기 위한 타입.
//    실제 API에서는 위의 1)~3)이 각각 다른 엔드포인트로 나뉘어 온다.
// -----------------------------------------------
export interface Stock extends StockDetail {
  priceHistory: PriceHistory[];
  flowHistory: FlowHistory[];
}

// 매수 관심 신호
export type BuySignal = "관심" | "관찰" | "중립";
