package com.stocktracer.backend.investorflow.mapper;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InvestorFlowAnalysisMapper {
    int upsertAll(@Param("flows") List<InvestorFlowAnalysis> flows);
}
