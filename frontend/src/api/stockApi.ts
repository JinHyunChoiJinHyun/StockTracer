import type { MainStocksResponse, StockDetail } from "../types/stock";
import { mockMainStocksResponse, mockTagReasons } from "../mock/stocks";
import { TAG_DESCRIPTIONS } from "../utils/stock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const MOCK_DELAY_MS = 300;
const MAIN_CACHE_TTL_MS = 5 * 60 * 1000;

export class NotFoundError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (res.status === 404) throw new NotFoundError("요청한 종목을 찾을 수 없습니다.");
  if (!res.ok) throw new Error(`데이터를 불러오지 못했습니다. (HTTP ${res.status})`);
  return (await res.json()) as T;
}

/* ---------- 메인 목록 ---------- */

// 상세 → 뒤로 가기 시 로딩 없이 목록을 바로 그려 스크롤 위치를 유지하기 위한 캐시
let mainCache: { data: MainStocksResponse; at: number } | null = null;

export function getCachedMainStocks(): MainStocksResponse | null {
  if (mainCache && Date.now() - mainCache.at < MAIN_CACHE_TTL_MS) return mainCache.data;
  return null;
}

export async function fetchMainStocks(
  signal?: AbortSignal,
  options: { force?: boolean } = {},
): Promise<MainStocksResponse> {
  const cached = options.force ? null : getCachedMainStocks();
  if (cached) return cached;

  let data: MainStocksResponse;
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    data = mockMainStocksResponse;
  } else {
    data = await getJson<MainStocksResponse>("/api/v1/main/stocks", signal);
  }
  mainCache = { data, at: Date.now() };
  return data;
}

/* ---------- 종목 상세 ---------- */

export async function fetchStockDetail(
  stockCode: string,
  signal?: AbortSignal,
): Promise<StockDetail> {
  if (!USE_MOCK) {
    return getJson<StockDetail>(`/api/v1/stocks/${encodeURIComponent(stockCode)}`, signal);
  }

  await delay(MOCK_DELAY_MS);
  const { baseDate, stocks } = mockMainStocksResponse;
  const stock = stocks.find((s) => s.stockCode === stockCode);
  if (!stock) throw new NotFoundError("요청한 종목을 찾을 수 없습니다.");

  const reasons = mockTagReasons[stockCode] ?? {};
  return {
    ...stock,
    baseDate,
    tagReasons: stock.tags.map((tag) => ({
      tag,
      reason: reasons[tag] ?? TAG_DESCRIPTIONS[tag],
    })),
  };
}
