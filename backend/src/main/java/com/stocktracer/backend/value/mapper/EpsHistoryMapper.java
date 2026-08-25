package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.value.domain.EpsHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface EpsHistoryMapper {
    // 전 종목 prevEps 조회
    List<EpsHistory> findPrevEps(
            @Param("baseDate")LocalDate baseDate,
            @Param("lag") int lag
    );

    // 특정 종목 prevEps 조회
    List<EpsHistory> findPrevByStockCodes(
            @Param("codes") List<String> codes,
            @Param("lag") int lag
    );
}
