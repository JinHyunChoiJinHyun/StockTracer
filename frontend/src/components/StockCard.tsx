import { Link } from "react-router-dom";
import type { Stock } from "../types/stock";
import ScoreBar from "./ScoreBar";
import StockTagLabel from "./StockTag";
import {
  clampScore,
  formatChangeRate,
  formatDividend,
  formatPrice,
  getJudgment,
} from "../utils/stock";

interface StockCardProps {
  stock: Stock;
}

function getDirection(rate: number): "up" | "down" | "flat" {
  return rate > 0 ? "up" : rate < 0 ? "down" : "flat";
}

export function ChangeRate({ rate }: { rate: number }) {
  const direction = getDirection(rate);
  return (
    <span className={`change change--${direction}`}>
      {direction === "up" ? "▲ " : direction === "down" ? "▼ " : ""}
      {formatChangeRate(rate)}
    </span>
  );
}

export function JudgmentBadge({ stock }: { stock: Stock }) {
  const judgment = getJudgment(stock);
  const key = judgment.replace(" ", "");
  return (
    <span className="judgment">
      <span className={`dot dot--${key}`} aria-hidden="true" />
      {judgment}
    </span>
  );
}

/** 카드 전체가 상세 페이지(/stocks/:stockCode) 링크 */
export default function StockCard({ stock }: StockCardProps) {
  return (
    <Link
      to={`/stocks/${stock.stockCode}`}
      className="card stock-card"
      aria-label={`${stock.stockName} ${stock.stockCode} 상세 보기`}
    >
      <div className="stock-card__identity">
        <h2 className="card__name">
          {stock.stockName}
          <span className="card__code">{stock.stockCode}</span>
        </h2>
        <p className="card__sub">
          <span className="market">{stock.market}</span>
          {stock.sector}
        </p>
      </div>

      <div className="stock-card__total">
        <JudgmentBadge stock={stock} />
        <span className="total-score">
          <small>종합점수</small>
          <strong>{clampScore(stock.totalScore)}</strong>
        </span>
      </div>

      <p className="card__price stock-card__price">
        {formatPrice(stock.price)}
        <ChangeRate rate={stock.changeRate} />
      </p>

      <div className="tags stock-card__tags">
        {stock.tags.length === 0 ? (
          <span className="tag tag--none">해당 태그 없음</span>
        ) : (
          stock.tags.map((tag) => <StockTagLabel key={tag} tag={tag} />)
        )}
      </div>

      <div className="stock-card__scores">
        <ScoreBar label="수급" score={stock.flowScore} />
        <ScoreBar label="저평가" score={stock.valueScore} />
      </div>

      <div className="stock-card__footer">
        <span>
          배당 <strong>{formatDividend(stock.dividendYield)}</strong>
        </span>
        <span className="stock-card__more" aria-hidden="true">
          자세히 보기 →
        </span>
      </div>
    </Link>
  );
}
