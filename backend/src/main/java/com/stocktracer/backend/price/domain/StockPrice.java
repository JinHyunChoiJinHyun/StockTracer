package com.stocktracer.backend.price.domain;

import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.StockPriceInvalidRangeException;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPrice {
    private String stockCode;
    private LocalDate priceDate;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private BigDecimal lowPrice;
    private BigDecimal highPrice;
    private BigDecimal priceChange;
    private Long volume;
    private BigDecimal tradingValue; // 거래대금
    private BigDecimal marketCap; // 시가총액

    // 정적 생성 메서드 (파라미터가 두개 이상일 시 of로 생성)
    // >> 필드 수가 많으므로 builder를 생성 지점으로 사용
    public static StockPrice of(
            String stockCode,
            LocalDate priceDate,
            BigDecimal openPrice,
            BigDecimal closePrice,
            BigDecimal lowPrice,
            BigDecimal highPrice,
            BigDecimal priceChange,
            Long volume,
            BigDecimal tradingValue,
            BigDecimal marketCap
    ){
        validatePriceConsistency(openPrice,closePrice,lowPrice,highPrice);
        return StockPrice.builder()
                .stockCode(stockCode)
                .priceDate(priceDate)
                .openPrice(openPrice)
                .closePrice(closePrice)
                .lowPrice(lowPrice)
                .highPrice(highPrice)
                .priceChange(priceChange)
                .volume(volume)
                .tradingValue(tradingValue)
                .marketCap(marketCap)
                .build();
    }

    /** 도메인 검증 로직 */
    private static void validatePriceConsistency(BigDecimal openPrice, BigDecimal closePrice, BigDecimal lowPrice, BigDecimal highPrice){
        if(closePrice.compareTo(highPrice) > 0 || closePrice.compareTo(lowPrice) < 0){ // compareTo = 높으면 1 낮으면 -1 반환
            throw new StockPriceInvalidRangeException(closePrice,highPrice,lowPrice);
        }
        if(openPrice.compareTo(highPrice) > 0 || openPrice.compareTo(lowPrice) < 0){
            throw new StockPriceInvalidRangeException(openPrice, highPrice,lowPrice);
        }
        if(highPrice.compareTo(lowPrice)<0){
            throw new StockPriceInvalidRangeException(highPrice,lowPrice);
        }
    }
}
