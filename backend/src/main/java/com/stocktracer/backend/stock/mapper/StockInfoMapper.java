package com.stocktracer.backend.stock.mapper;

import com.stocktracer.backend.stock.domain.StockInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StockInfoMapper {
    void upsertAll(@Param("infos") List<StockInfo> infos);
}
