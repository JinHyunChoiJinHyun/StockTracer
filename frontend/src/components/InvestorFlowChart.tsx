/**
 * 최근 20 영업일 외국인·기관 순매수 막대 그래프입니다.
 *
 * 가운데 선(0)을 기준으로 위로 올라가면 사들인 날, 아래로 내려가면 팔아치운 날입니다.
 * 하루마다 막대를 두 개(외국인, 기관) 나란히 그립니다.
 */

import type { InvestorFlowPoint } from '../types/Stock';
import { formatNetBuyAmount } from '../utils/Format';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 120;

/** 0 기준선의 y 좌표 (가운데) */
const ZERO_LINE_Y = CHART_HEIGHT / 2;

export default function InvestorFlowChart({ flowHistory }: { flowHistory: InvestorFlowPoint[] }) {
  if (flowHistory.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">수급 데이터가 없습니다.</p>;
  }

  // 위아래로 가장 큰 값을 찾아서, 그 값이 차트 높이의 절반이 되도록 맞춥니다.
  const allAmounts = flowHistory.flatMap((point) => [point.foreignNetBuy, point.institutionNetBuy]);
  const maxAbsAmount = Math.max(...allAmounts.map((amount) => Math.abs(amount)), 1);

  const slotWidth = CHART_WIDTH / flowHistory.length;
  const barWidth = slotWidth * 0.35;

  /** 금액을 막대 높이(픽셀)로 바꿉니다. */
  function toBarHeight(amount: number): number {
    return (Math.abs(amount) / maxAbsAmount) * (ZERO_LINE_Y - 4);
  }

  /** 막대의 시작 y 좌표입니다. 플러스면 기준선 위로, 마이너스면 아래로 그립니다. */
  function toBarTop(amount: number): number {
    return amount >= 0 ? ZERO_LINE_Y - toBarHeight(amount) : ZERO_LINE_Y;
  }

  const foreignTotal = flowHistory.reduce((total, point) => total + point.foreignNetBuy, 0);
  const institutionTotal = flowHistory.reduce((total, point) => total + point.institutionNetBuy, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">최근 20일 순매수 (억원)</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-sm bg-slate-700" />
            외국인
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-sm bg-slate-300" />
            기관
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="mt-2 h-36 w-full"
        role="img"
        aria-label="최근 20일 외국인과 기관의 일별 순매수 막대 그래프"
      >
        {/* 0 기준선 */}
        <line x1={0} y1={ZERO_LINE_Y} x2={CHART_WIDTH} y2={ZERO_LINE_Y} className="stroke-slate-300" strokeWidth={1} />

        {flowHistory.map((point, index) => {
          const slotLeft = index * slotWidth;

          return (
            <g key={point.date}>
              <rect
                x={slotLeft + slotWidth * 0.1}
                y={toBarTop(point.foreignNetBuy)}
                width={barWidth}
                height={toBarHeight(point.foreignNetBuy)}
                className="fill-slate-700"
              />
              <rect
                x={slotLeft + slotWidth * 0.55}
                y={toBarTop(point.institutionNetBuy)}
                width={barWidth}
                height={toBarHeight(point.institutionNetBuy)}
                className="fill-slate-300"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{flowHistory[0].date.slice(5)}</span>
        <span>{flowHistory[flowHistory.length - 1].date.slice(5)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-400">외국인 20일 합계</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-700">
            {formatNetBuyAmount(foreignTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">기관 20일 합계</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-700">
            {formatNetBuyAmount(institutionTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}