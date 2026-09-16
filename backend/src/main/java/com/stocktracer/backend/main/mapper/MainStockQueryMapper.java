package com.stocktracer.backend.main.mapper;

import com.stocktracer.backend.main.dto.MainStockQuery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// 동적 조회나 join의 경우 MyBatis가 유리
@Mapper
public interface MainStockQueryMapper {
    // 최신 영업일 날짜 계산
    Optional<LocalDate> findLatestBaseDate();

    // 주식 정보 조회
    List<MainStockRow> findMainStockRows(
            @Param("query")MainStockQuery query
    );

    long countMainStockRows(
            @Param("query") MainStockQuery query
    );
}
