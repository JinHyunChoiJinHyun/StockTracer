package com.stocktracer.backend.main.dto;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.main.domain.StockStatus;
import com.stocktracer.backend.main.mapper.MainStockRow;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.tag.domain.TagCode;
import com.stocktracer.backend.value.domain.ValueFundamental;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

        Set<TagCode> tags,
        StockStatus status
) {
    public static MainStockResponseDto of (MainStockRow row, Set<TagCode> tags , StockStatus status){
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

                tags,
                status
        );
    }


}
