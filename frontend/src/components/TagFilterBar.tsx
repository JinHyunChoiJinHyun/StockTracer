import { ALL_TAGS } from "../types/stock";
import type { StockTag } from "../types/stock";

// 태그 필터 버튼 줄
// - selectedTags가 빈 배열이면 [전체]가 선택된 상태
// - 태그는 여러 개 선택 가능 (실제 필터링은 MainPage에서 AND 조건으로 처리)

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
        className={isAllSelected ? "filter-chip is-selected" : "filter-chip"}
        aria-pressed={isAllSelected}
        onClick={handleAllClick}
      >
        전체
      </button>

      {ALL_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={isSelected ? "filter-chip is-selected" : "filter-chip"}
            aria-pressed={isSelected}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export default TagFilterBar;
