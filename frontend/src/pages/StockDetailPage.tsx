import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { StockDetail, PriceHistory, FlowHistory } from "../types/stock";
import { getStockDetail, getPriceHistory, getFlowHistory } from "../api/stockApi";
import {
  formatPrice,
  formatChangeRate,
  getChangeClassName,
  formatEok,
} from "../utils/format";
import ScoreCard from "../components/ScoreCard";
import StockChart from "../components/StockChart";
import type { ChartLine } from "../components/StockChart";

// 수급 그래프에 그릴 선 3개 (FlowHistory의 필드 이름과 dataKey가 같아야 함)
const FLOW_LINES: ChartLine[] = [
  { dataKey: "institution", name: "기관", color: "#d97706" },
  { dataKey: "foreign", name: "외국인", color: "#2563eb" },
  { dataKey: "individual", name: "개인", color: "#9ca3af" },
];

// 종가 그래프에 그릴 선 1개
const PRICE_LINES: ChartLine[] = [
  { dataKey: "close", name: "종가", color: "#1f2937" },
];

function StockDetailPage() {
  // URL /stocks/:stockCode 에서 stockCode 꺼내기 (예: "005930")
  const { stockCode } = useParams();

  // ----- state -----
  const [stock, setStock] = useState<StockDetail | null>(null); // 종목 상세 정보
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]); // 종가 그래프 데이터
  const [flowHistory, setFlowHistory] = useState<FlowHistory[]>([]); // 수급 그래프 데이터
  const [isLoading, setIsLoading] = useState(true);

  // ----- stockCode가 정해지면 데이터 3종류 불러오기 -----
  useEffect(() => {
    async function loadStock(code: string) {
      setIsLoading(true);
      const detail = await getStockDetail(code);
      const prices = await getPriceHistory(code);
      const flows = await getFlowHistory(code);
      setStock(detail);
      setPriceHistory(prices);
      setFlowHistory(flows);
      setIsLoading(false);
    }

    if (stockCode !== undefined) {
      window.scrollTo(0, 0); // 목록에서 스크롤한 위치가 아니라 페이지 맨 위부터 보이도록
      loadStock(stockCode);
    }
  }, [stockCode]);

  // ----- 불러오는 중 -----
  if (isLoading) {
    return (
      <div className="page">
        <p className="page-subtitle">불러오는 중...</p>
      </div>
    );
  }

  // ----- 해당 종목이 없을 때 -----
  if (stock === null) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← 종목 목록</Link>
        <div className="empty-box">
          <p>종목코드 {stockCode}에 해당하는 종목을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const buySignal = getBuySignal(stock.totalScore);

  // 최근 20일 종가 변화율 = (마지막 종가 - 첫 종가) / 첫 종가
  let periodChangeRate = 0;
  if (priceHistory.length >= 2) {
    const firstClose = priceHistory[0].close;
    const lastClose = priceHistory[priceHistory.length - 1].close;
    periodChangeRate = ((lastClose - firstClose) / firstClose) * 100;
  }

  // 최근 5거래일 투자자별 순매수 합계 (태그 이유를 숫자로 확인하는 용도)
  const recentFlows = flowHistory.slice(-5);
  let institutionSum = 0;
  let foreignSum = 0;
  let individualSum = 0;
  for (const flow of recentFlows) {
    institutionSum += flow.institution;
    foreignSum += flow.foreign;
    individualSum += flow.individual;
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">← 종목 목록</Link>

      {/* ===== 기본 정보 ===== */}
      <section className="section detail-header">
        <div className="detail-header-main">
          <h1 className="detail-name">{stock.stockName}</h1>
          <div className="stock-meta">
            {stock.stockCode} · {stock.market} · {stock.sector}
          </div>
          <div className="detail-price-row">
            <span className="detail-price">{formatPrice(stock.price)}</span>
            <span className={"stock-change " + getChangeClassName(stock.changeRate)}>
              {formatChangeRate(stock.changeRate)}
            </span>
          </div>
        </div>

        <div className="detail-header-side">
          <span className="buy-signal buy-signal-large">
            {getBuySignalEmoji(buySignal)} {buySignal}
          </span>
          <div className="total-score">
            <span className="total-score-label">종합점수</span>
            <span className="total-score-value">{stock.totalScore}</span>
          </div>
        </div>

        {stock.tags.length > 0 && (
          <div className="tag-list detail-tags">
            {stock.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ===== 핵심 지표 ===== */}
      <section className="section">
        <h2 className="section-title">핵심 지표</h2>
        <div className="score-grid">
          <ScoreCard label="종합점수" value={`${stock.totalScore}점`} />
          <ScoreCard label="수급 점수" value={`${stock.flowScore}점`} />
          <ScoreCard label="저평가 점수" value={`${stock.valueScore}점`} />
          <ScoreCard label="배당수익률" value={`${stock.dividendYield.toFixed(1)}%`} />
          <ScoreCard label="PER" value={`${stock.per.toFixed(2)}배`} />
          <ScoreCard label="PBR" value={`${stock.pbr.toFixed(2)}배`} />
          <ScoreCard label="EPS" value={formatPrice(stock.eps)} />
          <ScoreCard label="BPS" value={formatPrice(stock.bps)} />
        </div>
      </section>

      {/* ===== 종가 추이 ===== */}
      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">최근 {priceHistory.length}일 종가 추이</h2>
          <span className={"section-note " + getChangeClassName(periodChangeRate)}>
            기간 {formatChangeRate(periodChangeRate)}
          </span>
        </div>
        <StockChart data={priceHistory} lines={PRICE_LINES} formatValue={formatPrice} />
      </section>

      {/* ===== 투자자별 수급 추이 ===== */}
      <section className="section">
        <div className="section-title-row">
          <h2 className="section-title">최근 {flowHistory.length}일 투자자별 순매수</h2>
          <span className="section-note">단위: 억원</span>
        </div>
        <div className="flow-summary">
          <span>최근 5일 합계</span>
          <span>기관 <strong>{formatEok(institutionSum)}</strong></span>
          <span>외국인 <strong>{formatEok(foreignSum)}</strong></span>
          <span>개인 <strong>{formatEok(individualSum)}</strong></span>
        </div>
        <StockChart
          data={flowHistory}
          lines={FLOW_LINES}
          formatValue={formatEok}
          showZeroLine={true}
        />
      </section>

      {/* ===== 태그 분석 ===== */}
      <section className="section">
        <h2 className="section-title">태그 분석</h2>
        {stock.tags.length === 0 && (
          <p className="muted">이 종목에는 오늘 붙은 태그가 없습니다.</p>
        )}
        <ul className="reason-list">
          {stock.tags.map((tag) => {
            // 이유가 없는 태그라면 안내 문구를 대신 보여줌
            const reason = stock.tagReasons[tag] ?? "분석 이유가 아직 등록되지 않았습니다.";
            return (
              <li key={tag} className="reason-item">
                <span className="tag">{tag}</span>
                <p className="reason-text">{reason}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mock-notice">
        화면 테스트용 Mock 데이터입니다. 실제 주가·수급과 다릅니다.
      </p>
    </div>
  );
}

export default StockDetailPage;
