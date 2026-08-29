package com.stocktracer.backend.value.dto;

import java.time.LocalDate;

public record ValueFundamentalSaveResponseDto(
        LocalDate baseDate,
        int requested,
        int affected
){
}
