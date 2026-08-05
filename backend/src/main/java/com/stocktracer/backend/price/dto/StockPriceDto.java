package com.stocktracer.backend.price.dto;

import com.stocktracer.backend.stock.domain.MarketType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class StockPriceDto {
    private String stockCode;
    private String stockName;
    private MarketType marketType;
    private LocalDate stockDate;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private Long volume;
    private BigDecimal priceChange;
}


