package com.stocktracer.backend.stock.repository.interfaces;

import com.stocktracer.backend.stock.domain.StockInfo;

import java.util.List;
import java.util.Optional;

public interface StockInfoRepository {
    Optional<StockInfo> findByStockCode(String stockCode);
    List<StockInfo> findAllByStockCodeIn(List<String> stockCodes);
    void save(StockInfo stockInfo);
}
