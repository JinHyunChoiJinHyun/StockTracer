package com.stocktracer.backend.stock.exception;

public class StockInfoNotFoundException extends RuntimeException {
    public StockInfoNotFoundException(String stockCode) {
        super("주식 정보를 찾을 수 없습니다. "+ stockCode);
    }
}
