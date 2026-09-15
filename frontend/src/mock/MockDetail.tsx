/**
 * ⚠️ 임시(mock) 상세 조회 함수입니다.
 *
 * 실제로는 백엔드 상세 API가 EPS, BPS, 시가총액, 20일 시계열을 내려줍니다.
 * 지금은 목록 mock 데이터로부터 계산하거나, 가짜 난수로 만들어냅니다.
 */

import type {
  InvestorFlowPoint,
  PricePoint,
  SectorAverage,
  Stock,
  StockDetail,
} from '../types/Stock';
import { MOCK_STOCKS } from './MockStocks';

const MOCK_DELAY_MS = 300;

/** 차트에 사용할 영업일 수 */
const HISTORY_DAYS = 20;

/**
 * 같은 씨앗을 주면 항상 같은 순서의 0~1 난수를 돌려주는 함수입니다.
 * 새로고침할 때마다 차트 모양이 바뀌면 헷갈리므로 이렇게 고정했습니다.
 */
function createRandomGenerator(seed: number) {
  let current = seed;

  return function nextRandom(): number {
    current = (current * 1103515245 + 12345) % 2147483648;
    return current / 2147483648;
  };
}

/** 종목코드를 숫자 씨앗으로 바꿉니다. */
function createSeed(stockCode: string): number {
  return (Number(stockCode) % 99991) + 7;
}

/**
 * 가짜 상장주식수입니다. (3천만 ~ 10억 주)
 * 같은 종목은 항상 같은 값이 나옵니다.
 */
function createFakeShareCount(stockCode: string): number {
  return ((Number(stockCode) % 997) + 30) * 1_000_000;
}

/** 기준일부터 거꾸로 세면서 주말을 뺀 영업일 날짜 목록을 만듭니다. (오래된 날짜가 앞) */
function createBusinessDates(baseDate: string, dayCount: number): string[] {
  const dates: string[] = [];
  const cursor = new Date(baseDate);

  while (dates.length < dayCount) {
    const dayOfWeek = cursor.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      dates.unshift(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
}

/**
 * 20일치 주가를 만듭니다.
 * 오늘 종가에서 시작해 하루씩 거꾸로 거슬러 올라가며 ±2% 안에서 움직이게 합니다.
 */
function createPriceHistory(stock: Stock, dates: string[]): PricePoint[] {
  if (stock.closePrice === null) {
    return [];
  }

  const nextRandom = createRandomGenerator(createSeed(stock.stockCode));
  const prices: number[] = [stock.closePrice];

  while (prices.length < dates.length) {
    const dailyChangeRate = (nextRandom() - 0.5) * 0.04;
    const previousPrice = Math.round(prices[0] / (1 + dailyChangeRate));
    prices.unshift(previousPrice);
  }

  return dates.map((date, index) => ({ date, closePrice: prices[index] }));
}

/**
 * 20일치 외국인·기관 순매수를 만듭니다.
 * 수급 점수가 높을수록 평균이 플러스(사는 쪽)가 되도록 기울여 둡니다.
 */
function createInvestorFlowHistory(stock: Stock, dates: string[]): InvestorFlowPoint[] {
  const nextRandom = createRandomGenerator(createSeed(stock.stockCode) + 31);

  // 수급 점수 50점을 중립으로 보고, 거기서 얼마나 떨어져 있는지를 하루 평균 순매수로 씁니다.
  const dailyAverage = (stock.supplyScore - 50) * 2.4;

  return dates.map((date) => ({
    date,
    foreignNetBuy: Math.round(dailyAverage + (nextRandom() - 0.5) * 180),
    institutionNetBuy: Math.round(dailyAverage * 0.6 + (nextRandom() - 0.5) * 140),
  }));
}

/** 같은 섹터 종목들의 평균 지표를 계산합니다. (mock 목록 전체를 사용) */
function calculateSectorAverage(sector: string | null): SectorAverage {
  const sectorStocks = MOCK_STOCKS.filter((item) => item.sector === sector);

  function averageOf(pickValue: (stock: Stock) => number | null): number | null {
    const values = sectorStocks.map(pickValue).filter((value): value is number => value !== null);
    if (values.length === 0) return null;

    const sum = values.reduce((total, value) => total + value, 0);
    return Number((sum / values.length).toFixed(2));
  }

  return {
    per: averageOf((stock) => stock.per),
    pbr: averageOf((stock) => stock.pbr),
    divYield: averageOf((stock) => stock.divYield),
  };
}

/** 가치 함정으로 본 이유를 사람이 읽는 문장으로 만듭니다. */
function createValueTrapReasons(stock: Stock): string[] {
  if (!stock.isValueTrap) {
    return [];
  }

  const reasons: string[] = [];

  if (stock.epsGrowthRate !== null && stock.epsGrowthRate < 0) {
    reasons.push('주가는 싸 보이지만 이익이 줄고 있습니다.');
  }
  if (stock.supplyScore < 40) {
    reasons.push('외국인과 기관이 사지 않고 있습니다.');
  }
  if (stock.divYield === null) {
    reasons.push('배당이 없어 주가가 오를 때까지 기다리는 대가가 없습니다.');
  }

  return reasons;
}

/** 목록 데이터 한 건을 상세 데이터로 부풀립니다. */
function createMockDetail(stock: Stock): StockDetail {
  const shareCount = createFakeShareCount(stock.stockCode);
  const dates = createBusinessDates(stock.baseDate, HISTORY_DAYS);

  return {
    ...stock,

    // EPS = 주가 ÷ PER, BPS = 주가 ÷ PBR 로 역산합니다.
    eps: stock.closePrice !== null && stock.per !== null ? Math.round(stock.closePrice / stock.per) : null,
    bps: stock.closePrice !== null && stock.pbr !== null ? Math.round(stock.closePrice / stock.pbr) : null,
    marketCap: stock.closePrice !== null ? stock.closePrice * shareCount : null,

    // 저평가 점수가 높을수록 섹터 안에서 상위권이라고 봅니다.
    sectorPercentile: stock.valueScore !== null ? 100 - stock.valueScore : null,

    foreignNetBuyAmount: Math.round((stock.supplyScore - 50) * 12),
    institutionNetBuyAmount: Math.round((stock.supplyScore - 50) * 7),
    foreignNetBuyDays: stock.supplyScore >= 70 ? Math.round(stock.supplyScore / 20) : 0,

    valueTrapReasons: createValueTrapReasons(stock),

    priceHistory: createPriceHistory(stock, dates),
    investorFlowHistory: createInvestorFlowHistory(stock, dates),
    sectorAverage: calculateSectorAverage(stock.sector),
  };
}

export async function fetchStockDetailFromMock(stockCode: string): Promise<StockDetail> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const stock = MOCK_STOCKS.find((item) => item.stockCode === stockCode);

  if (stock === undefined) {
    throw new Error(`종목을 찾을 수 없습니다. (stockCode: ${stockCode})`);
  }

  return createMockDetail(stock);
}