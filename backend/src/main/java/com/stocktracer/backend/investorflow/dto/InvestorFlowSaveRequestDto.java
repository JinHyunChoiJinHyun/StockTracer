package com.stocktracer.backend.investorflow.dto;

import java.util.List;

public record InvestorFlowSaveRequestDto(
        List<InvestorFlowDailyRequestDto> daily,
        List<InvestorFlowAnalysisRequestDto> analysis
) {
    public InvestorFlowSaveRequestDto{
        // null인 경우 빈 리스트 반환
        daily = daily == null ? List.of() : daily;
        analysis = analysis == null ? List.of() : analysis;
    }
}
