package com.stocktracer.backend.main.dto;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.main.repository.MainStockRow;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.tag.StockTag;
import com.stocktracer.backend.value.domain.ValueFundamental;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public record MainStockResponseDto(
        String stockCode,
        String stockName,
        String market,

        BigDecimal closePrice,
        BigDecimal priceChange,

        String sector,
        BigDecimal per,
        BigDecimal pbr,
        BigDecimal divYield,
        BigDecimal valueScore,

        List<StockTagResponseDto> tags
) {
    public static MainStockResponseDto of (MainStockRow row, List<StockTag> tags){
        // 무조건 존재하는 값
        StockInfo info = row.info();

        // 존재하지 않을 수도 있는 값
        Optional<StockPrice> price = Optional.ofNullable(row.price());
        Optional<InvestorFlowDaily> dailyFlow = Optional.ofNullable(row.dailyFlow());
        Optional<InvestorFlowAnalysis> analysisFlow = Optional.ofNullable(row.analysisFlow());
        Optional<ValueFundamental> valueFundamental = Optional.ofNullable(row.valueFundamental());

        return new MainStockResponseDto(
                info.getStockCode(),
                info.getStockName(),
                info.getMarket().name(),

                price.map(StockPrice::getClosePrice).orElse(null),
                price.map(StockPrice::getPriceChange).orElse(null),

                valueFundamental.map(ValueFundamental::sector).orElse(null),
                valueFundamental.map(ValueFundamental::per).orElse(null),
                valueFundamental.map(ValueFundamental::pbr).orElse(null),
                valueFundamental.map(ValueFundamental::divYield).orElse(null),
                // 점수 산정 불가 시 출력 x
                valueFundamental.filter(ValueFundamental::isScored).map(ValueFundamental::valueScore).orElse(null),

                tags.stream().map(StockTagResponseDto::from).toList()
        );
    }
}
