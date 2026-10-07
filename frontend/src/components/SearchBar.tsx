// 검색 입력창
// 입력값(searchText)은 부모(MainPage)가 state로 가지고 있고,
// 여기서는 값을 보여주고 바뀔 때 부모에게 알려주기만 한다.

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

function SearchBar({ searchText, onSearchTextChange }: SearchBarProps) {
  return (
    <input
      className="search-input"
      type="search"
      placeholder="종목명 또는 종목코드로 검색 (예: 삼성, 005930)"
      value={searchText}
      onChange={(event) => onSearchTextChange(event.target.value)}
    />
  );
}

export default SearchBar;
