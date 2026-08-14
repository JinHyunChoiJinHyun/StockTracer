package com.stocktracer.backend.investorflow.mapper;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InvestorFlowDailyMapper {
    int bulkUpsert(
            @Param("flows") List<InvestorFlowDaily> flows
    );
}
