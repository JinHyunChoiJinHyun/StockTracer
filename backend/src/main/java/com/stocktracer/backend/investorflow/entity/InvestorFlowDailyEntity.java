package com.stocktracer.backend.investorflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// setter를 두지 않아 더티 체킹으로 update가 발생하는 경로 원천 차단
@Entity
@Table(name = "investor_flow_daily")
@IdClass(InvestorFlowDailyId.class)
@Getter
@NoArgsConstructor
public class InvestorFlowDailyEntity {
    @Id
    @Column(name = "stock_code", length = 6, nullable = false)
    private String stockCode;

    @Id
    @Column(name = "base_date", nullable = false)
    private LocalDate baseDate;

    @Column(name = "foreign_net", nullable = false)
    private long foreignNet;

    @Column(name = "institution_net", nullable = false)
    private long institutionNet;

    @Column(name = "individual_net", nullable = false)
    private long individualNet;

    @Column(name = "trading_value")
    private Long tradingValue;

    @Column(name = "major_net", insertable = false, updatable = false)
    private Long majorNet;
}
