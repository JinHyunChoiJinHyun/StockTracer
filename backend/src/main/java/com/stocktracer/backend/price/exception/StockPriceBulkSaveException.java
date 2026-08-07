package com.stocktracer.backend.price.exception;

public class StockPriceBulkSaveException extends RuntimeException {
    public StockPriceBulkSaveException(Throwable cause) {
        super("주가 데이터 저장 중 오류가 발생했습니다.", cause);
    }
}
