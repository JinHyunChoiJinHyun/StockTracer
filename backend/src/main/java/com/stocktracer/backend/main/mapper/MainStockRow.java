package com.stocktracer.backend.main.mapper;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.value.domain.ValueFundamental;

/**
 * join한 결과값 저장
 * @param info
 * @param price
 * @param valueFundamental
 */
public record MainStockRow (
        StockInfo info,
        StockPrice price,
        ValueFundamental valueFundamental
){
}
