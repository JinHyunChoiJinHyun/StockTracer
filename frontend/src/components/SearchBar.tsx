import type { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** 입력 즉시 필터링. 검색 버튼/Enter는 모바일 키보드를 닫는 용도 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <div className="search__field">
        <input
          className="search__input"
          type="search"
          inputMode="search"
          placeholder="종목명 또는 종목코드 검색"
          aria-label="종목명 또는 종목코드 검색"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="search__clear"
            aria-label="검색어 지우기"
            onClick={() => onChange("")}
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className="search__button">
        검색
      </button>
    </form>
  );
}
