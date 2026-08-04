package com.stocktracer.backend.stock.mapper;

import com.stocktracer.backend.stock.domain.StockPrice;
import com.stocktracer.backend.stock.dto.StockPriceDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface StockPriceMapper {

    // 1. 특정 종목의 기간별 주가 목록 조회
    List<StockPriceDto> findPricesByCodeAndPeriod(
            @Param("stockCode") String stockCode,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 2. 여러 종목 동시 조회
    List<StockPriceDto> findPricesByCodes(
            @Param("stockCodes") String stockCodes,
            @Param("date") LocalDate priceDate,
            @Param("sortBy") String sortBy
    );
}
