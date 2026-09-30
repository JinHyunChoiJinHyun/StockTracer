import { STOCK_TAGS, type StockTag } from "../types/stock";

interface TagFilterBarProps {
  selectedTags: StockTag[];
  onToggle: (tag: StockTag) => void;
  /** [전체] 클릭 — 선택된 태그 모두 해제 */
  onClear: () => void;
}

export default function TagFilterBar({ selectedTags, onToggle, onClear }: TagFilterBarProps) {
  const isAll = selectedTags.length === 0;

  return (
    <div className="tag-filter" role="group" aria-label="태그 필터 (여러 개 선택 시 모두 포함)">
      <button
        type="button"
        className={`chip${isAll ? " chip--active" : ""}`}
        aria-pressed={isAll}
        onClick={onClear}
      >
        전체
      </button>

      {STOCK_TAGS.map((tag) => {
        const active = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`chip${active ? " chip--active" : ""}`}
            aria-pressed={active}
            onClick={() => onToggle(tag)}
          >
            {active && (
              <span className="chip__check" aria-hidden="true">
                ✓
              </span>
            )}
            {tag}
          </button>
        );
      })}
    </div>
  );
}
