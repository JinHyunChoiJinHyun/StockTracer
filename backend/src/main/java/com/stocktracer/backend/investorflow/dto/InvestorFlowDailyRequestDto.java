package com.stocktracer.backend.investorflow.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import jakarta.validation.constraints.*;
import lombok.Builder;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

import java.time.LocalDate;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record InvestorFlowDailyRequestDto(
        @NotBlank(message = "종목 코드는 필수입니다")
        @Pattern(regexp = "^[0-9A-Z]{6}$", message = "종목코드는 6자리 영숫자여야 합니다")
        String stockCode,

        @NotNull(message = "기준일자는 필수입니다")
        @PastOrPresent(message = "기준일자는 미래일 수 없습니다")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate baseDate,

        @NotNull(message = "외국인 순매수는 필수입니다")
        Long foreignNet,

        @NotNull(message = "기관 순매수는 필수입니다")
        Long institutionNet,

        @NotNull(message = "개인 순매수는 필수입니다")
        Long individualNet
) {
        public InvestorFlowDaily toDomain(){
                return new InvestorFlowDaily(
                        stockCode,
                        baseDate,
                        foreignNet,
                        institutionNet,
                        individualNet
                );
        }
}
