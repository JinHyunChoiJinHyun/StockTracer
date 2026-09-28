package com.stocktracer.backend.investorflow.repository.interfaces;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;

import java.util.List;

public interface InvestorFlowAnalysisRepository {
    int upsertAll(List<InvestorFlowAnalysis> flows);
}
