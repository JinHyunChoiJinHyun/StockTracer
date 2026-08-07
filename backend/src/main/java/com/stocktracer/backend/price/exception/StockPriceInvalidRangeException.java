package com.stocktracer.backend.price.exception;

import java.math.BigDecimal;

public class StockPriceInvalidRangeException extends RuntimeException {
    public StockPriceInvalidRangeException(BigDecimal price, BigDecimal highPrice, BigDecimal lowPrice) {
        super("시가 혹은 종가(%s)가 고가(%s)~저가(%s) 범위를 벗어났습니다".formatted(price,highPrice,lowPrice));
    }
    public StockPriceInvalidRangeException(BigDecimal highPrice, BigDecimal lowPrice) {
        super("고가(%s)가 저가(%s)보다 작을 수 없습니다".formatted(highPrice,lowPrice));
    }
}
