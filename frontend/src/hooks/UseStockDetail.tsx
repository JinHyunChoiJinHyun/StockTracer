/**
 * 선택한 종목 하나의 상세 정보를 불러오는 훅입니다.
 *
 * stockCode 가 null 이면 아무것도 불러오지 않습니다. (상세창이 닫혀 있는 상태)
 */

import { useEffect, useState } from 'react';
import { fetchStockDetail } from '../api/StockApi';
import type { StockDetail } from '../types/Stock';

export function useStockDetail(stockCode: string | null) {
  const [stockDetail, setStockDetail] = useState<StockDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (stockCode === null) {
      setStockDetail(null);
      setHasError(false);
      return;
    }

    // 다른 종목을 빠르게 연달아 열었을 때, 늦게 도착한 옛날 응답을 무시하기 위한 플래그입니다.
    let isLatestRequest = true;

    async function loadStockDetail(code: string) {
      setIsLoading(true);
      setHasError(false);
      setStockDetail(null);

      try {
        const detail = await fetchStockDetail(code);
        if (!isLatestRequest) return;
        setStockDetail(detail);
      } catch (error) {
        if (!isLatestRequest) return;
        console.error('종목 상세를 불러오지 못했습니다.', error);
        setHasError(true);
      } finally {
        if (isLatestRequest) {
          setIsLoading(false);
        }
      }
    }

    loadStockDetail(stockCode);

    return () => {
      isLatestRequest = false;
    };
  }, [stockCode]);

  return { stockDetail, isLoading, hasError };
}