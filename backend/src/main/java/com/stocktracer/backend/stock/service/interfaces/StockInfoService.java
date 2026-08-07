package com.stocktracer.backend.stock.service.interfaces;

import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;

import java.util.List;

public interface StockInfoService {
    void saveOrUpdateStocks(List<StockInfoDto> dtos);
    StockInfo findByStockCode(String stockCode);
}
