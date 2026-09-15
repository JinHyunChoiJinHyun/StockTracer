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

/** 등락률이 올랐는지 내렸는지 판단합니다. (한국 증시 관례: 상승 빨강 / 하락 파랑) */
export function getChangeDirection(priceChange: number | null): 'up' | 'down' | 'flat' {
  if (priceChange === null || priceChange === 0) return 'flat';
  return priceChange > 0 ? 'up' : 'down';
}