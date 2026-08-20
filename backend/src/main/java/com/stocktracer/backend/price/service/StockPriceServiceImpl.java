package com.stocktracer.backend.price.service;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceSaveBulkRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.DuplicateStockPriceException;
import com.stocktracer.backend.price.exception.InvalidDateRangeException;
import com.stocktracer.backend.price.exception.StockPriceNotFoundException;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import com.stocktracer.backend.price.repository.interfaces.StockPriceRepository;
import com.stocktracer.backend.price.service.interfaces.StockPriceService;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockPriceServiceImpl implements StockPriceService {

    private final StockPriceRepository stockPriceRepository;
    private final StockInfoRepository stockInfoRepository;

    /**
     * 특정 주식 코드의 주가를 조회합니다
     * @param stockCode 주식코드
     * @param startDate 시작날짜
     * @param endDate 종료날짜
     * @return 주가 정보
     */
    public List<StockPriceResponseDto> getPricesByCodeAndPeriod(String stockCode, LocalDate startDate, LocalDate endDate){
        /** 1. 입력값 검증 */
        // 1) 코드 입력값 검증
        String normalizedStockCode = stockCode == null ? null : stockCode.trim(); // 정상화 후 저장 필요 (null이면 null 아니면 공백 제거)

        if(normalizedStockCode == null || normalizedStockCode.isEmpty()){
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
        List<StockPriceResponseDto> priceList = stockPriceRepository.findPricesByCodeAndPeriod(normalizedStockCode,startDate,endDate);

        /** 3. 조회 결과 없는 경우 예외 처리 */
        if(priceList.isEmpty()){
            throw new StockPriceNotFoundException(normalizedStockCode);
        }

        return priceList;
    }

    /**
     * 주가 데이터를 대량으로 저장합니다
     * @param bulkDto 대량 주가 데이터
     */
    @Transactional
    @Override
    public void bulkSave(StockPriceSaveBulkRequestDto bulkDto) {

        // db 호출 전 중복 발견 시 거부 처리
        validateNoDuplicationKeys(bulkDto.items());

        // 각 dto의 code와 일치하는 StockInfo와 조합해 객체로 변환
        List<StockPrice> prices = bulkDto.items().stream() // 가독성 좋은 for문
                .map(dto -> StockPrice.of(dto.stockCode(),dto.priceDate(),dto.openPrice(),dto.closePrice(),dto.lowPrice(),dto.highPrice(),dto.priceChange(),dto.volume(),dto.tradingValue(),dto.marketCap()))
                .peek(stockPrice -> { // 값 제대로 입력 됐는지 확인
                    System.out.println(
                            "종목코드: " + stockPrice.getStockCode() +
                            " | 시가: " + stockPrice.getOpenPrice() +
                            " | 종가: " + stockPrice.getClosePrice() +
                            " | 저가: " + stockPrice.getLowPrice() +
                            " | 고가: " + stockPrice.getHighPrice());
                })
                .toList();

        /** collect와 map의 차이 */
        // map => 각 객체마다 수행해야 하는 로직이 필요할 시
        // collect => map 사용 여부와 관계없이 map이나 list를 최종 포장할 시 (list는 toList로 대체 사용 가능하나 map은 collect 필수)

        // 저장
        stockPriceRepository.bulkUpsert(prices);
    }

    // 중복 검증 로직
    private void validateNoDuplicationKeys(List<StockPriceSaveRequestDto> prices){
        Set<String> seen = new HashSet<>();
        for (StockPriceSaveRequestDto price : prices){
            String key = price.stockCode() + "_" + price.priceDate(); // 복합키
            if(!seen.add(key)){
                // 추가가 불가하면 이미 존재하는 키
                throw new DuplicateStockPriceException(price.stockCode(), price.priceDate());
            }
        }
    }
}
