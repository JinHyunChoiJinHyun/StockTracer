package com.stocktracer.backend.investorflow.dto;

import java.time.LocalDate;

public record InvestorFlowResponseDto(
        LocalDate baseDate,
        int dailyAffected,
        int analysisAffected
) {
    public static InvestorFlowResponseDto empty(){
        return new InvestorFlowResponseDto(null, 0, 0);
    }
}
