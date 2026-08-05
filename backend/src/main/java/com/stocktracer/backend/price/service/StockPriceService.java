package com.stocktracer.backend.price.service;

import com.stocktracer.backend.price.dto.StockPriceDto;
import com.stocktracer.backend.stock.exception.InvalidDateRangeException;
import com.stocktracer.backend.stock.exception.StockPriceNotFoundException;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockPriceService {
    private final StockPriceMapper stockPriceMapper;

    /**
     * 특정 주식 코드의 주가를 조회합니다
     * @param stockCode 주식코드
     * @param startDate 시작날짜
     * @param endDate 종료날짜
     * @return 주가 정보
     */
    public List<StockPriceDto> getPricesByCodeAndPeriod(String stockCode, LocalDate startDate, LocalDate endDate){
        /** 1. 입력값 검증 */
        // 1) 코드 입력값 검증
        if(stockCode == null || stockCode.trim().isEmpty()){
            throw new IllegalArgumentException("주식코드가 비어있습니다.");
        }

        // 2) 날짜 입력값 검증
        if(startDate == null || endDate == null){
            throw new IllegalArgumentException("조회 시작일과 종료일은 필수입니다.");
        }

        if(startDate.isAfter(endDate)){
            throw new InvalidDateRangeException(startDate, endDate);
        }
        /** 2. mybatis로 조회 */
        List<StockPriceDto> priceList = stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate);

        /** 3. 조회 결과 없는 경우 예외 처리 */
        if(priceList.isEmpty()){
            throw new StockPriceNotFoundException(stockCode);
        }

        return priceList;
    }
}
