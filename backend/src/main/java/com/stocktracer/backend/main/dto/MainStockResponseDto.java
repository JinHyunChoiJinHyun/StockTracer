package com.stocktracer.backend.main.dto;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.main.mapper.MainStockRow;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.value.domain.ValueFundamental;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static java.awt.SystemColor.info;

public record MainStockResponseDto(
        String stockCode,
        String stockName,
        String market,
        String sector,

        BigDecimal closePrice,
        BigDecimal changeRate,
        BigDecimal marketCap,
        BigDecimal tradingValue,

        BigDecimal flowScore,
        String reason,

        BigDecimal per,
        BigDecimal pbr,
        BigDecimal divYield,
        BigDecimal valueScore,

        List<String> tags
) {
    public static MainStockResponseDto from (MainStockRow row){
        return new MainStockResponseDto(
                row.stockCode(),
                row.stockName(),
                row.market(),
                row.sector(),

                row.closePrice(),
                row.changeRate(),
                row.marketCap(),
                row.tradingValue(),

                row.flowScore(),
                row.reason(),

                row.per(),
                row.pbr(),
                row.divYield(),
                row.valueScore(),

                splitTags(row.tags())
        );
    }

    // 태그 분리
    private static List<String> splitTags(String tags){
        return (tags == null || tags.isBlank()) ? List.of() : List.of(tags.split(","));
    }
}
