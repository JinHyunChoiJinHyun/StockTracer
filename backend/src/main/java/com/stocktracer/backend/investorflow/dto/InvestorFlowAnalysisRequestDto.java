package com.stocktracer.backend.investorflow.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record InvestorFlowAnalysisRequestDto(
        @NotBlank(message = "종목코드는 필수입니다.")
        @Pattern(regexp = "^[0-9A-Z]{6}$", message = "종목코드는 6자리 영숫자여야 합니다")
        String stockCode,

        @NotNull(message = "기준일자는 필수입니다.")
        @PastOrPresent(message = "기준일자는 미래일 수 없습니다")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate baseDate,

        // major_net / trading_value (순매수 금액은 총 거래대금을 넘을 수 없으므로 수학적으로 [-1,1])
        // 이미 trading_value가 0인 경우를 필터링하여 null이 없지만 nan이 반환될 수 있으므로 null 허용
        @DecimalMin(value = "-1.0", message = "순매수 강도는 -1 이상이어야 합니다")
        @DecimalMax(value = "1.0", message = "순매수 강도는 1 이하여야 합니다")
        @Digits(integer = 3, fraction = 6, message = "순매수 강도 정밀도가 DECIMAL(9,6)을 초과합니다") // 무한 소수 저장 방지 (예: 0.3333...)
        BigDecimal netRatio,

        @NotNull(message = "점수는 필수입니다")
        @PositiveOrZero(message = "점수는 0 이상이어야 합니다")
        @Digits(integer = 4, fraction = 2, message = "점수 정밀도가 DECIMAL(6,2)를 초과합니다") // 반올림 방지
        BigDecimal score,

        /* boolean -> Boolean으로 변경한 이유 */
        // boolean으로 작성할 시 null이 들어와도 false로 저장되므로 Valid 불가
        @JsonProperty("is_double_buy")
        @NotNull(message = "쌍끌이 여부는 필수입니다")
        Boolean doubleBuy,

        @JsonProperty("is_clean_buy")
        @NotNull(message = "손바뀜 여부는 필수입니다")
        Boolean cleanBuy,

        @Size(max = 255, message = "사유는 255자를 초과할 수 없습니다")
        String reason
) {
        public InvestorFlowAnalysis toDomain(
                InvestorFlowDaily daily){
                return InvestorFlowAnalysis.of(
                        this.stockCode,
                        this.baseDate,
                        this.netRatio,
                        this.score,
                        this.doubleBuy,
                        this.cleanBuy,
                        this.reason,
                        daily
                );
        }
}
