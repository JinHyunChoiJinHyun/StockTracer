import { Link } from "react-router";
import type { StockSummary } from "../types/stock";
import { getTagStatus, getTagStatusClassName, getChipTags } from "../utils/tagStatus";
import { formatPrice, formatChangeRate, getChangeClassName } from "../utils/format";
import TagBadge from "./Tagbadge";

// Main Page의 종목 카드 한 장
// 카드 전체가 Link라서 어디를 클릭해도 /stocks/{stockCode} 로 이동한다.

interface StockCardProps {
  stock: StockSummary;
}

function StockCard({ stock }: StockCardProps) {
  const changeClassName = getChangeClassName(stock.changeRate);

  // status 태그 분리 (추후 api에서 분리 예정)
  const tagStatus = getTagStatus(stock.tags)
  const cardClassName = "stock-card" + getTagStatusClassName(tagStatus)

  // 일반 태그
  const tags = getChipTags(stock.tags)

  return (
    <Link to={`/stocks/${stock.stockCode}`} className="stock-card">
      {/* 1줄: 종목명 + 종목코드 / 종합점수 */}
      <div className="stock-card-top">
        <div>
          <span className="stock-name">{stock.stockName}</span>
          <span className="stock-code">{stock.stockCode}</span>
        </div>
        {/* <div className="total-score">
          <span className="total-score-label">종합점수</span>
          <span className="total-score-value">{stock.totalScore}</span>
        </div> */}
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

      {/* 4줄: 태그 (태그가 없으면 이 줄을 그리지 않음) */}
      {tags.length > 0 && (
        <div className="tag-list">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* 위험 종목이면 카드 맨 아래에 경고 문구 */}
      {tagStatus === "risk" && (
        <div className="risk-warning">⚠ 매수 주의 · 위험 신호가 있는 종목입니다</div>
      )}
    </Link>
  );
}

export default StockCard;
