package com.stocktracer.backend.stock.dto;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record StockInfoDto(
        String stockCode,
        String stockName,
        String market
){
    public StockInfo toDomain(){
        return StockInfo.create(this.stockCode, this.stockName, MarketType.parseMarketType(this.market));
    }
}
