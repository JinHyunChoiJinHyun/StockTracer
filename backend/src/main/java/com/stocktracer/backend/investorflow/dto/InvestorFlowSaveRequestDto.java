package com.stocktracer.backend.investorflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record InvestorFlowSaveRequestDto(
        @NotNull
        @Valid
        List<InvestorFlowDailyRequestDto> daily,

        @NotNull
        @Valid
        List<InvestorFlowAnalysisRequestDto> analysis
) {}
