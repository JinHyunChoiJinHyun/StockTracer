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
 * 등급별 색상입니다. 메인 카드와 상세 화면이 같은 색을 쓰도록 여기에 모아뒀습니다.
 * 색만으로 뜻을 전달하지 않도록 글자(GRADE_LABEL)도 항상 함께 보여줍니다.
 */
export const GRADE_STYLE: Record<StockGrade, { badge: string; bar: string; score: string }> = {
  BUY_INTEREST: { badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', score: 'text-red-600' },
  INTEREST: { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', score: 'text-amber-600' },
  NEUTRAL: { badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-400', score: 'text-slate-600' },
  CAUTION: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', score: 'text-blue-600' },
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

  /** 싸 보이지만 실적·수급이 따라오지 않는 상태(가치 함정)인지 여부 */
  isValueTrap: boolean;

  /** 현재는 프론트에서 만든 임시 태그입니다. (mock/mockTags.ts 참고) */
  tags: string[];
}

/** 주가 차트용 하루치 데이터 */
export interface PricePoint {
  date: string;
  closePrice: number;
}

/** 수급 차트용 하루치 데이터 (단위: 억원, 음수면 순매도) */
export interface InvestorFlowPoint {
  date: string;
  foreignNetBuy: number;
  institutionNetBuy: number;
}

/** 같은 섹터 종목들의 평균값. 내 종목이 비싼지 싼지 비교할 때 씁니다. */
export interface SectorAverage {
  per: number | null;
  pbr: number | null;
  divYield: number | null;
}

/**
 * 상세 화면에서만 추가로 필요한 데이터입니다.
 * 목록 API는 가벼워야 하므로 이 값들은 상세 API(GET /api/v1/stocks/{stockCode})로 따로 받아옵니다.
 */
export interface StockDetail extends Stock {
  /** 주당순이익(원) */
  eps: number | null;
  /** 주당순자산(원) */
  bps: number | null;
  /** 시가총액(원) */
  marketCap: number | null;

  /** 같은 섹터 안에서 저평가 점수 상위 몇 %인지. 숫자가 작을수록 좋습니다. */
  sectorPercentile: number | null;

  /** 최근 5일 외국인 순매수(억원). 음수면 순매도입니다. */
  foreignNetBuyAmount: number | null;
  /** 최근 5일 기관 순매수(억원). 음수면 순매도입니다. */
  institutionNetBuyAmount: number | null;
  /** 외국인이 연속으로 순매수한 날짜 수 */
  foreignNetBuyDays: number;

  /** 가치 함정으로 본 이유. isValueTrap 이 false 면 빈 배열입니다. */
  valueTrapReasons: string[];

  /** 최근 20 영업일 종가 (오래된 날짜가 앞) */
  priceHistory: PricePoint[];
  /** 최근 20 영업일 외국인·기관 순매수 */
  investorFlowHistory: InvestorFlowPoint[];
  /** 같은 섹터 평균 지표 */
  sectorAverage: SectorAverage;
}

/* ------------------------------------------------------------------ */
/* 필터 / 정렬                                                          */
/* ------------------------------------------------------------------ */

export type FilterId = 'ALL' | 'UNDERVALUED' | 'LOW_PER' | 'LOW_PBR' | 'HIGH_DIVIDEND' | 'VALUE_TRAP';

export const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'UNDERVALUED', label: '저평가' },
  { id: 'LOW_PER', label: '저PER' },
  { id: 'LOW_PBR', label: '저PBR' },
  { id: 'HIGH_DIVIDEND', label: '고배당' },
  { id: 'VALUE_TRAP', label: '가치 함정' },
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
  is_value_trap: boolean;
}

/** 상세 API 응답 원본입니다. 목록 항목에 상세 전용 필드가 더 붙은 모양입니다. */
export interface StockDetailApiItem extends StockApiItem {
  eps: number | null;
  bps: number | null;
  market_cap: number | null;
  sector_percentile: number | null;
  foreign_net_buy_amount: number | null;
  institution_net_buy_amount: number | null;
  foreign_net_buy_days: number;
  value_trap_reasons: string[];
  price_history: { date: string; close_price: number }[];
  investor_flow_history: {
    date: string;
    foreign_net_buy: number;
    institution_net_buy: number;
  }[];
  sector_average: { per: number | null; pbr: number | null; div_yield: number | null };
}

/** 페이지 응답 모양 (Spring Page 형태를 가정) */
export interface StockListApiResponse {
  content: StockApiItem[];
  page: number;
  size: number;
  total_pages: number;
  total_elements: number;
}