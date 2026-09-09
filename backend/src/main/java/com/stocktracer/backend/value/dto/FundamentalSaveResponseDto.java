package com.stocktracer.backend.value.dto;

public record FundamentalSaveResponseDto(
        int affectedValueCount,
        int affectedEpsCount,
        int missingEpsCount
) {
}
