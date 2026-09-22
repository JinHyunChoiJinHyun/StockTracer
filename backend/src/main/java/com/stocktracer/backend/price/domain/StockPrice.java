package com.stocktracer.backend.price.domain;

import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.StockPriceInvalidRangeException;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StockPrice (
        String stockCode,
        LocalDate baseDate,
        BigDecimal openPrice,
        BigDecimal closePrice,
        BigDecimal lowPrice,
        BigDecimal highPrice,
        BigDecimal changeRate,
        Long volume,
        BigDecimal tradingValue, // 거래대금
        BigDecimal marketCap // 시가총액
){
    /* compact constructor - 모든 생성 경로가 반드시 통과 */
    public StockPrice{
        validatePriceConsistency(openPrice, closePrice, lowPrice,highPrice);
    }

    /* 도메인 검증 로직 */
    private static void validatePriceConsistency(BigDecimal openPrice, BigDecimal closePrice, BigDecimal lowPrice, BigDecimal highPrice){
        // 고가와 저가 범위 검증 (저가 ~ 고가 범위가 정상인지)
        if(highPrice.compareTo(lowPrice)<0){
            throw new StockPriceInvalidRangeException(highPrice,lowPrice);
        }
        // 종가가 저가 ~ 고가 범위 내에 있는지 검증
        if(closePrice.compareTo(highPrice) > 0 || closePrice.compareTo(lowPrice) < 0){ // compareTo = 높으면 1 낮으면 -1 반환
            throw new StockPriceInvalidRangeException(closePrice,highPrice,lowPrice);
        }

        // 시가가 저가 ~ 고가 범위 내에 있는지 검증
        if(openPrice.compareTo(highPrice) > 0 || openPrice.compareTo(lowPrice) < 0){
            throw new StockPriceInvalidRangeException(openPrice, highPrice,lowPrice);
        }

    }
}
