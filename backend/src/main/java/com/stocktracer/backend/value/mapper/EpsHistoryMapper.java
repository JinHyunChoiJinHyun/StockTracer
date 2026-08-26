package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.value.domain.EpsHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface EpsHistoryMapper {
    /**
     * 기준일 이전 이력에서 종목별 lag번째 eps 조회
     * @param baseDate 해당 날짜 미만 이력만 조회 (재실행 멱등성 확보)
     * @param lag 1=직전
     */
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
