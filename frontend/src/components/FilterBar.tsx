/**
 * 필터 버튼들입니다. 선택된 버튼만 진하게 표시합니다.
 * 어떤 필터가 있는지는 types/stock.ts 의 FILTER_OPTIONS 에 정의되어 있습니다.
 */

import type { FilterId } from '../types/Stock';
import { FILTER_OPTIONS } from '../types/Stock';

interface FilterBarProps {
  selectedFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
}

export default function FilterBar({ selectedFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = option.id === selectedFilter;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onFilterChange(option.id)}
            className={
              isSelected
                ? 'rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white'
                : 'rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50'
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}