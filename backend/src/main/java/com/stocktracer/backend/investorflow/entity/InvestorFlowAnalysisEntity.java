package com.stocktracer.backend.investorflow.entity;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "investor_flow_analysis")
@Immutable // 통계 테이블이므로 수정 불가
@IdClass(InvestorFlowAnalysisId.class)
@Getter
@NoArgsConstructor
public class InvestorFlowAnalysisEntity {
    @Id
    @Column(name = "stock_code", length = 6, nullable = false)
    private String stockCode;

    @Id
    @Column(name = "base_date", nullable = false)
    private LocalDate baseDate;

    @Column(name = "net_ratio", precision = 9, scale = 6)
    private BigDecimal netRatio;

    @Column(name = "score", precision = 6, scale = 2, nullable = false)
    private BigDecimal score;

    @Column(name = "is_double_buy", nullable = false)
    private boolean doubleBuy;

    @Column(name = "is_clean_buy", nullable = false)
    private boolean cleanBuy;

    @Column(name = "reason", length = 255)
    private String reason;

    // fk
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "stock_code", referencedColumnName = "stock_code", insertable = false, updatable = false),
            @JoinColumn(name = "base_date", referencedColumnName = "base_date", insertable = false, updatable = false)
    })
    private InvestorFlowDailyEntity daily;
}
