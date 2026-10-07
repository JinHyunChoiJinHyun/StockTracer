interface PaginationProps {
  currentPage: number; // 현재 페이지 (1부터 시작)
  totalPages: number; // 전체 페이지 수
  onPageChange: (page: number) => void;
}
 
// 화면에 그릴 항목: 페이지 번호(number) 또는 말줄임("...")
type PageItem = number | "...";
 
// -----------------------------------------------
// 화면에 보여줄 번호 목록 만들기
// 예) currentPage = 5, totalPages = 10 → [1, "...", 4, 5, 6, "...", 10]
// -----------------------------------------------
function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  // 1단계: 보여줄 페이지 번호를 모은다 (중복·범위 밖 번호는 넣지 않음)
  const pages: number[] = [];
 
  function addPage(page: number) {
    const isInRange = page >= 1 && page <= totalPages;
    if (isInRange && !pages.includes(page)) {
      pages.push(page);
    }
  }
 
  addPage(1); // 첫 페이지는 항상
  addPage(totalPages); // 마지막 페이지도 항상
  addPage(currentPage - 1); // 현재 페이지의 앞
  addPage(currentPage); // 현재 페이지
  addPage(currentPage + 1); // 현재 페이지의 뒤
 
  // 앞쪽에 있을 때는 1 2 3 이 보이도록
  if (currentPage <= 3) {
    addPage(2);
    addPage(3);
  }
  // 뒤쪽에 있을 때는 마지막 3개가 보이도록
  if (currentPage >= totalPages - 2) {
    addPage(totalPages - 1);
    addPage(totalPages - 2);
  }
 
  // 작은 번호부터 순서대로
  pages.sort((a, b) => a - b);
 
  // 2단계: 번호 사이가 비어 있으면 "..."을 끼워 넣는다
  const items: PageItem[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
 
    if (i > 0) {
      const previousPage = pages[i - 1];
      const gap = page - previousPage;
 
      if (gap === 2) {
        // 1 과 3 사이처럼 하나만 빠졌으면 "..." 대신 그 번호(2)를 그냥 보여줌
        items.push(previousPage + 1);
      } else if (gap > 2) {
        items.push("...");
      }
    }
 
    items.push(page);
  }
 
  return items;
}
 
function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 페이지가 1개 이하면 굳이 버튼을 보여주지 않음
  if (totalPages <= 1) {
    return null;
  }
 
  const pageItems = getPageItems(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
 
  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="page-button page-arrow"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="이전 페이지"
      >
        ‹
      </button>
 
      {pageItems.map((item, index) => {
        // 말줄임표는 누를 수 없는 글자로 표시
        if (item === "...") {
          return (
            <span key={`ellipsis-${index}`} className="page-ellipsis">
              …
            </span>
          );
        }
 
        const isCurrent = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            className={isCurrent ? "page-button is-current" : "page-button"}
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        );
      })}
 
      <button
        type="button"
        className="page-button page-arrow"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}
 
export default Pagination;
 
