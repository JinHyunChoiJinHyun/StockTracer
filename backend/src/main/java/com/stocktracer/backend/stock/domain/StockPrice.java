package com.stocktracer.backend.stock.domain;

import com.stocktracer.backend.stock.repository.entitiy.StockEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPrice {
    private String stockCode;
    private LocalDate priceDate;
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal closePrice;
    private Long volume;
    private BigDecimal priceChange;
    private BigDecimal priceChangeRate;
    private Stock stock;
}
