package com.stocktracer.backend.main.mapper;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.value.domain.ValueFundamental;

import java.math.BigDecimal;

/**
 * join한 결과값 저장
 */
public record MainStockRow (
    // stock_info
    String stockCode,
    String stockName,
    String market,

    // stock_price
    BigDecimal closePrice,
    BigDecimal priceChange,
    BigDecimal tradingValue,
    BigDecimal marketCap,

    // investor_flow_analysis
    BigDecimal score,
    String reason,

    // value_fundamental
    String sector,
    BigDecimal per,
    BigDecimal pbr,
    BigDecimal divYield,
    BigDecimal valueScore
){
}
