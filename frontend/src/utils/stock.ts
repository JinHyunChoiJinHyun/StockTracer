import type { Judgment, SortKey, Stock, StockTag } from "../types/stock";

const normalize = (value: string) => value.replace(/\s+/g, "").toLowerCase();

/** 1단계: 검색어(종목명/종목코드) */
export function filterByQuery(stocks: Stock[], query: string): Stock[] {
  const q = normalize(query);
  if (q === "") return stocks;
  return stocks.filter(
    (stock) => normalize(stock.stockName).includes(q) || stock.stockCode.includes(q),
  );
}

/** 2단계: 선택한 태그를 "모두" 가진 종목 (AND). 비어 있으면 전체 */
export function filterByTags(stocks: Stock[], selectedTags: StockTag[]): Stock[] {
  if (selectedTags.length === 0) return stocks;
  return stocks.filter((stock) => selectedTags.every((tag) => stock.tags.includes(tag)));
}

/** 검색 → 태그(AND) → 정렬 순서로 적용 */
export function getVisibleStocks(
  stocks: Stock[],
  query: string,
  selectedTags: StockTag[],
  sortKey: SortKey,
): Stock[] {
  return sortStocks(filterByTags(filterByQuery(stocks, query), selectedTags), sortKey);
}

/** 내림차순 정렬. 동점이면 종합점수 → 종목명 순 */
export function sortStocks(stocks: Stock[], key: SortKey): Stock[] {
  return [...stocks].sort(
    (a, b) =>
      b[key] - a[key] ||
      b.totalScore - a.totalScore ||
      a.stockName.localeCompare(b.stockName, "ko"),
  );
}

/**
 * 종합점수 기반 판단. 가치 함정 태그가 붙으면 점수와 무관하게 '주의'.
 * (추후 백엔드에서 판단값을 내려주면 이 함수 대신 응답값을 사용)
 */
export function getJudgment(stock: Stock): Judgment {
  if (stock.tags.includes("가치 함정")) return "주의";
  if (stock.totalScore >= 75) return "매수 관심";
  if (stock.totalScore >= 55) return "관심";
  if (stock.totalScore >= 40) return "중립";
  return "주의";
}

export const JUDGMENT_GUIDE: { judgment: Judgment; description: string }[] = [
  { judgment: "매수 관심", description: "지표가 전반적으로 좋음" },
  { judgment: "관심", description: "일부 지표가 좋음" },
  { judgment: "중립", description: "특별한 신호 없음" },
  { judgment: "주의", description: "지표가 좋지 않음" },
];

export const TAG_DESCRIPTIONS: Record<StockTag, string> = {
  저평가: "업종 평균보다 밸류에이션이 낮습니다.",
  저PER: "이익 대비 주가가 낮습니다.",
  저PBR: "순자산 대비 주가가 낮습니다.",
  고배당: "배당수익률이 설정 기준 이상입니다.",
  쌍끌이: "기관과 외국인이 동시에 순매수하고 있습니다.",
  "클린 매수": "기관·외국인 매수 기간에 뚜렷한 매도 주체가 없습니다.",
  "가치 함정": "지표는 싸 보이지만 실적·업황 악화로 싼 것일 수 있습니다.",
};

export function getScoreLevel(score: number): "높음" | "보통" | "낮음" {
  if (score >= 70) return "높음";
  if (score >= 40) return "보통";
  return "낮음";
}

export const clampScore = (score: number) =>
  Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;

export function formatPrice(price: number): string {
  return Number.isFinite(price) ? `${price.toLocaleString("ko-KR")}원` : "-";
}

export function formatChangeRate(rate: number): string {
  if (!Number.isFinite(rate)) return "-";
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

export function formatDividend(yieldRate: number): string {
  if (!Number.isFinite(yieldRate) || yieldRate <= 0) return "무배당";
  return `${yieldRate.toFixed(2)}%`;
}
