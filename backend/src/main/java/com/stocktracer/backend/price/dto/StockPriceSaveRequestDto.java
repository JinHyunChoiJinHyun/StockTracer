package com.stocktracer.backend.price.dto;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.StockInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotNull LocalDate stockDate,
    @NotNull @PositiveOrZero BigDecimal openPrice,
    @NotNull @PositiveOrZero BigDecimal closePrice,
    @NotNull @PositiveOrZero BigDecimal lowPrice,
    @NotNull @PositiveOrZero BigDecimal highPrice,
    BigDecimal priceChange,
    @NotNull @PositiveOrZero Long volume,
    @NotNull @PositiveOrZero BigDecimal tradingValue,
    @NotNull @PositiveOrZero BigDecimal marketCap
){
    public StockPrice toDomain(StockInfo stock){
        return StockPrice.of(this, stock);
    }
}


