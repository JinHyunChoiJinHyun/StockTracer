package com.stocktracer.backend.price.dto;

import com.stocktracer.backend.stock.domain.MarketType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record StockPriceDto (
    String stockCode,
    String stockName,
    MarketType marketType,
    LocalDate stockDate,
    BigDecimal openPrice,
    BigDecimal closePrice,
    BigDecimal highPrice,
    BigDecimal lowPrice,
    Long volume,
    BigDecimal priceChange
){}


