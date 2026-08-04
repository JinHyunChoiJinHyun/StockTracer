package com.stocktracer.backend.stock.exception;

import org.springframework.http.HttpStatus;

public class StockPriceNotFoundException extends RuntimeException{
    public StockPriceNotFoundException(String stockCode){
        super("해당 종목의 주가 데이터가 존재하지 않습니다. 코드: "+ stockCode);
    }
}
