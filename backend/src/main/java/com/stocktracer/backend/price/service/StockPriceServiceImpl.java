package com.stocktracer.backend.price.service;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceBulkSaveRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.InvalidDateRangeException;
import com.stocktracer.backend.price.exception.StockPriceBulkSaveException;
import com.stocktracer.backend.price.exception.StockPriceNotFoundException;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import com.stocktracer.backend.price.service.interfaces.StockPriceService;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import com.stocktracer.backend.stock.service.interfaces.StockInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockPriceServiceImpl implements StockPriceService {

    private final StockPriceMapper stockPriceMapper;
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
        List<StockPriceResponseDto> priceList = stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate);

        /** 3. 조회 결과 없는 경우 예외 처리 */
        if(priceList.isEmpty()){
            throw new StockPriceNotFoundException(stockCode);
        }

        return priceList;
    }

    /**
     * 주가 데이터를 대량으로 저장합니다
     * @param bulkDto 대량 주가 데이터
     */
    @Transactional
    @Override
    public void bulkSave(StockPriceBulkSaveRequestDto bulkDto) {
        // 1. stockCode 분해
        List<String> stockCodes = bulkDto.prices().stream()
                .map(StockPriceSaveRequestDto::stockCode)
                .distinct()
                .toList();

        // 2. IN 쿼리로 StockInfo 일괄 조회
        Map<String, StockInfo> stockInfoMap = stockInfoRepository.findAllByStockCodeIn(stockCodes).stream()
                .collect(Collectors.toMap(
                        StockInfo::getStockCode, // key = stockCode
                        Function.identity(), // value = StockInfo
                        (existing, replacement) -> existing // 중복 키 발생 시 기본값 유지 (후자 선택 시 최신값으로 업데이트)
                ));

        // 3. DTO -> StockPrice 도메인 객체 변환
        List<StockPrice> prices = bulkDto.prices().stream() // 가독성 좋은 for문
                .map(dto -> StockPrice.of(dto,findStockInfo(stockInfoMap, dto.stockCode()))) // 각 dto를 StockInfo와 조합해 객체로 변환
                .toList();

        /** collect와 map의 차이 */
        // map => 각 객체마다 수행해야 하는 로직이 필요할 시
        // collect => map 사용 여부와 관계없이 map이나 list를 최종 포장할 시 (list는 toList로 대체 사용 가능하나 map은 collect 필수)

        // 4. 최종 저장
        stockPriceMapper.bulkUpsert(prices);
    }

    private StockInfo findStockInfo(Map<String, StockInfo> stockInfoMap, String stockCode){
        return Optional.ofNullable(stockInfoMap.get((stockCode))) // null이면 빈 값 생성
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }
}
