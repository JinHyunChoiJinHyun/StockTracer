/**
 * ⚠️ 임시(mock) 종목 데이터입니다.
 *
 * 백엔드 API 없이도 메인 페이지가 완전히 동작하도록 만든 가짜 데이터입니다.
 * 실제 API가 연결되면 이 파일은 더 이상 사용되지 않습니다. (api/stockApi.ts 의 USE_MOCK 참고)
 */

import type { Stock, StockGrade } from '../types/Stock';
import { createMockTags } from './MockTags';

/** 점수/등급/태그를 뺀 "원본 숫자"만 적어둡니다. 나머지는 아래에서 계산합니다. */
type MockStockSource = Omit<Stock, 'totalScore' | 'grade' | 'tags' | 'isValueTrap'>;

const BASE_DATE = '2026-09-14';

const MOCK_STOCK_SOURCES: MockStockSource[] = [
  { stockCode: '005930', stockName: '삼성전자', sector: '반도체', baseDate: BASE_DATE, closePrice: 78500, priceChange: 2.14, supplyScore: 82, valueScore: 74, per: 12.4, pbr: 1.32, divYield: 2.8, epsGrowthRate: 18.5 },
  { stockCode: '000660', stockName: 'SK하이닉스', sector: '반도체', baseDate: BASE_DATE, closePrice: 182000, priceChange: 3.41, supplyScore: 88, valueScore: 61, per: 15.2, pbr: 2.05, divYield: 0.9, epsGrowthRate: 42.3 },
  { stockCode: '373220', stockName: 'LG에너지솔루션', sector: '2차전지', baseDate: BASE_DATE, closePrice: 398500, priceChange: -1.24, supplyScore: 41, valueScore: 28, per: 58.7, pbr: 3.41, divYield: 0.2, epsGrowthRate: -12.4 },
  { stockCode: '207940', stockName: '삼성바이오로직스', sector: '바이오', baseDate: BASE_DATE, closePrice: 812000, priceChange: 0.62, supplyScore: 68, valueScore: 35, per: 61.3, pbr: 5.82, divYield: null, epsGrowthRate: 21.7 },
  { stockCode: '005380', stockName: '현대차', sector: '자동차', baseDate: BASE_DATE, closePrice: 241500, priceChange: 1.05, supplyScore: 76, valueScore: 84, per: 5.2, pbr: 0.61, divYield: 4.6, epsGrowthRate: 11.2 },
  { stockCode: '000270', stockName: '기아', sector: '자동차', baseDate: BASE_DATE, closePrice: 112300, priceChange: 1.82, supplyScore: 79, valueScore: 88, per: 4.1, pbr: 0.72, divYield: 5.1, epsGrowthRate: 14.8 },
  { stockCode: '068270', stockName: '셀트리온', sector: '바이오', baseDate: BASE_DATE, closePrice: 176400, priceChange: -0.85, supplyScore: 52, valueScore: 44, per: 38.2, pbr: 2.14, divYield: 0.5, epsGrowthRate: 6.3 },
  { stockCode: '005490', stockName: 'POSCO홀딩스', sector: '철강', baseDate: BASE_DATE, closePrice: 312000, priceChange: -2.05, supplyScore: 38, valueScore: 79, per: 8.4, pbr: 0.48, divYield: 3.4, epsGrowthRate: -18.2 },
  { stockCode: '035420', stockName: 'NAVER', sector: '인터넷', baseDate: BASE_DATE, closePrice: 198500, priceChange: 0.94, supplyScore: 64, valueScore: 71, per: 14.8, pbr: 1.02, divYield: 0.6, epsGrowthRate: 9.4 },
  { stockCode: '035720', stockName: '카카오', sector: '인터넷', baseDate: BASE_DATE, closePrice: 41250, priceChange: -1.67, supplyScore: 34, valueScore: 39, per: 45.6, pbr: 1.28, divYield: 0.3, epsGrowthRate: -22.8 },
  { stockCode: '105560', stockName: 'KB금융', sector: '금융', baseDate: BASE_DATE, closePrice: 84600, priceChange: 1.44, supplyScore: 81, valueScore: 91, per: 5.8, pbr: 0.52, divYield: 4.8, epsGrowthRate: 12.6 },
  { stockCode: '055550', stockName: '신한지주', sector: '금융', baseDate: BASE_DATE, closePrice: 52300, priceChange: 0.77, supplyScore: 74, valueScore: 89, per: 5.4, pbr: 0.46, divYield: 5.2, epsGrowthRate: 8.9 },
  { stockCode: '086790', stockName: '하나금융지주', sector: '금융', baseDate: BASE_DATE, closePrice: 61800, priceChange: 1.31, supplyScore: 72, valueScore: 92, per: 4.6, pbr: 0.42, divYield: 5.8, epsGrowthRate: 10.4 },
  { stockCode: '028260', stockName: '삼성물산', sector: '건설', baseDate: BASE_DATE, closePrice: 148200, priceChange: -0.41, supplyScore: 58, valueScore: 76, per: 9.2, pbr: 0.68, divYield: 2.4, epsGrowthRate: 4.1 },
  { stockCode: '006400', stockName: '삼성SDI', sector: '2차전지', baseDate: BASE_DATE, closePrice: 284500, priceChange: -2.84, supplyScore: 29, valueScore: 33, per: 42.1, pbr: 1.14, divYield: 0.4, epsGrowthRate: -34.6 },
  { stockCode: '051910', stockName: 'LG화학', sector: '화학', baseDate: BASE_DATE, closePrice: 312500, priceChange: -1.11, supplyScore: 36, valueScore: 58, per: 18.4, pbr: 0.82, divYield: 1.2, epsGrowthRate: -15.3 },
  { stockCode: '012330', stockName: '현대모비스', sector: '자동차부품', baseDate: BASE_DATE, closePrice: 246000, priceChange: 0.82, supplyScore: 69, valueScore: 83, per: 6.1, pbr: 0.54, divYield: 2.6, epsGrowthRate: 7.8 },
  { stockCode: '032830', stockName: '삼성생명', sector: '보험', baseDate: BASE_DATE, closePrice: 92400, priceChange: 1.99, supplyScore: 71, valueScore: 86, per: 7.2, pbr: 0.38, divYield: 4.2, epsGrowthRate: 5.6 },
  { stockCode: '096770', stockName: 'SK이노베이션', sector: '정유', baseDate: BASE_DATE, closePrice: 108900, priceChange: -3.12, supplyScore: 31, valueScore: 64, per: 11.8, pbr: 0.51, divYield: 1.8, epsGrowthRate: -28.4 },
  { stockCode: '033780', stockName: 'KT&G', sector: '필수소비재', baseDate: BASE_DATE, closePrice: 116800, priceChange: 0.34, supplyScore: 66, valueScore: 81, per: 10.4, pbr: 1.06, divYield: 4.9, epsGrowthRate: 3.2 },
  { stockCode: '015760', stockName: '한국전력', sector: '유틸리티', baseDate: BASE_DATE, closePrice: 23450, priceChange: 2.62, supplyScore: 62, valueScore: 72, per: 6.8, pbr: 0.34, divYield: null, epsGrowthRate: null },
  { stockCode: '066570', stockName: 'LG전자', sector: '가전', baseDate: BASE_DATE, closePrice: 94700, priceChange: 1.18, supplyScore: 63, valueScore: 78, per: 8.9, pbr: 0.74, divYield: 2.1, epsGrowthRate: 13.4 },
  { stockCode: '316140', stockName: '우리금융지주', sector: '금융', baseDate: BASE_DATE, closePrice: 16820, priceChange: 0.96, supplyScore: 70, valueScore: 90, per: 4.2, pbr: 0.36, divYield: 6.4, epsGrowthRate: 6.8 },
  { stockCode: '011200', stockName: 'HMM', sector: '해운', baseDate: BASE_DATE, closePrice: 18340, priceChange: 4.86, supplyScore: 84, valueScore: 68, per: 3.8, pbr: 0.44, divYield: 2.2, epsGrowthRate: 56.2 },
  { stockCode: '034020', stockName: '두산에너빌리티', sector: '기계', baseDate: BASE_DATE, closePrice: 24150, priceChange: 3.28, supplyScore: 86, valueScore: 42, per: 34.6, pbr: 2.18, divYield: null, epsGrowthRate: 28.9 },
  { stockCode: '259960', stockName: '크래프톤', sector: '게임', baseDate: BASE_DATE, closePrice: 328000, priceChange: 1.61, supplyScore: 73, valueScore: 66, per: 13.2, pbr: 2.84, divYield: null, epsGrowthRate: 24.1 },
  { stockCode: '000810', stockName: '삼성화재', sector: '보험', baseDate: BASE_DATE, closePrice: 384500, priceChange: 0.52, supplyScore: 67, valueScore: 85, per: 6.4, pbr: 0.88, divYield: 4.4, epsGrowthRate: 9.1 },
  { stockCode: '017670', stockName: 'SK텔레콤', sector: '통신', baseDate: BASE_DATE, closePrice: 56800, priceChange: -0.35, supplyScore: 55, valueScore: 77, per: 9.8, pbr: 0.94, divYield: 6.1, epsGrowthRate: 2.4 },
  { stockCode: '030200', stockName: 'KT', sector: '통신', baseDate: BASE_DATE, closePrice: 44150, priceChange: 0.68, supplyScore: 59, valueScore: 80, per: 8.2, pbr: 0.58, divYield: 5.4, epsGrowthRate: 4.6 },
  { stockCode: '010950', stockName: 'S-Oil', sector: '정유', baseDate: BASE_DATE, closePrice: 68200, priceChange: -1.88, supplyScore: 33, valueScore: 62, per: 12.6, pbr: 0.78, divYield: 3.2, epsGrowthRate: -19.8 },
  { stockCode: '090430', stockName: '아모레퍼시픽', sector: '화장품', baseDate: BASE_DATE, closePrice: 118400, priceChange: -2.31, supplyScore: 27, valueScore: 31, per: 48.2, pbr: 1.86, divYield: 0.8, epsGrowthRate: -26.4 },
  { stockCode: '009830', stockName: '한화솔루션', sector: '화학', baseDate: BASE_DATE, closePrice: 26350, priceChange: -3.64, supplyScore: 24, valueScore: 48, per: null, pbr: 0.62, divYield: null, epsGrowthRate: -41.2 },
  { stockCode: '051900', stockName: 'LG생활건강', sector: '화장품', baseDate: BASE_DATE, closePrice: 342000, priceChange: -1.42, supplyScore: 32, valueScore: 54, per: 16.8, pbr: 0.92, divYield: 1.4, epsGrowthRate: -14.6 },
  { stockCode: '003670', stockName: '포스코퓨처엠', sector: '2차전지', baseDate: BASE_DATE, closePrice: 186500, priceChange: -4.21, supplyScore: 22, valueScore: 18, per: 92.4, pbr: 4.26, divYield: 0.2, epsGrowthRate: -52.8 },
  { stockCode: '036570', stockName: '엔씨소프트', sector: '게임', baseDate: BASE_DATE, closePrice: 172800, priceChange: -0.92, supplyScore: 39, valueScore: 52, per: 28.4, pbr: 1.12, divYield: 2.0, epsGrowthRate: -8.4 },
  { stockCode: '010130', stockName: '고려아연', sector: '비철금속', baseDate: BASE_DATE, closePrice: 512000, priceChange: 2.41, supplyScore: 77, valueScore: 63, per: 16.2, pbr: 1.24, divYield: 2.9, epsGrowthRate: 16.8 },
  { stockCode: '009150', stockName: '삼성전기', sector: '전자부품', baseDate: BASE_DATE, closePrice: 148600, priceChange: 1.78, supplyScore: 75, valueScore: 70, per: 11.4, pbr: 1.08, divYield: 1.1, epsGrowthRate: 22.6 },
  { stockCode: '097950', stockName: 'CJ제일제당', sector: '음식료', baseDate: BASE_DATE, closePrice: 284000, priceChange: 0.28, supplyScore: 56, valueScore: 82, per: 7.4, pbr: 0.56, divYield: 2.3, epsGrowthRate: 5.2 },
  { stockCode: '003490', stockName: '대한항공', sector: '항공', baseDate: BASE_DATE, closePrice: 23800, priceChange: 1.06, supplyScore: 61, valueScore: 74, per: 6.2, pbr: 0.82, divYield: 3.1, epsGrowthRate: 8.2 },
  { stockCode: '078930', stockName: 'GS', sector: '지주', baseDate: BASE_DATE, closePrice: 42600, priceChange: -0.58, supplyScore: 47, valueScore: 87, per: 3.9, pbr: 0.32, divYield: 6.8, epsGrowthRate: -6.4 },
  { stockCode: '004020', stockName: '현대제철', sector: '철강', baseDate: BASE_DATE, closePrice: 28150, priceChange: -2.44, supplyScore: 26, valueScore: 75, per: 9.4, pbr: 0.24, divYield: 3.6, epsGrowthRate: -32.4 },
  { stockCode: '042700', stockName: '한미반도체', sector: '반도체장비', baseDate: BASE_DATE, closePrice: 96400, priceChange: 5.12, supplyScore: 91, valueScore: 38, per: 44.2, pbr: 8.64, divYield: 0.4, epsGrowthRate: 68.4 },
  { stockCode: '011170', stockName: '롯데케미칼', sector: '화학', baseDate: BASE_DATE, closePrice: 71200, priceChange: -3.86, supplyScore: 19, valueScore: 46, per: null, pbr: 0.28, divYield: null, epsGrowthRate: null },
  { stockCode: '251270', stockName: '넷마블', sector: '게임', baseDate: BASE_DATE, closePrice: 54800, priceChange: 2.24, supplyScore: 65, valueScore: 49, per: 22.6, pbr: 1.42, divYield: null, epsGrowthRate: 19.2 },
  { stockCode: '139480', stockName: '이마트', sector: '유통', baseDate: BASE_DATE, closePrice: 62400, priceChange: -1.73, supplyScore: 28, valueScore: 69, per: 14.2, pbr: 0.22, divYield: 3.8, epsGrowthRate: -11.4 },
];

/** 종합점수를 계산합니다. (수급 50% + 저평가 50%) */
function calculateTotalScore(supplyScore: number, valueScore: number | null): number {
  const value = valueScore ?? supplyScore;
  return Math.round(supplyScore * 0.5 + value * 0.5);
}

/** 종합점수를 등급으로 바꿉니다. 실제로는 백엔드가 내려줄 값입니다. */
function decideGrade(totalScore: number): StockGrade {
  if (totalScore >= 75) return 'BUY_INTEREST';
  if (totalScore >= 62) return 'INTEREST';
  if (totalScore >= 48) return 'NEUTRAL';
  return 'CAUTION';
}

/**
 * 가치 함정(Value Trap) 여부를 판단합니다.
 * "지표상으로는 싼데, 수급이나 실적이 전혀 따라오지 않는 상태"를 뜻합니다.
 */
function decideValueTrap(source: MockStockSource): boolean {
  if (source.valueScore === null || source.valueScore < 65) {
    return false;
  }

  const hasWeakSupply = source.supplyScore < 40;
  const hasShrinkingProfit = source.epsGrowthRate !== null && source.epsGrowthRate < -10;

  return hasWeakSupply || hasShrinkingProfit;
}

/** 화면에서 사용할 최종 mock 종목 목록입니다. */
export const MOCK_STOCKS: Stock[] = MOCK_STOCK_SOURCES.map((source) => {
  const totalScore = calculateTotalScore(source.supplyScore, source.valueScore);
  const grade = decideGrade(totalScore);

  return {
    ...source,
    totalScore,
    grade,
    isValueTrap: decideValueTrap(source),
    tags: createMockTags({ ...source, grade }),
  };
});