package com.stocktracer.backend.investorflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record InvestorFlowBulkRequestDto(
        @NotEmpty(message = "저장할 데이터가 없습니다")
        @Size(max = 5000, message = "한 번에 최대 5000건까지 처리합니다")
        @Valid
        List<InvestorFlowDailyRequestDto> items
) {
}
