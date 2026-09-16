/**
 * 종목 한 개를 보여주는 카드입니다. 카드 전체가 버튼이라서 클릭하면 상세창이 열립니다.
 *
 * 메인 카드에는 "판단에 바로 필요한 것"만 둡니다.
 *   1) 등급(매수 관심 / 주의)  ← 가장 먼저 보여야 하는 판단
 *   2) 종목명
 *   3) 가격과 등락률
 *   4) 태그 (판단의 요약)
 *   5) 수급 / 저평가 점수 막대 (해석형 - 숫자 대신 '좋음/보통')
 *   6) 가치 함정 경고, 배당률
 *
 * PER, PBR, EPS, BPS, 시가총액, 섹터 백분위 같은 세부 숫자는 상세창에서 보여줍니다.
 */

import type { Stock } from '../types/Stock';
import { GRADE_LABEL, GRADE_STYLE } from '../types/Stock';
import { formatDividend, formatPrice, formatPriceChange, getChangeDirection, getScoreLabel } from '../utils/Format';

/** 태그 색상. '주의'만 눈에 띄게 하고 나머지는 조용하게 둡니다. */
function getTagStyle(tag: string): string {
  if (tag === '주의') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

/** 점수를 10칸짜리 막대로 보여줍니다. 숫자 대신 '좋음/보통' 같은 말도 함께 붙입니다. */
function ScoreBar({ title, score }: { title: string; score: number | null }) {
  const filledCount = score === null ? 0 : Math.round(score / 10);

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-slate-500">{title}</span>
      <div className="flex flex-1 gap-[2px]">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-sm ${index < filledCount ? 'bg-slate-700' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-medium text-slate-700">
        {getScoreLabel(score)}
      </span>
    </div>
  );
}

interface StockCardProps {
  stock: Stock;
  onSelect: (stockCode: string) => void;
}

export default function StockCard({ stock, onSelect }: StockCardProps) {
  const gradeStyle = GRADE_STYLE[stock.grade];
  const changeDirection = getChangeDirection(stock.priceChange);

  // 한국 증시 관례에 맞춰 상승은 빨강, 하락은 파랑으로 표시합니다.
  const changeColor =
    changeDirection === 'up' ? 'text-red-600' : changeDirection === 'down' ? 'text-blue-600' : 'text-slate-500';

  return (
    <button
      type="button"
      onClick={() => onSelect(stock.stockCode)}
      className="flex w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
    >
      {/* 왼쪽 색 띠로 등급을 한 번 더 알려줍니다. */}
      <div className={`w-1 shrink-0 ${gradeStyle.bar}`} />

      <div className="flex-1 p-4 sm:p-5">
        {/* 1) 판단 + 종목명 + 가격 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="truncate text-lg font-bold text-slate-900">{stock.stockName}</h3>
              {stock.isValueTrap && (
                <span className="shrink-0 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">
                  가치 함정
                </span>
              )}
              <span className="shrink-0 text-xs tabular-nums text-slate-400">{stock.stockCode}</span>
            </div>
            <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">{stock.sector ?? '-'}</p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                {formatPrice(stock.closePrice)}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${changeColor}`}>
                {formatPriceChange(stock.priceChange)}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${gradeStyle.badge}`}>
              {GRADE_LABEL[stock.grade]}
            </span>
            <p className={`mt-1.5 text-2xl font-bold tabular-nums ${gradeStyle.score}`}>
              {stock.totalScore}
              <span className="ml-0.5 text-sm font-medium">점</span>
            </p>
          </div>
        </div>

        {/* 2) 태그 (현재는 임시 데이터) */}
        {stock.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stock.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded border px-2 py-0.5 text-xs font-medium ${getTagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 3) 판단의 근거가 되는 점수 */}
        <div className="mt-4 space-y-2">
          <ScoreBar title="수급" score={stock.supplyScore} />
          <ScoreBar title="저평가" score={stock.valueScore} />
        </div>

        {/* 4) 가치 함정 경고 - 해당될 때만 보여줍니다. */}
        {stock.isValueTrap && (
          <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
            싸 보이지만 실적과 수급이 따라오지 않고 있습니다.
          </p>
        )}

        {/* 5) 배당률 + 상세 안내 */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-500">
            배당 <span className="font-medium tabular-nums text-slate-700">{formatDividend(stock.divYield)}</span>
          </p>
          <span className="text-xs font-medium text-slate-500">자세히 보기</span>
        </div>
      </div>
    </button>
  );
}