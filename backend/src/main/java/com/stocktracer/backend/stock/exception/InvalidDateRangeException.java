package com.stocktracer.backend.stock.exception;

import java.time.LocalDate;

public class InvalidDateRangeException extends RuntimeException{
    public InvalidDateRangeException(LocalDate start, LocalDate end){
        super("시작일이 종료일보다 늦을 수 없습니다. 시작일: " + start + ", 종료일: " + end);
    }
}
