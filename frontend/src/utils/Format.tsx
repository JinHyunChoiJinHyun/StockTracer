/**
 * 화면에 숫자를 보여줄 때 쓰는 변환 함수들입니다.
 * 규칙: 값이 없으면(null/undefined) 항상 '-' 를 보여줍니다.
 */

const EMPTY_TEXT = '-';

/** 78500 -> "78,500원" */
export function formatPrice(price: number | null): string {
  if (price === null) return EMPTY_TEXT;
  return `${price.toLocaleString('ko-KR')}원`;
}

/** 2.14 -> "+2.14%" / -1.2 -> "-1.20%" */
export function formatPriceChange(priceChange: number | null): string {
  if (priceChange === null) return EMPTY_TEXT;
  const sign = priceChange > 0 ? '+' : '';
  return `${sign}${priceChange.toFixed(2)}%`;
}

/** 12.4 -> "12.4배" (PER, PBR 공용) */
export function formatMultiple(value: number | null): string {
  if (value === null) return EMPTY_TEXT;
  return `${value.toFixed(2)}배`;
}

/** 2.8 -> "2.80%" (배당수익률, EPS 성장률 공용) */
export function formatPercent(value: number | null): string {
  if (value === null) return EMPTY_TEXT;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/** 배당수익률은 부호를 붙이지 않습니다. 2.8 -> "2.80%" */
export function formatDividend(divYield: number | null): string {
  if (divYield === null) return EMPTY_TEXT;
  return `${divYield.toFixed(2)}%`;
}

/** 74 -> "74점" */
export function formatScore(score: number | null): string {
  if (score === null) return EMPTY_TEXT;
  return `${Math.round(score)}점`;
}

/**
 * 점수를 초보자도 이해할 수 있는 말로 바꿉니다.
 * 색 없이 글자만 봐도 뜻이 통하게 하는 것이 목적입니다.
 */
export function getScoreLabel(score: number | null): string {
  if (score === null) return EMPTY_TEXT;
  if (score >= 80) return '매우 좋음';
  if (score >= 65) return '좋음';
  if (score >= 45) return '보통';
  return '낮음';
}

/** 5820 -> "5,820원" (EPS, BPS 처럼 단순한 원 단위 금액) */
export function formatWon(amount: number | null): string {
  if (amount === null) return EMPTY_TEXT;
  return `${amount.toLocaleString('ko-KR')}원`;
}

/** 468500000000000 -> "468.5조원", 324000000000 -> "3,240억원" */
export function formatMarketCap(marketCap: number | null): string {
  if (marketCap === null) return EMPTY_TEXT;

  const oneTrillion = 1_0000_0000_0000;
  const oneHundredMillion = 1_0000_0000;

  if (marketCap >= oneTrillion) {
    return `${(marketCap / oneTrillion).toFixed(1)}조원`;
  }
  return `${Math.round(marketCap / oneHundredMillion).toLocaleString('ko-KR')}억원`;
}

/** 1240 -> "+1,240억원" / -320 -> "-320억원" (입력 단위는 억원) */
export function formatNetBuyAmount(amountInHundredMillion: number | null): string {
  if (amountInHundredMillion === null) return EMPTY_TEXT;
  const sign = amountInHundredMillion > 0 ? '+' : '';
  return `${sign}${amountInHundredMillion.toLocaleString('ko-KR')}억원`;
}

/** 12 -> "섹터 상위 12%" */
export function formatSectorPercentile(percentile: number | null): string {
  if (percentile === null) return EMPTY_TEXT;
  return `섹터 상위 ${Math.round(percentile)}%`;
}

/** 등락률이 올랐는지 내렸는지 판단합니다. (한국 증시 관례: 상승 빨강 / 하락 파랑) */
export function getChangeDirection(priceChange: number | null): 'up' | 'down' | 'flat' {
  if (priceChange === null || priceChange === 0) return 'flat';
  return priceChange > 0 ? 'up' : 'down';
}