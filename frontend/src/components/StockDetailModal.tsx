/**
 * 카드를 클릭했을 때 뜨는 상세 정보 창입니다.
 *
 * 메인 카드가 "살펴볼 만한가"를 보여준다면, 여기서는 "왜 그런 판단이 나왔는지"를 숫자로 보여줍니다.
 * 데이터는 useStockDetail 훅이 상세 API(또는 mock)에서 따로 불러옵니다.
 */

import { useEffect } from 'react';
import { useStockDetail } from '../hooks/UseStockDetail';
import { GRADE_LABEL, GRADE_STYLE } from '../types/Stock';
import {
  formatDividend,
  formatMarketCap,
  formatMultiple,
  formatNetBuyAmount,
  formatPercent,
  formatPrice,
  formatPriceChange,
  formatScore,
  formatSectorPercentile,
  formatWon,
  getChangeDirection,
  getScoreLabel,
} from '../utils/Format';

/** 제목 + 값 한 줄입니다. */
function DetailRow({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-500">{title}</span>
      <span className={`text-sm font-medium tabular-nums ${valueColor ?? 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

/** 상세창 안의 한 덩어리입니다. */
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-100 px-5 py-3">
      <h3 className="mb-1 text-xs font-semibold text-slate-400">{title}</h3>
      <div className="divide-y divide-slate-50">{children}</div>
    </section>
  );
}

interface StockDetailModalProps {
  stockCode: string;
  onClose: () => void;
}

export default function StockDetailModal({ stockCode, onClose }: StockDetailModalProps) {
  const { stockDetail, isLoading, hasError } = useStockDetail(stockCode);

  // ESC 키로도 닫을 수 있게 합니다.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const changeDirection = stockDetail === null ? 'flat' : getChangeDirection(stockDetail.priceChange);
  const changeColor =
    changeDirection === 'up' ? 'text-red-600' : changeDirection === 'down' ? 'text-blue-600' : 'text-slate-500';

  /** 순매수는 양수면 빨강(사들임), 음수면 파랑(팔아치움)으로 보여줍니다. */
  function getNetBuyColor(amount: number | null): string {
    if (amount === null || amount === 0) return 'text-slate-900';
    return amount > 0 ? 'text-red-600' : 'text-blue-600';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 뒷배경을 누르면 닫힙니다. */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl">
        {isLoading && (
          <p className="px-5 py-20 text-center text-sm text-slate-500">상세 정보를 불러오는 중...</p>
        )}

        {hasError && (
          <div className="px-5 py-20 text-center">
            <p className="text-sm font-medium text-slate-900">상세 정보를 불러오지 못했습니다.</p>
            <p className="mt-1 text-sm text-slate-500">다시 시도해주세요.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              닫기
            </button>
          </div>
        )}

        {stockDetail !== null && (
          <>
            {/* 헤더: 종목명 + 판단 */}
            <header className="sticky top-0 border-b border-slate-100 bg-white px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="truncate text-xl font-bold text-slate-900">{stockDetail.stockName}</h2>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{stockDetail.stockCode}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {stockDetail.sector ?? '-'} · 기준일 {stockDetail.baseDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="상세 닫기"
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100"
                >
                  닫기
                </button>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-slate-900">
                    {formatPrice(stockDetail.closePrice)}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${changeColor}`}>
                    {formatPriceChange(stockDetail.priceChange)}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${GRADE_STYLE[stockDetail.grade].badge}`}
                  >
                    {GRADE_LABEL[stockDetail.grade]}
                  </span>
                  <p className={`mt-1 text-xl font-bold tabular-nums ${GRADE_STYLE[stockDetail.grade].score}`}>
                    {stockDetail.totalScore}
                    <span className="ml-0.5 text-xs font-medium">점</span>
                  </p>
                </div>
              </div>
            </header>

            {/* 가치 함정 경고 */}
            {stockDetail.isValueTrap && (
              <div className="mx-5 mt-4 rounded-lg bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-900">가치 함정에 주의하세요</p>
                <ul className="mt-1.5 space-y-1">
                  {stockDetail.valueTrapReasons.map((reason) => (
                    <li key={reason} className="text-xs text-blue-800">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 태그 */}
            {stockDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-5 pt-4">
                {stockDetail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pb-5">
              <DetailSection title="점수">
                <DetailRow title="종합 점수" value={formatScore(stockDetail.totalScore)} />
                <DetailRow
                  title="저평가 점수"
                  value={`${formatScore(stockDetail.valueScore)} · ${getScoreLabel(stockDetail.valueScore)}`}
                />
                <DetailRow
                  title="수급 점수"
                  value={`${formatScore(stockDetail.supplyScore)} · ${getScoreLabel(stockDetail.supplyScore)}`}
                />
                <DetailRow title="섹터 내 위치" value={formatSectorPercentile(stockDetail.sectorPercentile)} />
              </DetailSection>

              <DetailSection title="외국인 · 기관 수급 (최근 5일)">
                <DetailRow
                  title="외국인 순매수"
                  value={formatNetBuyAmount(stockDetail.foreignNetBuyAmount)}
                  valueColor={getNetBuyColor(stockDetail.foreignNetBuyAmount)}
                />
                <DetailRow
                  title="기관 순매수"
                  value={formatNetBuyAmount(stockDetail.institutionNetBuyAmount)}
                  valueColor={getNetBuyColor(stockDetail.institutionNetBuyAmount)}
                />
                <DetailRow
                  title="외국인 연속 순매수"
                  value={stockDetail.foreignNetBuyDays > 0 ? `${stockDetail.foreignNetBuyDays}일` : '없음'}
                />
              </DetailSection>

              <DetailSection title="가치 지표">
                <DetailRow title="PER" value={formatMultiple(stockDetail.per)} />
                <DetailRow title="PBR" value={formatMultiple(stockDetail.pbr)} />
                <DetailRow title="EPS (주당순이익)" value={formatWon(stockDetail.eps)} />
                <DetailRow title="BPS (주당순자산)" value={formatWon(stockDetail.bps)} />
                <DetailRow title="배당률" value={formatDividend(stockDetail.divYield)} />
                <DetailRow title="EPS 성장률" value={formatPercent(stockDetail.epsGrowthRate)} />
                <DetailRow title="시가총액" value={formatMarketCap(stockDetail.marketCap)} />
              </DetailSection>
            </div>
          </>
        )}
      </div>
    </div>
  );
}