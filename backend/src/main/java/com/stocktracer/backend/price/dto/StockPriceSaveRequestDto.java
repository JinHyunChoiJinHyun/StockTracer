package com.stocktracer.backend.price.dto;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.StockInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;

import javax.swing.plaf.synth.SynthToolBarUI;
import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record StockPriceSaveRequestDto(
        /** 검증 */
        // dto에서 값 검증 후 domin에 입력
        // domain에서 한번 더 검증 후 db 저장
    @NotBlank String stockCode,
    @NotNull LocalDate priceDate,
    @NotNull @Positive BigDecimal openPrice,
    @NotNull @Positive BigDecimal closePrice,
    @NotNull @Positive BigDecimal lowPrice,
    @NotNull @Positive BigDecimal highPrice,
    BigDecimal priceChange,
    @NotNull @PositiveOrZero Long volume, // 거래정지 시 0일 가능성 있음
    @NotNull @PositiveOrZero BigDecimal tradingValue, // 거래정지 시 0일 가능성 있음
    @NotNull @Positive BigDecimal marketCap
){
}


