package com.stocktracer.backend.main.mapper;

import com.stocktracer.backend.main.dto.MainStockQuery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

// 동적 조회나 join의 경우 MyBatis가 유리
@Mapper
public interface MainStockQueryMapper {
    List<MainStockRow> findMainStockRows(
            @Param("query")MainStockQuery query
    );

    long countMainStockRows(
            @Param("query") MainStockQuery query
    );
}
