/**
 * 최근 20 영업일 주가 그래프입니다.
 *
 * 차트 라이브러리를 쓰지 않고 SVG 를 직접 그립니다.
 * 하는 일은 딱 하나입니다: 가격 배열을 화면 좌표(x, y)로 바꿔서 선으로 잇는 것.
 */

import type { PricePoint } from '../types/Stock';
import { formatPrice } from '../utils/Format';

/** SVG 안에서 쓰는 좌표 크기입니다. 실제 픽셀이 아니라 비율로 동작합니다. */
const CHART_WIDTH = 320;
const CHART_HEIGHT = 120;
const PADDING_Y = 8;

export default function PriceChart({ priceHistory }: { priceHistory: PricePoint[] }) {
  if (priceHistory.length < 2) {
    return <p className="py-10 text-center text-sm text-slate-400">주가 데이터가 없습니다.</p>;
  }

  const prices = priceHistory.map((point) => point.closePrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // 최고가와 최저가가 같으면 0으로 나누게 되므로 최소 1로 막아둡니다.
  const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const periodChangeRate = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isRising = periodChangeRate >= 0;

  /** 가격 하나를 화면 좌표로 바꿉니다. */
  function toPoint(price: number, index: number): { x: number; y: number } {
    const x = (index / (prices.length - 1)) * CHART_WIDTH;
    const ratio = (price - minPrice) / priceRange;
    const y = CHART_HEIGHT - PADDING_Y - ratio * (CHART_HEIGHT - PADDING_Y * 2);
    return { x, y };
  }

  const linePoints = prices.map((price, index) => {
    const point = toPoint(price, index);
    return `${point.x},${point.y}`;
  });

  // 선 아래를 채우기 위해, 선의 양 끝을 바닥까지 내려서 닫아줍니다.
  const areaPoints = [`0,${CHART_HEIGHT}`, ...linePoints, `${CHART_WIDTH},${CHART_HEIGHT}`];

  const lineColor = isRising ? 'stroke-red-500' : 'stroke-blue-500';
  const areaColor = isRising ? 'fill-red-500/10' : 'fill-blue-500/10';
  const textColor = isRising ? 'text-red-600' : 'text-blue-600';

  const lastPoint = toPoint(lastPrice, prices.length - 1);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-slate-400">최근 20일 주가</p>
        <p className={`text-sm font-semibold tabular-nums ${textColor}`}>
          {isRising ? '+' : ''}
          {periodChangeRate.toFixed(2)}%
        </p>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="mt-2 h-36 w-full"
        role="img"
        aria-label={`최근 20일 주가 추이, 기간 변동률 ${periodChangeRate.toFixed(2)}퍼센트`}
      >
        <polygon points={areaPoints.join(' ')} className={areaColor} />
        <polyline
          points={linePoints.join(' ')}
          fill="none"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          className={lineColor}
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r={3} vectorEffect="non-scaling-stroke" className="fill-slate-900" />
      </svg>

      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{priceHistory[0].date.slice(5)}</span>
        <span>{priceHistory[priceHistory.length - 1].date.slice(5)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-400">20일 최저</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-700">{formatPrice(minPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">20일 최고</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-700">{formatPrice(maxPrice)}</p>
        </div>
      </div>
    </div>
  );
}