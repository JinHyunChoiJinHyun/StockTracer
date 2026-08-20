package com.stocktracer.backend.investorflow.repository;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.mapper.InvestorFlowAnalysisMapper;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class InvestorFlowAnalysisRepositoryImpl implements InvestorFlowAnalysisRepository {

    private final InvestorFlowAnalysisMapper investorFlowAnalysisMapper;

    @Override
    public int bulkUpsert(List<InvestorFlowAnalysis> flows) {
        int affected = 0;
        List<List<InvestorFlowAnalysis>> batches = ListUtils.partition(flows, 1000);
        for(List<InvestorFlowAnalysis> batch : batches){
            affected += investorFlowAnalysisMapper.upsertAll(batch);
        }

        return affected;
    }
}
