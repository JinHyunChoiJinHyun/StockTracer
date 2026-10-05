import { STOCK_TAG_LABELS, STOCK_TAG_TONES} from "../types/stock";
import type { StockTag } from "../types/stock";

interface TagBadgeProps {
  tag: StockTag;
}

function TagBadge({ tag }: TagBadgeProps) {
  const label = STOCK_TAG_LABELS[tag];
  const tone = STOCK_TAG_TONES[tag];
  
  return <span className={`tag-chip tag-chip--${tone}`}>{label}</span>;
}

export default TagBadge;