package com.stocktracer.backend.investorflow.repository.interfaces;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;

import java.util.List;

public interface InvestorFlowDailyRepository {
    int bulkSave(List<InvestorFlowDaily> flows);
}
