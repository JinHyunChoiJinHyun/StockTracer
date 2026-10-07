import { fetchMainStocks, fetchStockDetail, getCachedMainStocks } from "../api/stockApi";
import { useAsync } from "./useAsync";

export function useMainStocks() {
  return useAsync(
    (signal, force) => fetchMainStocks(signal, { force }),
    [],
    getCachedMainStocks(),
  );
}

export function useStockDetail(stockCode: string) {
  return useAsync((signal) => fetchStockDetail(stockCode, signal), [stockCode]);
}
