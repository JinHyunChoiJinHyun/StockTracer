package com.stocktracer.backend.investorflow.repository;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.entity.InvestorFlowDailyEntity;
import com.stocktracer.backend.investorflow.mapper.InvestorFlowDailyMapper;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyJpaRepository;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
@Repository
@RequiredArgsConstructor
public class InvestorFlowDailyRepositoryImpl implements InvestorFlowDailyRepository {

    private final InvestorFlowDailyMapper investorFlowDailyMapper;
    private final InvestorFlowDailyJpaRepository investorFlowDailyJpaRepository;
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

    @Override
    public List<InvestorFlowDaily> findByBaseDate(LocalDate baseDate) {
        return investorFlowDailyJpaRepository.findByBaseDate(baseDate).stream()
                .map(InvestorFlowDailyEntity::toDomain)
                .toList();
    }


}
