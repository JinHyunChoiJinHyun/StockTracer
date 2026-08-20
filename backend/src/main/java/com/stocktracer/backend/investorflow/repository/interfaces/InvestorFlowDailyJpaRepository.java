package com.stocktracer.backend.investorflow.repository.interfaces;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.entity.InvestorFlowDailyEntity;
import com.stocktracer.backend.investorflow.entity.InvestorFlowDailyId;
import com.stocktracer.backend.price.domain.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface InvestorFlowDailyJpaRepository extends JpaRepository<InvestorFlowDailyEntity, InvestorFlowDailyId> {
    // 실행되는 SQL: SELECT * FROM invesor_flow_daily WHERE base_date = ?
    List<InvestorFlowDailyEntity> findByBaseDate(LocalDate baseDate);
}
