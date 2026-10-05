import { Link } from "react-router";
import { STOCK_STATUS_CLASS, STOCK_STATUS_LABELS, type StockSummary } from "../types/stock";
import { formatPrice, formatChangeRate, getChangeClassName } from "../utils/format";
import TagBadge from "./Tagbadge";

// Main Page의 종목 카드 한 장
// 카드 전체가 Link라서 어디를 클릭해도 /stocks/{stockCode} 로 이동한다.

interface StockCardProps {
  stock: StockSummary;
}

function StockCard({ stock }: StockCardProps) {
  const changeClassName = getChangeClassName(stock.changeRate);

  const statusLabel = stock.status ? STOCK_STATUS_LABELS[stock.status] : "";
  const statusClass = stock.status ? STOCK_STATUS_CLASS[stock.status] : "";

  return (
    <Link to={`/stocks/${stock.stockCode}`} className="stock-card">
      {/* 1줄: 종목명 + 종목코드 / 종합점수 */}
      <div className="stock-card-top">
        <div>
          <span className="stock-name">{stock.stockName}</span>
          <span className="stock-code">{stock.stockCode}</span>
        </div>
        <div className="stock-status">
          {/* <span className="status-title">상태</span> */}
          <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>

      {/* 2줄: 시장 / 업종 */}
      <div className="stock-meta">
        {stock.market} · {stock.sector}
      </div>

      {/* 3줄: 현재가, 등락률, 매수 관심 신호 */}
      <div className="stock-card-price-row">
        <span className="stock-price">{formatPrice(stock.closePrice)}</span>
        <span className={"stock-change " + changeClassName}>
          {formatChangeRate(stock.changeRate)}
        </span>
      </div>

      {/* 4줄: 태그 */}
      {stock.tags.length > 0 && (
        <div className="tag-list">
          {stock.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}

export default StockCard;
