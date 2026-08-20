package com.stocktracer.backend.investorflow.repository.interfaces;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;

import java.time.LocalDate;
import java.util.List;

public interface InvestorFlowDailyRepository {
    // daily 대량 저장
    int bulkSave(List<InvestorFlowDaily> flows);

    // 교차 검증용 원본 조회
    List<InvestorFlowDaily> findByBaseDate(LocalDate baseDate);
}
