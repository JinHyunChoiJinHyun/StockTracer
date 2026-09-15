/**
 * 종목 한 개를 보여주는 카드입니다.
 *
 * 정보 순서를 일부러 이렇게 잡았습니다.
 *   1) 등급(매수 관심 / 주의)  ← 가장 먼저 보여야 하는 판단
 *   2) 종목명
 *   3) 가격과 등락률
 *   4) 태그 (판단의 요약)
 *   5) 수급 / 저평가 점수 막대 (판단의 근거)
 *   6) PER, PBR, 배당 (세부 지표)
 */

import type { Stock, StockGrade } from '../types/Stock';
import { GRADE_LABEL } from '../types/Stock';
import {
  formatDividend,
  formatMultiple,
  formatPercent,
  formatPrice,
  formatPriceChange,
  getChangeDirection,
  getScoreLabel,
} from '../utils/Format';

/** 등급별 색상입니다. 색만으로 뜻을 전달하지 않도록 글자(GRADE_LABEL)도 항상 함께 보여줍니다. */
const GRADE_STYLE: Record<StockGrade, { badge: string; bar: string; score: string }> = {
  BUY_INTEREST: { badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', score: 'text-red-600' },
  INTEREST: { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', score: 'text-amber-600' },
  NEUTRAL: { badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-400', score: 'text-slate-600' },
  CAUTION: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', score: 'text-blue-600' },
};

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

/** 카드 아래쪽 세부 지표 한 칸입니다. */
function MetricItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-700">{value}</p>
    </div>
  );
}

export default function StockCard({ stock }: { stock: Stock }) {
  const gradeStyle = GRADE_STYLE[stock.grade];
  const changeDirection = getChangeDirection(stock.priceChange);

  // 한국 증시 관례에 맞춰 상승은 빨강, 하락은 파랑으로 표시합니다.
  const changeColor =
    changeDirection === 'up' ? 'text-red-600' : changeDirection === 'down' ? 'text-blue-600' : 'text-slate-500';

  return (
    <article className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* 왼쪽 색 띠로 등급을 한 번 더 알려줍니다. */}
      <div className={`w-1 shrink-0 ${gradeStyle.bar}`} />

      <div className="flex-1 p-4 sm:p-5">
        {/* 1) 판단 + 종목명 + 가격 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="truncate text-lg font-bold text-slate-900">{stock.stockName}</h3>
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

        {/* 4) 세부 지표 (모바일에서는 EPS 성장률을 숨깁니다) */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
          <MetricItem title="PER" value={formatMultiple(stock.per)} />
          <MetricItem title="PBR" value={formatMultiple(stock.pbr)} />
          <MetricItem title="배당" value={formatDividend(stock.divYield)} />
          <div className="hidden sm:block">
            <MetricItem title="EPS 성장" value={formatPercent(stock.epsGrowthRate)} />
          </div>
        </div>
      </div>
    </article>
  );
}