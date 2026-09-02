package com.stocktracer.backend.value.dto;

public record FundamentalSaveResponseDto(
        int savedValueCount,
        int savedEpsCount,
        int missingEpsCount
) {
}
