/**
 * 페이지네이션입니다.
 *
 * 주의: currentPage 는 0부터 시작합니다. (백엔드 page 파라미터와 맞추기 위해)
 * 화면에 보여줄 때만 +1 해서 1, 2, 3... 으로 표시합니다.
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** 현재 페이지 주변으로 최대 5개의 페이지 번호만 만듭니다. */
function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisible = 5;

  let startPage = currentPage - 2;
  if (startPage < 0) {
    startPage = 0;
  }
  if (startPage > totalPages - maxVisible) {
    startPage = totalPages - maxVisible;
  }
  if (startPage < 0) {
    startPage = 0;
  }

  const lastPage = Math.min(startPage + maxVisible, totalPages);

  const pages: number[] = [];
  for (let page = startPage; page < lastPage; page++) {
    pages.push(page);
  }
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  const buttonStyle =
    'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={buttonStyle}
      >
        이전
      </button>

      {visiblePages.map((page) => {
        const isSelected = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={
              isSelected
                ? 'min-w-[2.25rem] rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white'
                : `min-w-[2.25rem] ${buttonStyle}`
            }
          >
            {page + 1}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={buttonStyle}
      >
        다음
      </button>
    </nav>
  );
}