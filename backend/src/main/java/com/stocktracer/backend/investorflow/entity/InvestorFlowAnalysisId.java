package com.stocktracer.backend.investorflow.entity;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@EqualsAndHashCode
public class InvestorFlowAnalysisId implements Serializable {
    private String stockCode;
    private LocalDate baseDate;
}
