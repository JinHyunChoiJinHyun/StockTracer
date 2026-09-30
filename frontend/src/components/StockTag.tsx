import type { StockTag } from "../types/stock";

interface StockTagLabelProps {
  tag: StockTag;
}

/** 카드·상세 페이지에서 쓰는 태그 표시 (가치 함정은 경고 색) */
export default function StockTagLabel({ tag }: StockTagLabelProps) {
  return <span className={`tag${tag === "가치 함정" ? " tag--warn" : ""}`}>{tag}</span>;
}
