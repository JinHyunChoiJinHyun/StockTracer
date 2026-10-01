import { STOCK_TAG_LABELS } from "../types/stock";
import type { StockTag } from "../types/stock";

interface TagBadgeProps {
  tag: StockTag;
}

function TagBadge({ tag }: TagBadgeProps) {
  const label = STOCK_TAG_LABELS[tag];

  if (tag === "RECOMMENDED") {
    return <span className="tag tag-recommend">{label}</span>;
  }

  if (tag === "RISK") {
    return <span className="tag tag-risk">{label}</span>;
  }

  return <span className="tag">{label}</span>;
}

export default TagBadge;