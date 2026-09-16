/**
 * 정렬 선택 박스입니다.
 * 여기서 고른 값(예: valueScoreDesc)이 그대로 API 의 sort 파라미터로 전달됩니다.
 */

import type { SortId } from '../types/Stock';
import { SORT_OPTIONS } from '../types/Stock';

interface SortSelectProps {
  selectedSort: SortId;
  onSortChange: (sort: SortId) => void;
}

export default function SortSelect({ selectedSort, onSortChange }: SortSelectProps) {
  return (
    <select
      value={selectedSort}
      onChange={(event) => onSortChange(event.target.value as SortId)}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}