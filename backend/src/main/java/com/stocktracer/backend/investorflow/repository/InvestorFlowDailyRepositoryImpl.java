package com.stocktracer.backend.investorflow.repository;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.mapper.InvestorFlowDailyMapper;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@RequiredArgsConstructor
public class InvestorFlowDailyRepositoryImpl implements InvestorFlowDailyRepository {

    private final InvestorFlowDailyMapper investorFlowDailyMapper;
    @Override
    public int bulkSave(List<InvestorFlowDaily> flows) {
        // 1000개씩 나눠서 배치 처리
        int affected = 0;
        List<List<InvestorFlowDaily>> batches = ListUtils.partition(flows, 1000);
        for(List<InvestorFlowDaily> batch : batches){
            affected += investorFlowDailyMapper.bulkUpsert(batch);
        }
        return affected;
    }
}
