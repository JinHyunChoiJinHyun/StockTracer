/**
 * 종목 상세 페이지입니다. (주소: /stocks/005930)
 *
 * 메인 페이지가 "살펴볼 만한가"를 보여준다면, 여기서는 "왜 그렇게 판단했는가"를 보여줍니다.
 * 위에서부터 읽어 내려가면 판단 → 그래프 → 근거 숫자 순서가 되도록 배치했습니다.
 */

import { useNavigate, useParams } from 'react-router-dom';
import InvestorFlowChart from '../components/InvestorFlowChart';
import PriceChart from '../components/PriceChart';
import { useStockDetail } from '../hooks/UseStockDetail';
import type { StockDetail } from '../types/Stock';
import { GRADE_LABEL, GRADE_STYLE } from '../types/Stock';
import {
  formatDividend,
  formatMarketCap,
  formatMultiple,
  formatNetBuyAmount,
  formatPercent,
  formatPrice,
  formatPriceChange,
  formatSectorPercentile,
  formatWon,
  getChangeDirection,
  getScoreLabel,
} from '../utils/Format';

/* ------------------------------------------------------------------ */
/* 페이지 안에서만 쓰는 작은 조각들                                       */
/* ------------------------------------------------------------------ */

/** 흰 배경 카드 한 덩어리 */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** 제목 + 값 한 줄 */
function DetailRow({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{title}</span>
      <span className={`text-sm font-medium tabular-nums ${valueColor ?? 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

/** 점수를 막대 + 숫자로 같이 보여줍니다. */
function ScoreRow({ title, score }: { title: string; score: number | null }) {
  const filledRatio = score === null ? 0 : Math.min(score, 100);

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {score === null ? '-' : `${score}점`}
          <span className="ml-1.5 text-xs font-normal text-slate-500">{getScoreLabel(score)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-700" style={{ width: `${filledRatio}%` }} />
      </div>
    </div>
  );
}

/**
 * 내 종목과 섹터 평균을 나란히 비교하는 막대입니다.
 * 둘 중 큰 값을 100% 로 잡고 길이를 정합니다.
 */
function CompareRow({
  title,
  myValue,
  sectorValue,
  formatValue,
  lowerIsBetter,
}: {
  title: string;
  myValue: number | null;
  sectorValue: number | null;
  formatValue: (value: number | null) => string;
  lowerIsBetter: boolean;
}) {
  const largestValue = Math.max(myValue ?? 0, sectorValue ?? 0, 1);
  const myBarWidth = ((myValue ?? 0) / largestValue) * 100;
  const sectorBarWidth = ((sectorValue ?? 0) / largestValue) * 100;

  // 좋고 나쁨을 글자로도 알려줍니다. (PER, PBR 은 낮을수록 좋고 배당은 높을수록 좋습니다)
  let comparisonText = '-';
  if (myValue !== null && sectorValue !== null) {
    const isBetter = lowerIsBetter ? myValue < sectorValue : myValue > sectorValue;
    comparisonText = isBetter ? '섹터 평균보다 유리' : '섹터 평균보다 불리';
  }

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <span className="text-xs text-slate-500">{comparisonText}</span>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-xs text-slate-700">이 종목</span>
          <div className="h-3 flex-1 rounded-sm bg-slate-100">
            <div className="h-full rounded-sm bg-slate-700" style={{ width: `${myBarWidth}%` }} />
          </div>
          <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums text-slate-900">
            {formatValue(myValue)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-xs text-slate-400">섹터 평균</span>
          <div className="h-3 flex-1 rounded-sm bg-slate-100">
            <div className="h-full rounded-sm bg-slate-300" style={{ width: `${sectorBarWidth}%` }} />
          </div>
          <span className="w-20 shrink-0 text-right text-xs tabular-nums text-slate-500">
            {formatValue(sectorValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 상세 데이터를 한 문장으로 요약합니다.
 * 숫자를 읽기 어려운 사람이 맨 처음 읽을 문장입니다.
 */
function createSummarySentence(detail: StockDetail): string {
  const parts: string[] = [];

  if (detail.foreignNetBuyDays > 0) {
    parts.push(`외국인이 ${detail.foreignNetBuyDays}일 연속 사들이고 있고`);
  } else if (detail.supplyScore < 40) {
    parts.push('외국인과 기관이 팔고 있고');
  } else {
    parts.push('수급은 뚜렷한 방향이 없고');
  }

  if (detail.valueScore !== null && detail.valueScore >= 70) {
    parts.push('지표상으로는 싼 편입니다');
  } else if (detail.valueScore !== null && detail.valueScore < 45) {
    parts.push('지표상으로는 비싼 편입니다');
  } else {
    parts.push('가격은 평균 수준입니다');
  }

  return `${parts.join(', ')}.`;
}

/* ------------------------------------------------------------------ */
/* 페이지 본체                                                          */
/* ------------------------------------------------------------------ */

export default function StockDetailPage() {
  // 주소의 :stockCode 부분을 꺼냅니다.
  const { stockCode } = useParams<{ stockCode: string }>();
  const navigate = useNavigate();

  const { stockDetail, isLoading, hasError } = useStockDetail(stockCode ?? null);

  function handleGoBack() {
    navigate('/');
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">종목 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (hasError || stockDetail === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">종목 정보를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-slate-500">잠시 후 다시 시도해주세요.</p>
        </div>
        <button
          type="button"
          onClick={handleGoBack}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          목록으로
        </button>
      </div>
    );
  }

  const gradeStyle = GRADE_STYLE[stockDetail.grade];
  const changeDirection = getChangeDirection(stockDetail.priceChange);
  const changeColor =
    changeDirection === 'up' ? 'text-red-600' : changeDirection === 'down' ? 'text-blue-600' : 'text-slate-500';

  const netBuyColor = (amount: number | null) => {
    if (amount === null || amount === 0) return 'text-slate-900';
    return amount > 0 ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleGoBack}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            목록으로
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{stockDetail.stockName}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${gradeStyle.badge}`}>
            {GRADE_LABEL[stockDetail.grade]}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 sm:px-6">
        {/* 1. 가격과 판단 */}
        <section className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className={`w-1.5 shrink-0 ${gradeStyle.bar}`} />

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h1 className="truncate text-2xl font-bold text-slate-900">{stockDetail.stockName}</h1>
                  <span className="shrink-0 text-xs tabular-nums text-slate-400">{stockDetail.stockCode}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {stockDetail.sector ?? '-'} · 기준일 {stockDetail.baseDate}
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums text-slate-900">
                    {formatPrice(stockDetail.closePrice)}
                  </span>
                  <span className={`text-base font-semibold tabular-nums ${changeColor}`}>
                    {formatPriceChange(stockDetail.priceChange)}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-400">종합점수</p>
                <p className={`text-4xl font-bold tabular-nums ${gradeStyle.score}`}>{stockDetail.totalScore}</p>
                <p className={`text-sm font-semibold ${gradeStyle.score}`}>{GRADE_LABEL[stockDetail.grade]}</p>
              </div>
            </div>

            <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {createSummarySentence(stockDetail)}
            </p>

            {stockDetail.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
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
          </div>
        </section>

        {/* 2. 가치 함정 경고 - 해당될 때만 */}
        {stockDetail.isValueTrap && (
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-sm font-bold text-blue-900">가치 함정에 주의하세요</h2>
            <p className="mt-1 text-xs text-blue-800">
              지표만 보면 싸 보이지만, 싸진 이유가 따로 있을 수 있는 종목입니다.
            </p>
            <ul className="mt-3 space-y-1.5">
              {stockDetail.valueTrapReasons.map((reason) => (
                <li key={reason} className="text-sm text-blue-900">
                  {reason}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 3. 주가 그래프 */}
        <SectionCard title="주가 흐름">
          <PriceChart priceHistory={stockDetail.priceHistory} />
        </SectionCard>

        {/* 4. 점수 */}
        <SectionCard title="점수">
          <ScoreRow title="종합" score={stockDetail.totalScore} />
          <ScoreRow title="수급" score={stockDetail.supplyScore} />
          <ScoreRow title="저평가" score={stockDetail.valueScore} />
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            같은 섹터 안에서 {formatSectorPercentile(stockDetail.sectorPercentile)}에 있습니다.
          </p>
        </SectionCard>

        {/* 5. 수급 그래프 */}
        <SectionCard title="외국인 · 기관 수급">
          <InvestorFlowChart flowHistory={stockDetail.investorFlowHistory} />
          <div className="mt-3 border-t border-slate-100 pt-1">
            <DetailRow
              title="외국인 순매수 (최근 5일)"
              value={formatNetBuyAmount(stockDetail.foreignNetBuyAmount)}
              valueColor={netBuyColor(stockDetail.foreignNetBuyAmount)}
            />
            <DetailRow
              title="기관 순매수 (최근 5일)"
              value={formatNetBuyAmount(stockDetail.institutionNetBuyAmount)}
              valueColor={netBuyColor(stockDetail.institutionNetBuyAmount)}
            />
            <DetailRow
              title="외국인 연속 순매수"
              value={stockDetail.foreignNetBuyDays > 0 ? `${stockDetail.foreignNetBuyDays}일` : '없음'}
            />
          </div>
        </SectionCard>

        {/* 6. 섹터 평균과 비교 */}
        <SectionCard title={`${stockDetail.sector ?? '섹터'} 평균과 비교`}>
          <CompareRow
            title="PER"
            myValue={stockDetail.per}
            sectorValue={stockDetail.sectorAverage.per}
            formatValue={formatMultiple}
            lowerIsBetter
          />
          <CompareRow
            title="PBR"
            myValue={stockDetail.pbr}
            sectorValue={stockDetail.sectorAverage.pbr}
            formatValue={formatMultiple}
            lowerIsBetter
          />
          <CompareRow
            title="배당률"
            myValue={stockDetail.divYield}
            sectorValue={stockDetail.sectorAverage.divYield}
            formatValue={formatDividend}
            lowerIsBetter={false}
          />
        </SectionCard>

        {/* 7. 세부 지표 */}
        <SectionCard title="가치 지표">
          <DetailRow title="PER" value={formatMultiple(stockDetail.per)} />
          <DetailRow title="PBR" value={formatMultiple(stockDetail.pbr)} />
          <DetailRow title="EPS (주당순이익)" value={formatWon(stockDetail.eps)} />
          <DetailRow title="BPS (주당순자산)" value={formatWon(stockDetail.bps)} />
          <DetailRow title="배당률" value={formatDividend(stockDetail.divYield)} />
          <DetailRow title="EPS 성장률" value={formatPercent(stockDetail.epsGrowthRate)} />
          <DetailRow title="시가총액" value={formatMarketCap(stockDetail.marketCap)} />
        </SectionCard>
      </main>
    </div>
  );
}