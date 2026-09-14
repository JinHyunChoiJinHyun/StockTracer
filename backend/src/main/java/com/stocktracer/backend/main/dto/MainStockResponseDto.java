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

        BigDecimal closePrice,
        BigDecimal priceChange,
        BigDecimal marketCap,
        BigDecimal tradingValue,

        BigDecimal supplyScore,
        String reason,

        String sector,
        BigDecimal per,
        BigDecimal pbr,
        BigDecimal divYield,
        BigDecimal valueScore
) {
    public static MainStockResponseDto from (MainStockRow row){
        return new MainStockResponseDto(
                row.stockCode(),
                row.stockName(),
                row.market(),

                row.closePrice(),
                row.priceChange(),
                row.marketCap(),
                row.tradingValue(),

                row.score(),
                row.reason(),

                row.sector(),
                row.per(),
                row.pbr(),
                row.divYield(),
                row.valueScore()
        );
    }
}
