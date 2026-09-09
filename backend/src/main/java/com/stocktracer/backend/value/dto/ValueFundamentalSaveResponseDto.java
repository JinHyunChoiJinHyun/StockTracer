package com.stocktracer.backend.value.dto;

import java.time.LocalDate;

public record ValueFundamentalSaveResponseDto(
        int requested,
        int affected
){
}
