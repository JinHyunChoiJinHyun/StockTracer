package com.stocktracer.backend.investorflow.entity;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor // 데이터 조립을 위해 새로운 객체 생성
@EqualsAndHashCode // 메모리 주소가 달라도 내용물이 같은지 확인
public class InvestorFlowDailyId implements Serializable {
    private String stockCode;
    private LocalDate baseDate;
}
