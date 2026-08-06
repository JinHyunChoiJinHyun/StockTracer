package com.stocktracer.backend.price.dto;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.MarketType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record StockPriceResponseDto(
    String stockCode,
    String stockName,
    MarketType marketType,
    LocalDate stockDate,
    BigDecimal openPrice,
    BigDecimal closePrice,
    BigDecimal lowPrice,
    BigDecimal highPrice,
    BigDecimal priceChange,
    Long volume
){
}


