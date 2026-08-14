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
    private LocalDate stockDate;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private BigDecimal lowPrice;
    private BigDecimal highPrice;
    private BigDecimal priceChange;
    private Long volume;
    private BigDecimal tradingValue; // 거래대금
    private BigDecimal marketCap; // 시가총액
    private StockInfo stock;

    // 정적 생성 메서드 (파라미터가 두개 이상일 시 of로 생성)
    // >> 필드 수가 많으므로 builder를 생성 지점으로 사용
    public static StockPrice of(StockPriceSaveRequestDto dto, StockInfo stock){
        validatePriceConsistency(dto);
        return StockPrice.builder()
                .stockCode(dto.stockCode())
                .stockDate(dto.stockDate())
                .openPrice(dto.openPrice())
                .closePrice(dto.closePrice())
                .lowPrice(dto.lowPrice())
                .highPrice(dto.highPrice())
                .priceChange(dto.priceChange())
                .volume(dto.volume())
                .tradingValue(dto.tradingValue())
                .marketCap(dto.marketCap())
                .stock(stock)
                .build();
    }

    /** 도메인 검증 로직 */
    private static void validatePriceConsistency(StockPriceSaveRequestDto dto){
        if(dto.closePrice().compareTo(dto.highPrice()) > 0 || dto.closePrice().compareTo(dto.lowPrice()) < 0){ // compareTo = 높으면 1 낮으면 -1 반환
            throw new StockPriceInvalidRangeException(dto.closePrice(),dto.highPrice(),dto.lowPrice());
        }
        if(dto.openPrice().compareTo(dto.highPrice()) > 0 || dto.openPrice().compareTo(dto.lowPrice()) < 0){
            throw new StockPriceInvalidRangeException(dto.openPrice(), dto.highPrice(),dto.lowPrice());
        }
        if(dto.highPrice().compareTo(dto.lowPrice())<0){
            throw new StockPriceInvalidRangeException(dto.highPrice(),dto.lowPrice());
        }
    }
}
