// ===============================================
// 숫자를 화면에 보여주기 좋게 바꾸는 함수들
// ===============================================

// 259500 → "259,500원"
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

// 1.84 → "+1.84%",  -0.33 → "-0.33%",  0 → "0.00%"
export function formatChangeRate(changeRate: number): string {
  const text = changeRate.toFixed(2) + "%";
  if (changeRate > 0) {
    return "+" + text;
  }
  return text;
}

// 등락률에 따라 사용할 CSS class 이름
// (한국 주식 관례: 상승 = 빨강, 하락 = 파랑)
export function getChangeClassName(changeRate: number): string {
  if (changeRate > 0) {
    return "text-up";
  }
  if (changeRate < 0) {
    return "text-down";
  }
  return "text-flat";
}

// 순매수 금액(원)을 억원 단위로 표시
// 58015000000 → "+580억",  -93074000000 → "-931억"
export function formatEok(won: number): string {
  const eok = Math.round(won / 100_000_000);
  const text = eok.toLocaleString("ko-KR") + "억";
  if (eok > 0) {
    return "+" + text;
  }
  return text;
}

// "2026-09-01" → "09.01" (그래프 x축용)
export function formatShortDate(date: string): string {
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  return month + "." + day;
}
