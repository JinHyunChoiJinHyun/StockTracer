import { useEffect, useMemo, useState } from "react";

/* 타입 지정 */
export type TagType = "POSITIVE" | "CAUTION" | "NEUTRAL";

export type Market = "KOSPI" | "KOSDAQ";

export interface StockTag {
  code: string;
  label: string;
  type: TagType;
}

export interface MainStock {
  stockCode: string;
  stockName: string;
  market: Market;
  sector: string;
  baseDate: string; // YYYY-MM-DD

  closePrice: number;
  priceChange: number;
  changeRate: number;

  /** 0~100. 화면에는 막대로만 표현하고 숫자는 노출하지 않습니다. */
  valueScore: number;

  /** null = 판단 보류. false 로 치환하면 안 됩니다. */
  valueTrapFlag: boolean | null;

  divYield: number;
  firstDetectedDate: string;
  tags: StockTag[];

  /** 최근 20거래일 종가. 목록 응답이 무거우면 별도 엔드포인트로 분리하세요. */
  priceTrend: number[];
}

export interface StockDetail extends MainStock {
  marketCap: number;
  tradingValue: number;
  tradingValueRatio: number;

  supplyScore: number;
  reason: string;

  roe: number;
  epsGrowthRate: number;

  valueTrapReason: string | null;
}

export interface MainSummary {
  total: number;
  freshCount: number;
  trapCount: number;
  unknownCount: number;
}

export interface MainStockPage {
  baseDate: string;
  collectedAt: string;
  page: number;
  size: number;
  totalElements: number;
  summary: MainSummary;
  content: MainStock[];
}

export const MARKET_LABEL: Record<Market, string> = {
  KOSPI: "코스피",
  KOSDAQ: "코스닥",
};

/* ==================================================================
 * 목 데이터 — 연동 후 이 구역만 삭제
 * ================================================================== */

export const BASE_DATE = "2026-09-11";
export const BASE_DATE_KO = "9월 11일";
export const COLLECTED_AT = "2026-09-11 18:12";

/** 결정론적 난수로 20일 종가 흐름을 만듭니다. */
function makeTrend(seed: number, last: number, vol: number): number[] {
  const out: number[] = [];
  let x = seed;
  let v = last;
  for (let i = 0; i < 20; i += 1) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const r = (x / 2147483648 - 0.5) * vol;
    out.unshift(Math.round(v));
    v = v / (1 + r);
  }
  return out;
}

type RawDetail = Omit<StockDetail, "baseDate" | "priceTrend">;

const RAW: RawDetail[] = [
  {
    stockCode: "005380", stockName: "현대차", market: "KOSPI", sector: "자동차",
    closePrice: 248500, priceChange: 4500, changeRate: 1.84,
    marketCap: 52_100_000_000_000, tradingValue: 312_000_000_000, tradingValueRatio: 1.8,
    valueScore: 88, supplyScore: 74,
    reason: "외국인이 5거래일 연속 순매수하며 기관 매도 물량을 흡수했습니다.",
    divYield: 5.12, roe: 12.4, epsGrowthRate: 18.2,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-06-24",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
      { code: "FOREIGN_BUY", label: "외국인이 사는 중", type: "POSITIVE" },
      { code: "BUYBACK", label: "자사주 소각", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "005830", stockName: "DB손해보험", market: "KOSPI", sector: "보험",
    closePrice: 122300, priceChange: 2100, changeRate: 1.75,
    marketCap: 8_700_000_000_000, tradingValue: 64_000_000_000, tradingValueRatio: 1.6,
    valueScore: 87, supplyScore: 70,
    reason: "외국인과 기관이 동시에 순매수한 날이 최근 10거래일 중 6일입니다.",
    divYield: 5.86, roe: 15.2, epsGrowthRate: 13.6,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-09-09",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "EPS_GROWTH_3Y", label: "3년째 이익 증가", type: "POSITIVE" },
      { code: "SECTOR_CHEAP", label: "같은 업종보다 쌈", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "105560", stockName: "KB금융", market: "KOSPI", sector: "금융",
    closePrice: 92400, priceChange: 1200, changeRate: 1.32,
    marketCap: 35_800_000_000_000, tradingValue: 241_000_000_000, tradingValueRatio: 1.4,
    valueScore: 85, supplyScore: 68,
    reason: "기관이 3거래일 연속 순매수했고 개인 물량이 꾸준히 나오고 있습니다.",
    divYield: 4.68, roe: 10.1, epsGrowthRate: 9.4,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-04-02",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "DIV_STABLE", label: "배당 꾸준함", type: "POSITIVE" },
      { code: "INST_BUY", label: "기관이 사는 중", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "000270", stockName: "기아", market: "KOSPI", sector: "자동차",
    closePrice: 103900, priceChange: -900, changeRate: -0.86,
    marketCap: 41_300_000_000_000, tradingValue: 198_000_000_000, tradingValueRatio: 0.9,
    valueScore: 83, supplyScore: 52,
    reason: "기관 순매도가 이어졌지만 외국인 순매수가 절반가량을 상쇄했습니다.",
    divYield: 4.95, roe: 14.8, epsGrowthRate: 6.1,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-05-14",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "086790", stockName: "하나금융지주", market: "KOSPI", sector: "금융",
    closePrice: 78600, priceChange: 600, changeRate: 0.77,
    marketCap: 22_900_000_000_000, tradingValue: 154_000_000_000, tradingValueRatio: 1.1,
    valueScore: 81, supplyScore: 63,
    reason: "기관 순매수 강도가 최근 20거래일 평균을 웃돌고 있습니다.",
    divYield: 5.34, roe: 9.6, epsGrowthRate: 11.8,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-03-18",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "DIV_STABLE", label: "배당 꾸준함", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "111770", stockName: "영원무역", market: "KOSPI", sector: "섬유의복",
    closePrice: 41200, priceChange: 900, changeRate: 2.23,
    marketCap: 1_800_000_000_000, tradingValue: 22_000_000_000, tradingValueRatio: 2.3,
    valueScore: 80, supplyScore: 66,
    reason: "거래대금이 20일 평균의 2.3배로 늘며 기관 순매수가 유입됐습니다.",
    divYield: 3.04, roe: 9.9, epsGrowthRate: 7.5,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-09-10",
    tags: [
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
      { code: "SECTOR_CHEAP", label: "같은 업종보다 쌈", type: "POSITIVE" },
      { code: "VOL_SPIKE", label: "거래 갑자기 늘어남", type: "NEUTRAL" },
    ],
  },
  {
    stockCode: "011200", stockName: "HMM", market: "KOSPI", sector: "운송",
    closePrice: 19850, priceChange: 1150, changeRate: 6.15,
    marketCap: 20_400_000_000_000, tradingValue: 486_000_000_000, tradingValueRatio: 4.7,
    valueScore: 79, supplyScore: 81,
    reason: "개인 매수세가 거래대금을 평소의 4.7배로 끌어올렸고 기관은 순매도했습니다.",
    divYield: 2.10, roe: 6.2, epsGrowthRate: -34.5,
    valueTrapFlag: true,
    valueTrapReason:
      "운임이 좋던 시절의 실적이 반영돼 있어 지금은 싸 보이지만, 최근 1년 이익이 34.5% 줄었습니다. 주가가 싼 게 아니라 이익이 줄어드는 중일 수 있습니다.",
    firstDetectedDate: "2026-08-21",
    tags: [
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
      { code: "EPS_VOLATILE", label: "이익 들쭉날쭉", type: "CAUTION" },
      { code: "EPS_CUT", label: "이익 전망 낮아짐", type: "CAUTION" },
      { code: "VOL_SPIKE", label: "거래 갑자기 늘어남", type: "NEUTRAL" },
    ],
  },
  {
    stockCode: "036460", stockName: "한국가스공사", market: "KOSPI", sector: "유틸리티",
    closePrice: 38750, priceChange: 1450, changeRate: 3.89,
    marketCap: 3_600_000_000_000, tradingValue: 73_000_000_000, tradingValueRatio: 2.9,
    valueScore: 77, supplyScore: 72,
    reason: "외국인 순매수가 4거래일 연속 이어지며 거래대금이 크게 늘었습니다.",
    divYield: 0.0, roe: 8.3, epsGrowthRate: 22.6,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-09-08",
    tags: [
      { code: "TURNAROUND", label: "적자에서 흑자로", type: "POSITIVE" },
      { code: "NO_DIV", label: "배당 없음", type: "CAUTION" },
      { code: "VOL_SPIKE", label: "거래 갑자기 늘어남", type: "NEUTRAL" },
    ],
  },
  {
    stockCode: "011780", stockName: "금호석유", market: "KOSPI", sector: "화학",
    closePrice: 141500, priceChange: -2500, changeRate: -1.74,
    marketCap: 4_100_000_000_000, tradingValue: 41_000_000_000, tradingValueRatio: 0.8,
    valueScore: 76, supplyScore: 38,
    reason: "기관과 외국인이 함께 순매도했고 거래대금은 평균을 밑돌았습니다.",
    divYield: 3.11, roe: 5.8, epsGrowthRate: -8.9,
    valueTrapFlag: null,
    valueTrapReason:
      "같은 화학 업종 회사들의 최근 실적 자료가 충분히 모이지 않아, 업종 안에서 싼 편인지 아직 판단하지 않았습니다.",
    firstDetectedDate: "2026-07-02",
    tags: [
      { code: "SECTOR_CHEAP", label: "같은 업종보다 쌈", type: "POSITIVE" },
      { code: "EPS_DOWN", label: "이익 줄어드는 중", type: "CAUTION" },
    ],
  },
  {
    stockCode: "051600", stockName: "한전KPS", market: "KOSPI", sector: "유틸리티",
    closePrice: 44850, priceChange: 350, changeRate: 0.79,
    marketCap: 2_000_000_000_000, tradingValue: 18_000_000_000, tradingValueRatio: 1.0,
    valueScore: 74, supplyScore: 55,
    reason: "특별한 매수·매도 쏠림 없이 기관과 개인이 균형을 이뤘습니다.",
    divYield: 4.42, roe: 11.7, epsGrowthRate: 4.2,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-02-11",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "DIV_STABLE", label: "배당 꾸준함", type: "POSITIVE" },
    ],
  },
  {
    stockCode: "005490", stockName: "포스코홀딩스", market: "KOSPI", sector: "철강",
    closePrice: 296000, priceChange: -5500, changeRate: -1.82,
    marketCap: 25_000_000_000_000, tradingValue: 223_000_000_000, tradingValueRatio: 1.2,
    valueScore: 72, supplyScore: 41,
    reason: "외국인 순매도가 6거래일 연속 이어지고 있습니다.",
    divYield: 3.38, roe: 4.1, epsGrowthRate: -12.4,
    valueTrapFlag: null,
    valueTrapReason:
      "지주회사로 바뀌면서 예전 실적과 지금 실적을 그대로 비교할 수 없어, 이익이 늘고 있는지 판단하지 않았습니다.",
    firstDetectedDate: "2026-06-05",
    tags: [
      { code: "SECTOR_CHEAP", label: "같은 업종보다 쌈", type: "POSITIVE" },
      { code: "DEBT_UP", label: "빚 늘어나는 중", type: "CAUTION" },
      { code: "EPS_DOWN", label: "이익 줄어드는 중", type: "CAUTION" },
    ],
  },
  {
    stockCode: "001430", stockName: "세아베스틸지주", market: "KOSPI", sector: "철강",
    closePrice: 21300, priceChange: -150, changeRate: -0.70,
    marketCap: 764_000_000_000, tradingValue: 9_600_000_000, tradingValueRatio: 0.7,
    valueScore: 69, supplyScore: 33,
    reason: "5거래일 연속 기관 순매도가 이어졌습니다.",
    divYield: 4.70, roe: 6.4, epsGrowthRate: -3.1,
    valueTrapFlag: null,
    valueTrapReason: "철강 업종의 실적 자료 수집률이 기준에 못 미쳐 판단을 미뤘습니다.",
    firstDetectedDate: "2026-07-29",
    tags: [
      { code: "HIGH_DIV", label: "배당 많이 줌", type: "POSITIVE" },
      { code: "EPS_DOWN", label: "이익 줄어드는 중", type: "CAUTION" },
    ],
  },
  {
    stockCode: "098460", stockName: "고영", market: "KOSDAQ", sector: "기계장비",
    closePrice: 13240, priceChange: -180, changeRate: -1.34,
    marketCap: 902_000_000_000, tradingValue: 8_800_000_000, tradingValueRatio: 0.9,
    valueScore: 66, supplyScore: 44,
    reason: "거래대금이 평균을 밑돌며 매수·매도 신호가 뚜렷하지 않습니다.",
    divYield: 1.91, roe: 7.2, epsGrowthRate: 2.8,
    valueTrapFlag: null,
    valueTrapReason: "비교할 같은 업종 회사가 12곳뿐이라 판단의 신뢰도가 낮습니다.",
    firstDetectedDate: "2026-08-13",
    tags: [
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
      { code: "SMALL_SAMPLE", label: "비교 대상 적음", type: "CAUTION" },
    ],
  },
  {
    stockCode: "058470", stockName: "리노공업", market: "KOSDAQ", sector: "반도체",
    closePrice: 178300, priceChange: 3300, changeRate: 1.89,
    marketCap: 2_700_000_000_000, tradingValue: 31_000_000_000, tradingValueRatio: 1.5,
    valueScore: 63, supplyScore: 61,
    reason: "기관 순매수가 2거래일 연속 유입됐습니다.",
    divYield: 1.68, roe: 18.9, epsGrowthRate: 15.3,
    valueTrapFlag: false, valueTrapReason: null, firstDetectedDate: "2026-09-11",
    tags: [
      { code: "NET_CASH", label: "빚보다 현금 많음", type: "POSITIVE" },
      { code: "EPS_GROWTH_3Y", label: "3년째 이익 증가", type: "POSITIVE" },
      { code: "INST_BUY", label: "기관이 사는 중", type: "POSITIVE" },
    ],
  },
];

/** 상세 엔드포인트가 돌려줄 전체 데이터 */
export const MOCK_DETAILS: StockDetail[] = RAW.map((r, i) => ({
  ...r,
  baseDate: BASE_DATE,
  priceTrend: makeTrend(i * 7919 + 13, r.closePrice, 0.055),
}));

/** 목록 엔드포인트가 돌려줄 가벼운 데이터 */
export const MOCK_LIST: MainStock[] = MOCK_DETAILS.map((d) => ({
  stockCode: d.stockCode,
  stockName: d.stockName,
  market: d.market,
  sector: d.sector,
  baseDate: d.baseDate,
  closePrice: d.closePrice,
  priceChange: d.priceChange,
  changeRate: d.changeRate,
  valueScore: d.valueScore,
  valueTrapFlag: d.valueTrapFlag,
  divYield: d.divYield,
  firstDetectedDate: d.firstDetectedDate,
  tags: d.tags,
  priceTrend: d.priceTrend,
}));

/* API 연동

/** true 면 네트워크를 타지 않고 위 목 데이터를 씁니다. 백엔드 붙으면 false. */
const USE_MOCK: boolean = true;

const API_BASE = "/api/v1";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** 상태 코드별로 사용자에게 보여줄 문구를 정합니다. */
function messageForStatus(status: number): string {
  if (status === 404) return "요청한 종목을 찾을 수 없습니다.";
  if (status === 400) return "요청 조건이 올바르지 않습니다.";
  if (status >= 500) return "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
  return "데이터를 불러오지 못했습니다.";
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    // AbortError 는 취소이므로 그대로 던져서 호출부가 무시하게 둡니다.
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, "네트워크에 연결할 수 없습니다.");
  }

  if (!res.ok) throw new ApiError(res.status, messageForStatus(res.status));

  return (await res.json()) as T;
}

/** 목 모드에서 네트워크 지연을 흉내 냅니다. */
function delay<T>(value: T, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => resolve(value), ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export interface MainStockQuery {
  /** 생략하면 서버가 가장 최근 거래일을 씁니다. */
  baseDate?: string;
  market?: Market;
  sector?: string;
  page?: number;
  size?: number;
}

/** GET /api/v1/stocks/main */
export async function fetchMainStocks(
  query: MainStockQuery = {},
  signal?: AbortSignal
): Promise<MainStockPage> {
  if (USE_MOCK) {
    const mockPage: MainStockPage = {
      baseDate: BASE_DATE,
      collectedAt: COLLECTED_AT,
      page: 0,
      size: MOCK_LIST.length,
      totalElements: MOCK_LIST.length,
      summary: {
        total: MOCK_LIST.length,
        freshCount: MOCK_LIST.filter((s) => isNew(s, BASE_DATE)).length,
        trapCount: MOCK_LIST.filter((s) => s.valueTrapFlag === true).length,
        unknownCount: MOCK_LIST.filter((s) => s.valueTrapFlag === null).length,
      },
      content: MOCK_LIST,
    };
    return delay(mockPage, 400, signal);
  }

  const params = new URLSearchParams();
  if (query.baseDate) params.set("baseDate", query.baseDate);
  if (query.market) params.set("market", query.market);
  if (query.sector) params.set("sector", query.sector);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));

  const qs = params.toString();
  return request<MainStockPage>(`/stocks/main${qs ? `?${qs}` : ""}`, signal);
}

/** GET /api/v1/stocks/{stockCode} */
export async function fetchStockDetail(
  stockCode: string,
  baseDate: string,
  signal?: AbortSignal
): Promise<StockDetail> {
  if (USE_MOCK) {
    const found = MOCK_DETAILS.find((d) => d.stockCode === stockCode);
    if (!found) throw new ApiError(404, messageForStatus(404));
    return delay(found, 280, signal);
  }

  const qs = new URLSearchParams({ baseDate }).toString();
  return request<StockDetail>(`/stocks/${stockCode}?${qs}`, signal);
}

/* ---------------------------- 조회 훅 ---------------------------- */

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const isAbort = (e: unknown): boolean =>
  e instanceof DOMException && e.name === "AbortError";

const toMessage = (e: unknown): string =>
  e instanceof ApiError ? e.message : "데이터를 불러오지 못했습니다.";

/** 메인 목록. reload 로 수동 재시도할 수 있습니다. */
function useMainStocks(query: MainStockQuery = {}): AsyncState<MainStockPage> & {
  reload: () => void;
} {
  const [state, setState] = useState<AsyncState<MainStockPage>>({
    data: null,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  // 객체 리터럴을 그대로 의존성에 쓰면 매 렌더마다 재요청이 나갑니다.
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchMainStocks(JSON.parse(queryKey) as MainStockQuery, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        setState({ data: null, loading: false, error: toMessage(e) });
      });

    return () => controller.abort();
  }, [queryKey, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}

/**
 * 종목 상세. 목록에 없는 필드(거래대금, ROE, 함정 사유 등)를 따로 받아옵니다.
 * stockCode 가 바뀌면 이전 요청은 abort 되므로, 늦게 도착한 응답이 화면을 덮지 않습니다.
 */
function useStockDetail(
  stockCode: string | null,
  baseDate: string | null
): AsyncState<StockDetail> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<StockDetail>>({
    data: null,
    loading: false,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (stockCode === null || baseDate === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetchStockDetail(stockCode, baseDate, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        setState({ data: null, loading: false, error: toMessage(e) });
      });

    return () => controller.abort();
  }, [stockCode, baseDate, nonce]);

  return { ...state, retry: () => setNonce((n) => n + 1) };
}

/* ==================================================================
 * 화면
 * ================================================================== */

/* ---------------------------- 포맷터 ---------------------------- */

const nf = new Intl.NumberFormat("ko-KR");

const fmtPrice = (v: number): string => nf.format(v);

function fmtMoney(v: number): string {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(1)}조원`;
  if (v >= 100_000_000) return `${nf.format(Math.round(v / 100_000_000))}억원`;
  return `${nf.format(v)}원`;
}

const signed = (v: number, digits = 2, suffix = ""): string =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}${suffix}`;

const signedInt = (v: number): string =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${nf.format(Math.abs(v))}`;

/* 한국 시장 관례: 상승 빨강, 하락 파랑 */
type Direction = "up" | "down" | "flat";
const dir = (v: number): Direction => (v > 0 ? "up" : v < 0 ? "down" : "flat");

/** 기준일로부터 7일 이내에 목록에 들어온 종목 */
const isNew = (
  r: Pick<MainStock, "firstDetectedDate">,
  baseDate: string
): boolean =>
  (new Date(baseDate).getTime() - new Date(r.firstDetectedDate).getTime()) /
    86_400_000 <=
  7;

/** "2026-09-11" → "9월 11일" */
function formatKoreanDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

/* ---------------------------- 판정 ---------------------------- */

type VerdictTone = "good" | "caution" | "unknown" | "plain";

interface Verdict {
  text: string;
  tone: VerdictTone;
}

/** 사라/팔아라가 아니라 "지금 어떤 상태인가"를 말합니다. */
function verdictOf(r: Pick<MainStock, "valueTrapFlag" | "valueScore">): Verdict {
  if (r.valueTrapFlag === true)
    return { text: "싸 보이지만 이유를 확인하세요", tone: "caution" };
  if (r.valueTrapFlag === null)
    return { text: "아직 판단하지 않았어요", tone: "unknown" };
  if (r.valueScore >= 85) return { text: "많이 싼 편이에요", tone: "good" };
  if (r.valueScore >= 72) return { text: "싼 편이에요", tone: "good" };
  return { text: "보통 수준이에요", tone: "plain" };
}

function supplyText(score: number): string {
  if (score >= 70) return "기관·외국인이 사는 중";
  if (score >= 55) return "조금씩 사는 중";
  if (score >= 45) return "사는 쪽과 파는 쪽이 비슷";
  return "파는 쪽이 더 많음";
}

type PresetKey = "valueScore" | "divYield";

interface Preset {
  key: PresetKey;
  label: string;
}

const PRESETS: Preset[] = [
  { key: "valueScore", label: "저평가 순" },
  { key: "divYield", label: "배당 많은 순" },
];

/* ---------------------------- 조각 ---------------------------- */

interface ErrorBoxProps {
  message: string;
  onRetry: () => void;
}

function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div className="errbox" role="alert">
      <p>{message}</p>
      <button type="button" className="linkbtn" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

function Sparkline({ data, width = 64, height = 20 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const rising = data[data.length - 1] >= data[0];

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <polyline points={points} className={rising ? "s-up" : "s-down"} />
    </svg>
  );
}

function TagChip({ tag }: { tag: StockTag }) {
  return <span className={`tag t-${tag.type.toLowerCase()}`}>{tag.label}</span>;
}

function Meter({ value, tone }: { value: number; tone: VerdictTone }) {
  return (
    <div className="meter" aria-hidden="true">
      <span className={`meter-fill m-${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
  help: string;
  tone?: Direction;
}

/** 지표 한 줄: 값 + 한 문장 설명 */
function Metric({ label, value, help, tone }: MetricProps) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className={`metric-value ${tone ?? ""}`}>{value}</span>
      </div>
      <p className="metric-help">{help}</p>
    </div>
  );
}

/* ---------------------------- 상세 패널 ---------------------------- */

interface DetailPanelProps {
  stockCode: string | null;
  baseDate: string | null;
  fallbackName: string;
  onClose: () => void;
}

function DetailPanel({ stockCode, baseDate, fallbackName, onClose }: DetailPanelProps) {
  const { data: detail, loading, error, retry } = useStockDetail(stockCode, baseDate);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (stockCode === null) return null;

  const verdict = detail ? verdictOf(detail) : null;

  return (
    <div className="overlay" onClick={onClose}>
      <aside
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${detail?.stockName ?? fallbackName} 상세`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <h2 className="panel-name">{detail?.stockName ?? fallbackName}</h2>
            <p className="panel-sub">
              {detail
                ? `${detail.stockCode} · ${MARKET_LABEL[detail.market]} · ${detail.sector}`
                : stockCode}
            </p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {error !== null ? (
          <ErrorBox message={error} onRetry={retry} />
        ) : loading || !detail || !verdict ? (
          <div className="skeleton" role="status">
            <span className="sk sk-price" />
            <span className="sk sk-box" />
            <span className="sk sk-line" />
            <span className="sk sk-line" />
            <span className="sk sk-line short" />
            <span className="sr-only">불러오는 중</span>
          </div>
        ) : (
          <>
            <div className="panel-price">
              <span className="pp-num">{fmtPrice(detail.closePrice)}원</span>
              <span className={`pp-chg ${dir(detail.changeRate)}`}>
                {signedInt(detail.priceChange)}원 ({signed(detail.changeRate, 2, "%")})
              </span>
            </div>

            <div className={`verdict-box v-${verdict.tone}`}>
              <strong>{verdict.text}</strong>
              <p>
                {detail.valueTrapReason ??
                  "실적과 자산에 비해 주가가 싼 편이고, 이익이 줄어드는 신호는 발견되지 않았습니다."}
              </p>
            </div>

            <section className="panel-sec">
              <h3>왜 싸다고 봤나</h3>
              <Metric
                label="저평가 점수"
                value={`${detail.valueScore}점`}
                help="실적과 자산에 비해 주가가 싼 정도를 0~100으로 매긴 값입니다. 같은 업종 회사들과 비교해 계산합니다."
              />
              <Metric
                label="배당수익률"
                value={detail.divYield > 0 ? `${detail.divYield.toFixed(2)}%` : "배당 없음"}
                help={
                  detail.divYield > 0
                    ? `지금 100만원어치를 사면 1년에 배당으로 약 ${nf.format(
                        Math.round(detail.divYield * 10_000)
                      )}원을 받는다는 뜻입니다. 배당은 회사 사정에 따라 줄거나 없어질 수 있습니다.`
                    : "최근 결산에서 배당을 지급하지 않았습니다."
                }
              />
              <Metric
                label="ROE"
                value={`${detail.roe.toFixed(1)}%`}
                help="회사가 자기 돈 100원으로 1년에 얼마를 벌었는지 나타냅니다. 높을수록 돈을 잘 버는 회사입니다."
              />
              <Metric
                label="이익 증가율"
                value={signed(detail.epsGrowthRate, 1, "%")}
                tone={dir(detail.epsGrowthRate)}
                help="1주당 벌어들인 이익이 1년 전보다 얼마나 달라졌는지입니다. 싼데 이익까지 줄고 있다면 주의가 필요합니다."
              />
            </section>

            <section className="panel-sec">
              <h3>요즘 분위기</h3>
              <Metric
                label="매수세"
                value={supplyText(detail.supplyScore)}
                help={detail.reason}
              />
              <Metric
                label="하루 거래대금"
                value={fmtMoney(detail.tradingValue)}
                help={`최근 20일 평균의 ${detail.tradingValueRatio.toFixed(1)}배입니다. ${
                  detail.tradingValueRatio >= 2
                    ? "평소보다 관심이 크게 몰린 상태입니다."
                    : "평소와 비슷한 수준입니다."
                }`}
              />
              <Metric
                label="회사 전체 가격"
                value={fmtMoney(detail.marketCap)}
                help="주가에 발행 주식 수를 곱한 값으로, 이 회사를 통째로 사려면 드는 금액입니다."
              />
            </section>

            <section className="panel-sec">
              <h3>이 종목에 붙은 특징</h3>
              <div className="tag-line panel-tags">
                {detail.tags.map((t) => (
                  <TagChip key={t.code} tag={t} />
                ))}
              </div>
            </section>

            <dl className="panel-meta">
              <div>
                <dt>목록에 처음 들어온 날</dt>
                <dd>{detail.firstDetectedDate}</dd>
              </div>
              <div>
                <dt>데이터 기준일</dt>
                <dd>{detail.baseDate} 종가</dd>
              </div>
            </dl>

            <p className="panel-foot">
              이 화면은 공시된 숫자를 정리해 보여줄 뿐, 매수나 매도를 권하지 않습니다.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

/* ---------------------------- 종목 카드 ---------------------------- */

interface StockCardProps {
  stock: MainStock;
  onOpen: (stock: MainStock) => void;
}

function StockCard({ stock, onOpen }: StockCardProps) {
  const verdict = verdictOf(stock);

  return (
    <button type="button" className={`card c-${verdict.tone}`} onClick={() => onOpen(stock)}>
      <div className="card-top">
        <div className="who">
          <span className="who-name">{stock.stockName}</span>
          {isNew(stock, stock.baseDate) && <span className="new">새로 들어옴</span>}
          <span className="who-sub">
            {MARKET_LABEL[stock.market]} · {stock.sector}
          </span>
        </div>
        <div className="price">
          <span className="p-num">{fmtPrice(stock.closePrice)}원</span>
          <span className={`p-chg ${dir(stock.changeRate)}`}>
            {signed(stock.changeRate, 2, "%")}
          </span>
          <Sparkline data={stock.priceTrend} />
        </div>
      </div>

      <div className="card-mid">
        <span className={`verdict vd-${verdict.tone}`}>{verdict.text}</span>
        <Meter value={stock.valueScore} tone={verdict.tone} />
      </div>

      <div className="card-bot">
        <span className="div-chip">
          {stock.divYield > 0 ? `배당 ${stock.divYield.toFixed(1)}%` : "배당 없음"}
        </span>
        <div className="tag-line">
          {stock.tags.slice(0, 2).map((t) => (
            <TagChip key={t.code} tag={t} />
          ))}
          {stock.tags.length > 2 && (
            <span className="tag t-more">+{stock.tags.length - 2}</span>
          )}
        </div>
        <span className="more">자세히 보기</span>
      </div>
    </button>
  );
}

/* ---------------------------- 메인 ---------------------------- */

function ListSkeleton() {
  return (
    <ul className="list" role="status" aria-label="목록 불러오는 중">
      {[0, 1, 2, 3].map((i) => (
        <li key={i}>
          <div className="card card-sk">
            <span className="sk sk-title" />
            <span className="sk sk-bar" />
            <span className="sk sk-chips" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MainPage() {
  const { data: page, loading, error, reload } = useMainStocks();

  const [preset, setPreset] = useState<PresetKey>("valueScore");
  const [hideRisky, setHideRisky] = useState(true);
  const [selected, setSelected] = useState<MainStock | null>(null);

  const view = useMemo(() => {
    if (!page) return [];
    return page.content
      .filter((s) => !hideRisky || s.valueTrapFlag !== true)
      .sort((a, b) => b[preset] - a[preset]);
  }, [page, preset, hideRisky]);

  // 요약 수치는 서버가 전체 기준으로 계산해 내려줍니다.
  // 페이지네이션이 붙으면 클라이언트에서 센 값은 현재 페이지만 세게 됩니다.
  const summary = page?.summary ?? null;

  return (
    <div className="page">
      <style>{CSS}</style>

      <header className="head">
        <h1>지금 싼 종목</h1>
        {summary && page ? (
          <p className="lead">
            {formatKoreanDate(page.baseDate)} 종가 기준으로{" "}
            <b>{summary.total}개</b> 종목이 저평가 조건을 통과했어요. 이 중{" "}
            <b className="warn">{summary.trapCount}개</b>는 싸 보이지만 이익이 줄고 있어
            확인이 필요합니다.
          </p>
        ) : (
          <p className="lead lead-dim">
            {loading ? "오늘의 저평가 종목을 불러오고 있어요." : " "}
          </p>
        )}
      </header>

      {page && (
        <div className="controls">
          <div className="seg" role="group" aria-label="정렬 기준">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={preset === p.key ? "on" : ""}
                onClick={() => setPreset(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={hideRisky}
              onChange={(e) => setHideRisky(e.target.checked)}
            />
            확인이 필요한 종목 숨기기
          </label>
        </div>
      )}

      {error !== null ? (
        <div className="err-wrap">
          <ErrorBox message={error} onRetry={reload} />
        </div>
      ) : loading ? (
        <ListSkeleton />
      ) : view.length > 0 ? (
        <ul className="list">
          {view.map((s) => (
            <li key={s.stockCode}>
              <StockCard stock={s} onOpen={setSelected} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p>조건에 맞는 종목이 없어요.</p>
          {hideRisky && (
            <button type="button" className="linkbtn" onClick={() => setHideRisky(false)}>
              숨긴 종목까지 보기
            </button>
          )}
        </div>
      )}

      {page && (
        <footer className="foot">
          {page.collectedAt} 수집 · 여기 나온 숫자는{" "}
          {formatKoreanDate(page.baseDate)} 종가까지 공시된 자료만 사용합니다. 투자
          판단과 책임은 본인에게 있습니다.
        </footer>
      )}

      <DetailPanel
        stockCode={selected?.stockCode ?? null}
        baseDate={selected?.baseDate ?? null}
        fallbackName={selected?.stockName ?? ""}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

/* ---------------------------- 스타일 ---------------------------- */

const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css');

.page {
  --ink: #16202b;
  --ink-2: #55646f;
  --ink-3: #8b97a1;
  --line: #e2e7eb;
  --line-2: #eef1f4;
  --paper: #f1f3f5;
  --surface: #ffffff;
  --up: #d6173a;
  --down: #1b64da;
  --good: #157a63;
  --caution: #a8620f;
  --plain: #7b8894;

  font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
    'Malgun Gothic', system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  background: var(--paper);
  color: var(--ink);
  min-height: 100%;
  padding: 32px 20px 64px;
  -webkit-font-smoothing: antialiased;
}
.page *, .page *::before, .page *::after { box-sizing: border-box; }
.page button { font: inherit; cursor: pointer; }
.page :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.head { max-width: 760px; margin: 0 auto 20px; }
.head h1 { margin: 0; font-size: 27px; font-weight: 700; letter-spacing: -0.03em; }
.lead { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: var(--ink-2); max-width: 46ch; }
.lead b { color: var(--ink); font-weight: 600; }
.lead b.warn { color: var(--caution); }

.controls {
  max-width: 760px; margin: 0 auto 14px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
}
.seg { display: inline-flex; background: var(--surface); border: 1px solid var(--line); border-radius: 9px; overflow: hidden; }
.seg button { border: 0; background: transparent; padding: 9px 15px; font-size: 14px; color: var(--ink-2); }
.seg button + button { border-left: 1px solid var(--line); }
.seg button.on { background: var(--ink); color: #fff; font-weight: 600; }
.check { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; color: var(--ink-2); cursor: pointer; }
.check input { width: 16px; height: 16px; accent-color: var(--caution); }

.list { max-width: 760px; margin: 0 auto; padding: 0; list-style: none; display: grid; gap: 10px; }

.card {
  display: block; width: 100%; text-align: left;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 14px; padding: 18px 20px 16px;
}
.card:hover { border-color: #c9d2d9; }
.c-caution { border-left: 4px solid #d8a86a; }
.c-unknown { border-left: 4px solid var(--line); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.who { display: flex; flex-wrap: wrap; align-items: baseline; gap: 7px; min-width: 0; }
.who-name { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
.who-sub { font-size: 12.5px; color: var(--ink-3); }
.new {
  font-size: 11px; font-weight: 600; color: var(--good);
  border: 1px solid #b9d8d0; background: #f0f7f5; border-radius: 5px; padding: 2px 6px;
}
.price { display: flex; align-items: center; gap: 9px; white-space: nowrap; }
.p-num { font-size: 16px; font-weight: 600; }
.p-chg { font-size: 14px; font-weight: 600; }
.p-chg.up { color: var(--up); }
.p-chg.down { color: var(--down); }
.p-chg.flat { color: var(--ink-3); }
.spark polyline { fill: none; stroke-width: 1.5; }
.s-up { stroke: var(--up); }
.s-down { stroke: var(--down); }

.card-mid { margin-top: 15px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.verdict { font-size: 15.5px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.vd-good { color: var(--good); }
.vd-caution { color: var(--caution); }
.vd-unknown { color: var(--ink-3); }
.vd-plain { color: var(--ink-2); }

.meter { flex: 1 1 180px; min-width: 140px; height: 6px; border-radius: 3px; background: var(--line-2); overflow: hidden; }
.meter-fill { display: block; height: 100%; border-radius: 3px; }
.m-good { background: var(--good); }
.m-caution { background: #c98b3c; }
.m-unknown { background: #c3ccd3; }
.m-plain { background: var(--plain); }

.card-bot {
  margin-top: 15px; padding-top: 13px; border-top: 1px solid var(--line-2);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.div-chip { font-size: 13px; font-weight: 600; color: var(--ink-2); }
.tag-line { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  display: inline-flex; align-items: center; border-radius: 6px;
  padding: 3px 9px; font-size: 12px; line-height: 1.55; white-space: nowrap; border: 1px solid;
}
.t-positive { color: var(--good); border-color: #b9d8d0; background: #f0f7f5; }
.t-caution { color: var(--caution); border-color: #e3cbad; background: #fbf5ed; }
.t-neutral { color: var(--ink-2); border-color: var(--line); background: var(--surface); }
.t-more { color: var(--ink-3); border-color: transparent; padding: 3px 2px; }
.more { margin-left: auto; font-size: 12.5px; color: var(--ink-3); }

.lead-dim { color: var(--ink-3); min-height: 1.65em; }

.card-sk { display: grid; gap: 14px; pointer-events: none; }
.sk-title { height: 22px; width: 45%; }
.sk-bar { height: 16px; width: 100%; }
.sk-chips { height: 20px; width: 62%; }

.err-wrap { max-width: 760px; margin: 0 auto; }
.errbox {
  margin-top: 18px; padding: 20px; border-radius: 12px;
  border: 1px solid #e3cbad; background: #fbf5ed; text-align: center;
}
.errbox p { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: var(--caution); }

.empty { max-width: 760px; margin: 0 auto; padding: 48px 20px; text-align: center; color: var(--ink-2); }
.empty p { margin: 0 0 10px; font-size: 15px; }
.linkbtn { border: 0; background: transparent; color: var(--ink); font-size: 14px; text-decoration: underline; text-underline-offset: 4px; }

.foot { max-width: 760px; margin: 22px auto 0; font-size: 12px; line-height: 1.7; color: var(--ink-3); }

/* ---- 상세 패널 ---- */
.overlay { position: fixed; inset: 0; background: rgba(20, 30, 40, 0.34); z-index: 50; display: flex; justify-content: flex-end; }
.panel {
  width: min(460px, 100%); height: 100%; overflow-y: auto;
  background: var(--surface); padding: 24px 24px 40px;
  box-shadow: -8px 0 28px rgba(20, 30, 40, 0.12);
  animation: slide 180ms ease-out;
}
@keyframes slide { from { transform: translateX(18px); opacity: 0.6; } to { transform: none; opacity: 1; } }

.panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.panel-name { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.panel-sub { margin: 5px 0 0; font-size: 12.5px; color: var(--ink-3); }
.close { border: 0; background: transparent; font-size: 16px; color: var(--ink-3); padding: 4px 6px; line-height: 1; }

.skeleton { margin-top: 18px; display: grid; gap: 12px; }
.sk { display: block; border-radius: 8px; background: var(--line-2); }
.sk-price { height: 30px; width: 55%; }
.sk-box { height: 82px; }
.sk-line { height: 52px; }
.sk-line.short { width: 70%; }

.panel-price { margin-top: 14px; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.pp-num { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
.pp-chg { font-size: 14px; font-weight: 600; }
.pp-chg.up { color: var(--up); }
.pp-chg.down { color: var(--down); }
.pp-chg.flat { color: var(--ink-3); }

.verdict-box { margin-top: 18px; padding: 14px 16px; border-radius: 11px; border: 1px solid; }
.verdict-box strong { display: block; font-size: 15.5px; letter-spacing: -0.02em; }
.verdict-box p { margin: 7px 0 0; font-size: 13.5px; line-height: 1.7; color: var(--ink-2); }
.v-good { border-color: #b9d8d0; background: #f0f7f5; }
.v-good strong { color: var(--good); }
.v-caution { border-color: #e3cbad; background: #fbf5ed; }
.v-caution strong { color: var(--caution); }
.v-unknown, .v-plain { border-color: var(--line); background: #f7f9fa; }
.v-unknown strong, .v-plain strong { color: var(--ink-2); }

.panel-sec { margin-top: 26px; }
.panel-sec h3 { margin: 0 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-3); }
.panel-tags { margin-top: 10px; }

.metric { padding: 13px 0; border-bottom: 1px solid var(--line-2); }
.metric-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.metric-label { font-size: 14px; font-weight: 600; }
.metric-value { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; text-align: right; }
.metric-value.up { color: var(--up); }
.metric-value.down { color: var(--down); }
.metric-help { margin: 6px 0 0; font-size: 12.5px; line-height: 1.7; color: var(--ink-2); max-width: 48ch; }

.panel-meta { margin: 24px 0 0; display: flex; flex-wrap: wrap; gap: 24px; }
.panel-meta div { display: flex; flex-direction: column; gap: 4px; }
.panel-meta dt { font-size: 11.5px; color: var(--ink-3); }
.panel-meta dd { margin: 0; font-size: 13.5px; font-weight: 600; }
.panel-foot { margin: 22px 0 0; font-size: 11.5px; line-height: 1.7; color: var(--ink-3); }

@media (max-width: 560px) {
  .page { padding: 22px 14px 48px; }
  .head h1 { font-size: 23px; }
  .card { padding: 16px 16px 14px; }
  .card-top { flex-direction: column; gap: 8px; }
  .price { align-self: stretch; }
  .p-num { font-size: 18px; }
  .spark { margin-left: auto; }
  .panel { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .panel { animation: none; }
}
`;