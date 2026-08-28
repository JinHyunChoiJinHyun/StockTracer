package com.stocktracer.backend.value.dto;

import com.stocktracer.backend.value.domain.ScoredScope;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ValueFundamentalSaveRequestDto(
        @NotNull (message = "기준일은 필수입니다.")
        LocalDate baseDate,
        @NotEmpty (message = "데이터는 초치소 1건 이상이어야 합니다.")
        @Valid List<Item> items
        ) {
    public record Item(
            @NotBlank (message = "종목코드는 필수입니다.")
            @Pattern(regexp = "[A-Za-z0-9]{6}", message = "종목코드는 영문자와 숫자로 구성된 6자리여야 합니다.")
            String stockCode,
            String sector,

            BigDecimal per,
            BigDecimal pbr,
            BigDecimal eps,
            BigDecimal divYield,

            @PositiveOrZero(message = "시가총액은 0 이상이어야 합니다.")
            Long marketCap,
            @PositiveOrZero(message = "상장주식수는 0 이상이어야 합니다.")
            Long shareOutstanding,
            @PositiveOrZero(message = "거래대금은 0 이상이어야 합니다.")
            Long tradingValue,

            @DecimalMin(value = "0", message = "per 백분위는 0 이상이어야 합니다.")
            @DecimalMax(value = "100", message = "per 백분위는 100 이하여야 합니다.")
            BigDecimal perPct,

            @DecimalMin(value = "0", message = "pbr 백분위는 0 이상이어야 합니다.")
            @DecimalMax(value = "100", message = "pbr 백분위는 100 이하여야 합니다.")
            BigDecimal pbrPct,

            BigDecimal valueScore,
            ScoredScope scoredScope,
            BigDecimal epsGrowth,

            Boolean valueTrap
    ){}

}
