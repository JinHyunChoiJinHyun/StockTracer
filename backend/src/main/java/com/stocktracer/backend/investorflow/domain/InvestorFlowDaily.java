package com.stocktracer.backend.investorflow.domain;

import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record InvestorFlowDaily (
        String stockCode,
        LocalDate baseDate,
        long foreignNet,
        long institutionNet,
        long individualNet
){
    // major 수급 (외국인 + 기관)
    public long majorNet() {
        return foreignNet + institutionNet;
    }
}
