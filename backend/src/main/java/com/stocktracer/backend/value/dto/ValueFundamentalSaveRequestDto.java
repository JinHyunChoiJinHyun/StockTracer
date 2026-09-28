package com.stocktracer.backend.value.dto;

import com.stocktracer.backend.value.domain.ScoredScope;
import com.stocktracer.backend.value.domain.ValueFundamental;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ValueFundamentalSaveRequestDto(
        @NotEmpty (message = "데이터는 최소 1건 이상이어야 합니다.")
        @Valid
        List<Item> items
        ) {
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public record Item(
            @NotNull (message = "기준일은 필수입니다.")
            @PastOrPresent(message = "기준일은 미래일 수 없습니다.")
            LocalDate baseDate,
            @NotBlank (message = "종목코드는 필수입니다.")
            @Pattern(regexp = "[A-Za-z0-9]{6}", message = "종목코드는 영문자와 숫자로 구성된 6자리여야 합니다.")
            String stockCode,

            BigDecimal per,
            BigDecimal pbr,
            BigDecimal eps,
            BigDecimal bps,
            BigDecimal divYield,

            @PositiveOrZero(message = "상장주식수는 0 이상이어야 합니다.")
            Long sharesOutstanding,

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
        public List<ValueFundamental> toDomain(){ // 코드를 줄이기 위해 상위 레코드에 한번만 작성
            return items.stream()
                    .map(i -> new ValueFundamental(
                            i.baseDate(),
                            i.stockCode(),
                            i.per(),
                            i.pbr(),
                            i.eps(),
                            i.bps(),
                            i.divYield(),
                            i.sharesOutstanding(),
                            i.perPct(),
                            i.pbrPct(),
                            i.valueScore(),
                            i.scoredScope(),
                            i.epsGrowth(),
                            i.valueTrap()
                    ))
                    .toList();
        }
}
