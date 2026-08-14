package com.stocktracer.backend.price.repository.interfaces;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

public interface StockPriceRepository {
    List<StockPriceResponseDto> findPricesByCodeAndPeriod(String stockCode, LocalDate startDate, LocalDate endDate);
    List<StockPriceResponseDto> findPricesByCodes(
            String stockCodes,
            LocalDate priceDate,
            String sortBy
    );
    void bulkUpsert(List<StockPrice> prices);
}
