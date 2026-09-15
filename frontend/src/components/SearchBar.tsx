/**
 * 종목명 / 종목코드 검색창입니다.
 * 입력 중인 글자는 이 컴포넌트가 가지고 있고, 검색 버튼(또는 Enter)을 눌렀을 때만 부모에게 알려줍니다.
 */

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit() {
    onSearch(inputValue);
  }

  function handleReset() {
    setInputValue('');
    onSearch('');
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleSubmit();
        }}
        placeholder="종목명 또는 종목코드 검색"
        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleSubmit}
        className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        검색
      </button>

      {inputValue !== '' && (
        <button
          type="button"
          onClick={handleReset}
          className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          초기화
        </button>
      )}
    </div>
  );
}