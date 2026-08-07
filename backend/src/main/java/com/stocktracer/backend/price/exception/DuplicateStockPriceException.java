package com.stocktracer.backend.price.exception;

import java.time.LocalDate;

public class DuplicateStockPriceException extends RuntimeException {
    public DuplicateStockPriceException(String stockCode, LocalDate stockDate) {
        super("중복된 종목/날짜 조합이 존재합니다. stockCode=" + stockCode + ", stockDate=" + stockDate);
    }
}
