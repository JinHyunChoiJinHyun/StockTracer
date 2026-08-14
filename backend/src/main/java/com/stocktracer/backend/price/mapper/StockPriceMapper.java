package com.stocktracer.backend.price.mapper;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.mapping.DatabaseIdProvider;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface StockPriceMapper {

    // 1. 특정 종목의 기간별 주가 목록 조회 추후 객체만 반환하도록 수정
    List<StockPriceResponseDto> findPricesByCodeAndPeriod(
            @Param("stockCode") String stockCode,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 2. 여러 종목 동시 조회
    List<StockPriceResponseDto> findPricesByCodes(
            @Param("stockCodes") String stockCodes,
            @Param("date") LocalDate priceDate,
            @Param("sortBy") String sortBy
    );

    // 3. 주가 데이터 대량 저장
    void bulkUpsert(
            @Param("prices") List<StockPrice> prices
    );
}
