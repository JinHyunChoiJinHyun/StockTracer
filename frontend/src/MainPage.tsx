/**
 * 메인 페이지입니다.
 * 데이터 관련 로직은 전부 useStockList 훅에 있고, 여기서는 화면 조립만 합니다.
 */

import FilterBar from './components/FilterBar';
import PageHeader from './components/PageHeader';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import SortSelect from './components/SortSelect';
import StockList from './components/StockList';
import { useStockList } from './hooks/useStockList';

export default function MainPage() {
  const {
    stocks,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    hasError,
    selectedFilter,
    selectedSort,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleRetry,
  } = useStockList();

  const baseDate = stocks.length > 0 ? stocks[0].baseDate : '-';

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader baseDate={baseDate} />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <SearchBar onSearch={handleSearch} />

        <div className="mt-4">
          <FilterBar selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {isLoading ? '불러오는 중' : `전체 ${totalCount.toLocaleString('ko-KR')}종목`}
          </p>
          <SortSelect selectedSort={selectedSort} onSortChange={handleSortChange} />
        </div>

        <div className="mt-4">
          <StockList stocks={stocks} isLoading={isLoading} hasError={hasError} onRetry={handleRetry} />
        </div>

        {!isLoading && !hasError && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}