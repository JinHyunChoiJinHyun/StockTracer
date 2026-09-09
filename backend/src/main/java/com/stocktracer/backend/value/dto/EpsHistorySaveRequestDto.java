package com.stocktracer.backend.value.dto;

import com.stocktracer.backend.value.domain.EpsHistory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EpsHistorySaveRequestDto(
        @NotEmpty @Valid List<Item> items
        ) {
    public record Item(
            @NotNull (message = "기준일은 필수입니다.")
            @PastOrPresent(message = "기준일은 미래일 수 없습니다.")
            LocalDate effectiveDate,

            @NotBlank
            @Pattern(regexp = "[A-Za-z0-9]{6}",
                    message = "종목코드는 영문 또는 숫자 6자리여야 합니다.")
            String stockCode,

            @NotNull(message = "EPS는 필수입니다.")
            BigDecimal eps
    ){}

    public List<EpsHistory> toDomain(){
        return items.stream()
                .map(i -> new EpsHistory(
                        i.stockCode(),
                        i.effectiveDate(),
                        i.eps())
                )
                .toList();
    }
}
