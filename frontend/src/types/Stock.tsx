/**
 * 화면 전체에서 사용하는 타입을 모아둔 파일입니다.
 * mock 데이터와 실제 API 데이터가 "똑같은 Stock 타입"을 쓰도록 하는 것이 목적입니다.
 */

/** 종목 등급. 백엔드에서 문자열로 내려온다고 가정합니다. */
export type StockGrade = 'BUY_INTEREST' | 'INTEREST' | 'NEUTRAL' | 'CAUTION';

/** 등급을 사람이 읽는 한국어로 바꿀 때 사용합니다. */
export const GRADE_LABEL: Record<StockGrade, string> = {
  BUY_INTEREST: '매수 관심',
  INTEREST: '관심',
  NEUTRAL: '중립',
  CAUTION: '주의',
};

/**
 * 화면에서 사용하는 종목 한 건의 데이터입니다.
 * 백엔드 JSON은 snake_case 이므로, api/stockApi.ts 에서 camelCase 로 변환한 뒤 이 타입으로 사용합니다.
 */
export interface Stock {
  stockCode: string;
  stockName: string;
  sector: string | null;
  baseDate: string;

  /** 종가(원) */
  closePrice: number | null;
  /** 등락률(%) 예: 2.14 */
  priceChange: number | null;

  /** 종합점수 0~100 */
  totalScore: number;
  /** 수급점수 0~100 */
  supplyScore: number;
  /** 저평가점수 0~100 */
  valueScore: number | null;

  per: number | null;
  pbr: number | null;
  /** 배당수익률(%) 예: 2.8 */
  divYield: number | null;
  /** EPS 성장률(%) 예: 18.5 */
  epsGrowthRate: number | null;

  grade: StockGrade;

  /** 현재는 프론트에서 만든 임시 태그입니다. (mock/mockTags.ts 참고) */
  tags: string[];
}

/* ------------------------------------------------------------------ */
/* 필터 / 정렬                                                          */
/* ------------------------------------------------------------------ */

export type FilterId = 'ALL' | 'UNDERVALUED' | 'LOW_PER' | 'LOW_PBR' | 'HIGH_DIVIDEND';

export const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'UNDERVALUED', label: '저평가' },
  { id: 'LOW_PER', label: '저PER' },
  { id: 'LOW_PBR', label: '저PBR' },
  { id: 'HIGH_DIVIDEND', label: '고배당' },
];

/** 정렬 값은 그대로 API 쿼리 파라미터(sort=...)로 전달됩니다. */
export type SortId = 'totalScoreDesc' | 'supplyScoreDesc' | 'valueScoreDesc' | 'priceChangeDesc';

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: 'totalScoreDesc', label: '종합점수 높은순' },
  { id: 'supplyScoreDesc', label: '수급 좋은순' },
  { id: 'valueScoreDesc', label: '저평가 높은순' },
  { id: 'priceChangeDesc', label: '등락률 높은순' },
];

/* ------------------------------------------------------------------ */
/* 목록 요청 / 응답                                                     */
/* ------------------------------------------------------------------ */

/** 목록을 불러올 때 넘기는 조건입니다. mock이든 API든 동일하게 사용합니다. */
export interface StockListRequest {
  page: number;
  size: number;
  sort: SortId;
  keyword: string;
  filter: FilterId;
}

/** 목록 조회 결과입니다. 화면은 항상 이 모양만 신경 쓰면 됩니다. */
export interface StockListResult {
  stocks: Stock[];
  page: number;
  totalPages: number;
  totalCount: number;
}

/* ------------------------------------------------------------------ */
/* 백엔드 원본 응답(snake_case) 타입                                     */
/* ------------------------------------------------------------------ */

/**
 * 실제 백엔드가 내려주는 JSON 그대로의 모양입니다.
 * 이 타입은 api/stockApi.ts 안에서만 사용하고, 화면 컴포넌트에서는 절대 쓰지 않습니다.
 * (백엔드 필드명이 바뀌면 이 타입과 변환 함수만 고치면 됩니다.)
 */
export interface StockApiItem {
  stock_code: string;
  stock_name: string;
  sector: string | null;
  base_date: string;

  close_price: number | null;
  price_change: number | null;

  total_score: number;
  supply_score: number;
  value_score: number | null;

  per: number | null;
  pbr: number | null;
  div_yield: number | null;
  eps_growth_rate: number | null;

  grade: StockGrade;
}

/** 페이지 응답 모양 (Spring Page 형태를 가정) */
export interface StockListApiResponse {
  content: StockApiItem[];
  page: number;
  size: number;
  total_pages: number;
  total_elements: number;
}