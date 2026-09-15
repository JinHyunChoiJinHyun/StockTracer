/**
 * 종목 목록 영역입니다.
 * 로딩 / 에러 / 빈 데이터 / 정상 목록 네 가지 상태를 여기서 모두 처리합니다.
 */

import type { Stock } from '../types/Stock';
import StockCard from './StockCard';

interface StockListProps {
  stocks: Stock[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

export default function StockList({ stocks, isLoading, hasError, onRetry }: StockListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white py-20 text-center">
        <p className="text-sm text-slate-500">종목 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white py-20 text-center">
        <p className="text-sm font-medium text-slate-900">종목 데이터를 불러오지 못했습니다.</p>
        <p className="mt-1 text-sm text-slate-500">다시 시도해주세요.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white py-20 text-center">
        <p className="text-sm font-medium text-slate-900">조건에 맞는 종목이 없습니다.</p>
        <p className="mt-1 text-sm text-slate-500">검색어나 필터를 바꿔보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <StockCard key={stock.stockCode} stock={stock} />
      ))}
    </div>
  );
}