package com.stocktracer.backend.investorflow.entity;

import com.stocktracer.backend.common.entity.BaseEntity;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 원본 KRX 사실 데이터 - 수정 메서드를 두지 않아 불변으로 취급.
// 적재는 MyBatis bulkUpsert가 담당하며 JPA는 조회 전용으로만 사용한다.
@Entity
@Table(name = "investor_flow_daily")
@IdClass(InvestorFlowDailyId.class)
@Getter
@NoArgsConstructor
public class InvestorFlowDailyEntity extends BaseEntity {
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

    public InvestorFlowDaily toDomain(){
        return InvestorFlowDaily.of( // 검증을 위해 builder가 아닌 of 사용
                stockCode,
                baseDate,
                foreignNet,
                institutionNet,
                individualNet,
                tradingValue
        );
    }

    // 도메인 -> 엔티티 변환 경로가 필요할 때 from 추가 (현재는 myBatis가 적재하므로 불필요)
}
