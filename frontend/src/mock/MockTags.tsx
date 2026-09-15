/**
 * ⚠️ 임시(mock) 태그 파일입니다.
 *
 * 백엔드에 태그 API가 아직 없기 때문에, 종목의 숫자 값을 보고 프론트에서 태그를 만들어냅니다.
 * 즉 여기서 나오는 태그는 "실제 분석 결과가 아니라 UI 확인용 가짜 데이터"입니다.
 *
 * 👉 나중에 태그 API가 생기면:
 *    1) api/stockApi.ts 의 convertApiStockToStock() 에서 createMockTags() 호출을 지우고
 *       apiStock.tags 를 그대로 사용하도록 바꾸고,
 *    2) 이 파일은 삭제하면 됩니다.
 */

import type { Stock } from '../types/Stock';

/** 태그를 만들 때 필요한 값들만 골라서 받습니다. */
type TagSource = Pick<
  Stock,
  'supplyScore' | 'valueScore' | 'per' | 'pbr' | 'divYield' | 'epsGrowthRate' | 'grade'
>;

export function createMockTags(stock: TagSource): string[] {
  const tags: string[] = [];

  if (stock.valueScore !== null && stock.valueScore >= 70) {
    tags.push('저평가');
  }
  if (stock.supplyScore >= 75) {
    tags.push('외국인 매수');
  } else if (stock.supplyScore >= 60) {
    tags.push('기관 매수');
  }
  if (stock.per !== null && stock.per <= 10) {
    tags.push('저PER');
  }
  if (stock.pbr !== null && stock.pbr <= 1) {
    tags.push('저PBR');
  }
  if (stock.divYield !== null && stock.divYield >= 3) {
    tags.push('배당 매력');
  }
  if (stock.epsGrowthRate !== null && stock.epsGrowthRate >= 10) {
    tags.push('EPS 성장');
  }
  if (stock.grade === 'CAUTION') {
    tags.push('주의');
  }

  return tags;
}