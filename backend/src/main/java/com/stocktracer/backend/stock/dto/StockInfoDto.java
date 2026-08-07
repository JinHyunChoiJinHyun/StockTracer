package com.stocktracer.backend.stock.dto;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;

public record StockInfoDto(
        String stockCode,
        String stockName,
        String market
){
    public StockInfo toDomain(){
        return new StockInfo(this.stockCode, this.stockName, MarketType.parseMarketType(this.market));
    }
}
