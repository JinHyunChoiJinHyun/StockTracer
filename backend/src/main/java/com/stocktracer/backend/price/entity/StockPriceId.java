package com.stocktracer.backend.price.repository.entity;

import java.io.Serializable;
import java.time.LocalDate;

public class StockPriceId implements Serializable { // 복합키의 경우 Serializable 필수
    private String stockCode;
    private LocalDate stockDate; // 날짜를 복합키로 설정해야 이전 날짜의 일봉 정보가 덮어써지지 않음
}
