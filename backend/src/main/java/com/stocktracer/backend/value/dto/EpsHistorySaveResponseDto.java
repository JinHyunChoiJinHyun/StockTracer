package com.stocktracer.backend.value.dto;

import java.time.LocalDate;

public record EpsHistorySaveResponseDto(
        int requested,
        int affected
) {
}
