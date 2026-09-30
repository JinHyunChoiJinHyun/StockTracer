/** 태그 목록 — 배열 하나로 관리하고 타입은 여기서 파생 (필터 칩 순서도 이 순서) */
export const STOCK_TAG_LABELS = {
  FLOW_STRONG: "큰손 매수",
  UNDERVALUED: "진흙 속 진주",
  HIGH_DIVIDEND: "황금알 거위",
  VALUE_TRAP: "싼 게 비지떡",
  RECOMMENDED: "권장",
  RISK: "위험",
}
export const STOCK_TAGS = [
  "저평가",
  "저PER",
  "저PBR",
  "고배당",
  "쌍끌이",
  "클린 매수",
  "가치 함정",
] as const;
export type StockTag = (typeof STOCK_TAGS)[number];

export const isStockTag = (value: string): value is StockTag =>
  (STOCK_TAGS as readonly string[]).includes(value);

export type Market = "KOSPI" | "KOSDAQ";

export interface Stock {
  stockCode: string;
  stockName: string;
  market: Market;
  sector: string;
  closePrice: number;
  /** 전일 대비 등락률(%) — 예: -1.25 */
  changeRate: number;
  /** 배당수익률(%) — 무배당이면 0 */
  divYield: number;
  flowScore: number;
  valueScore: number;
  tags: StockTag[];
}

/** GET /api/v1/main/stocks 응답 */
export interface MainStocksResponse {
  /** 분석 기준일 (YYYY-MM-DD) */
  baseDate: string;
  stocks: Stock[];
}

/** 태그가 붙은 근거 */
export interface TagReason {
  tag: StockTag;
  reason: string;
}

/** GET /api/v1/stocks/{stockCode} 응답 */
export interface StockDetail extends Stock {
  baseDate: string;
  tagReasons: TagReason[];
}

export const SORT_OPTIONS = [
  { value: "totalScore", label: "종합점수 높은 순" },
  { value: "flowScore", label: "수급점수 높은 순" },
  { value: "valueScore", label: "저평가점수 높은 순" },
  { value: "changeRate", label: "등락률 높은 순" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortKey = "totalScore";

export const isSortKey = (value: string): value is SortKey =>
  SORT_OPTIONS.some((o) => o.value === value);

export type Judgment = "매수 관심" | "관심" | "중립" | "주의";
