package com.stocktracer.backend.price.service.interfaces;

import com.stocktracer.backend.price.dto.StockPriceSaveBulkRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;

import java.time.LocalDate;
import java.util.List;

/** 추후 확장(비트코인, 나스닥 등) 고려하여 interface 생성 */
public interface StockPriceService {
    // 주가 조회
    List<StockPriceResponseDto> getPricesByCodeAndPeriod(String stockCode, LocalDate startDate, LocalDate endDate);

    // 주가 데이터 저장
    void bulkSave(StockPriceSaveBulkRequestDto prices);
}
