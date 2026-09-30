import type { MainStocksResponse, StockTag } from "../types/stock";

/**
 * 테스트용 Mock 데이터 (실제 시세/지표가 아님)
 * - 태그 많음: KB금융(6), 현대차(5) / 태그 없음: 셀트리온, 에코프로비엠, 카카오
 * - 가치 함정: 한국전력, POSCO홀딩스
 * - 수급 최고: SK하이닉스 / 저평가·종합 최고: KB금융
 * - 다중 필터 예시: "005" + [저평가, 쌍끌이] → 삼성전자, 현대차
 *                   "삼성" + [저평가, 고배당] → 삼성화재
 */
export const mockMainStocksResponse: MainStocksResponse = {
  baseDate: "2026-09-29",
  stocks: [
    {
      stockCode: "005930", stockName: "삼성전자", market: "KOSPI", sector: "전기·전자",
      price: 259500, changeRate: 1.84, dividendYield: 0.64,
      flowScore: 82, valueScore: 76, totalScore: 80, tags: ["저평가", "저PBR", "쌍끌이"],
    },
    {
      stockCode: "000660", stockName: "SK하이닉스", market: "KOSPI", sector: "전기·전자",
      price: 412000, changeRate: 3.42, dividendYield: 0.35,
      flowScore: 94, valueScore: 43, totalScore: 74, tags: ["쌍끌이", "클린 매수"],
    },
    {
      stockCode: "035420", stockName: "NAVER", market: "KOSPI", sector: "서비스업",
      price: 218500, changeRate: -1.87, dividendYield: 0.52,
      flowScore: 38, valueScore: 61, totalScore: 50, tags: ["저PER"],
    },
    {
      stockCode: "005380", stockName: "현대차", market: "KOSPI", sector: "운수장비",
      price: 246000, changeRate: 0.94, dividendYield: 4.12,
      flowScore: 72, valueScore: 88, totalScore: 81,
      tags: ["저평가", "저PER", "저PBR", "고배당", "쌍끌이"],
    },
    {
      stockCode: "068270", stockName: "셀트리온", market: "KOSPI", sector: "의약품",
      price: 178300, changeRate: -0.62, dividendYield: 0.28,
      flowScore: 55, valueScore: 22, totalScore: 36, tags: [],
    },
    {
      stockCode: "247540", stockName: "에코프로비엠", market: "KOSDAQ", sector: "일반전기전자",
      price: 131700, changeRate: 5.83, dividendYield: 0,
      flowScore: 86, valueScore: 12, totalScore: 45, tags: [],
    },
    {
      stockCode: "035720", stockName: "카카오", market: "KOSPI", sector: "서비스업",
      price: 38950, changeRate: -2.35, dividendYield: 0.15,
      flowScore: 18, valueScore: 34, totalScore: 25, tags: [],
    },
    {
      stockCode: "105560", stockName: "KB금융", market: "KOSPI", sector: "금융업",
      price: 118700, changeRate: 1.13, dividendYield: 3.72,
      flowScore: 90, valueScore: 92, totalScore: 91,
      tags: ["저평가", "저PER", "저PBR", "고배당", "쌍끌이", "클린 매수"],
    },
    {
      stockCode: "000810", stockName: "삼성화재", market: "KOSPI", sector: "보험",
      price: 402500, changeRate: 0.37, dividendYield: 5.1,
      flowScore: 58, valueScore: 84, totalScore: 71, tags: ["저평가", "저PER", "고배당"],
    },
    {
      stockCode: "015760", stockName: "한국전력", market: "KOSPI", sector: "전기가스업",
      price: 22150, changeRate: -0.45, dividendYield: 0,
      flowScore: 31, valueScore: 79, totalScore: 42, tags: ["저PBR", "가치 함정"],
    },
    {
      stockCode: "005490", stockName: "POSCO홀딩스", market: "KOSPI", sector: "철강·금속",
      price: 312500, changeRate: -1.2, dividendYield: 3.2,
      flowScore: 24, valueScore: 76, totalScore: 44, tags: ["저PBR", "고배당", "가치 함정"],
    },
  ],
};

/** 종목별 태그 근거 (Mock). 실제로는 상세 API가 계산해서 내려줄 값 */
export const mockTagReasons: Record<string, Partial<Record<StockTag, string>>> = {
  "005930": {
    저평가: "PER/PBR 기준으로 KOSPI 전기·전자 업종 내 하위 30% 구간",
    저PBR: "PBR 1.1배로 업종 평균(1.8배) 대비 낮음",
    쌍끌이: "최근 5거래일 기관·외국인 동시 순매수",
  },
  "000660": {
    쌍끌이: "최근 5거래일 중 4일 기관·외국인 동시 순매수",
    "클린 매수": "기관·외국인 매수 기간 동안 연기금·투신 매도 없음",
  },
  "035420": {
    저PER: "PER 14.2배로 최근 5년 평균(28배)의 절반 수준",
  },
  "005380": {
    저평가: "PER/PBR 기준으로 KOSPI 운수장비 업종 내 하위 20% 구간",
    저PER: "PER 5.1배로 업종 평균(9.4배) 대비 낮음",
    저PBR: "PBR 0.6배로 순자산 가치 아래에서 거래",
    고배당: "배당수익률 4.12%로 설정 기준(3%) 이상",
    쌍끌이: "최근 5거래일 기관·외국인 동시 순매수",
  },
  "105560": {
    저평가: "PER/PBR 기준으로 KOSPI 금융업 내 하위 25% 구간",
    저PER: "PER 6.3배로 업종 평균(7.8배) 대비 낮음",
    저PBR: "PBR 0.7배로 순자산 가치 아래에서 거래",
    고배당: "배당수익률 3.72%로 설정 기준(3%) 이상",
    쌍끌이: "최근 10거래일 중 8일 기관·외국인 동시 순매수",
    "클린 매수": "기관·외국인 매수 기간 동안 주요 매도 주체 없음",
  },
  "000810": {
    저평가: "PER/PBR 기준으로 KOSPI 보험 업종 내 하위 30% 구간",
    저PER: "PER 7.4배로 업종 평균(9.1배) 대비 낮음",
    고배당: "배당수익률 5.10%로 설정 기준(3%) 이상",
  },
  "015760": {
    저PBR: "PBR 0.3배로 순자산 대비 크게 낮음",
    "가치 함정": "최근 4개 분기 중 3개 분기 영업적자 — 지표상 저평가가 실적 악화 때문일 수 있음",
  },
  "005490": {
    저PBR: "PBR 0.5배로 순자산 가치 아래에서 거래",
    고배당: "배당수익률 3.20%로 설정 기준(3%) 이상",
    "가치 함정": "영업이익이 3년 연속 감소 — 업황 부진이 반영된 저평가일 수 있음",
  },
};
