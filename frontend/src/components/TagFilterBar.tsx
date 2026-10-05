import {STOCK_TAG_LABELS } from "../types/stock";
import type { StockTag } from "../types/stock";

const TAG_OPTIONS = Object.keys(STOCK_TAG_LABELS) as StockTag[];

interface TagFilterBarProps {
  selectedTags: StockTag[];
  onSelectedTagsChange: (tags: StockTag[]) => void;
}

function TagFilterBar({ selectedTags, onSelectedTagsChange }: TagFilterBarProps) {
  const isAllSelected = selectedTags.length === 0;

  // [전체] 클릭 → 선택된 태그를 모두 해제
  function handleAllClick() {
    onSelectedTagsChange([]);
  }

  // 태그 클릭 → 이미 선택돼 있으면 빼고, 아니면 추가
  function handleTagClick(tag: StockTag) {
    if (selectedTags.includes(tag)) {
      const nextTags = selectedTags.filter((selectedTag) => selectedTag !== tag);
      onSelectedTagsChange(nextTags);
    } else {
      onSelectedTagsChange([...selectedTags, tag]);
    }
  }

  return (
    <div className="tag-filter-bar">
      <button
        type="button"
        className={isAllSelected ? "filter-tag is-selected" : "filter-tag"}
        aria-pressed={isAllSelected}
        onClick={handleAllClick}
      >
        전체
      </button>

      {TAG_OPTIONS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={isSelected ? "filter-tag is-selected" : "filter-tag"}
            aria-pressed={isSelected}
            onClick={() => handleTagClick(tag)}
          >
            {STOCK_TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}

export default TagFilterBar;
