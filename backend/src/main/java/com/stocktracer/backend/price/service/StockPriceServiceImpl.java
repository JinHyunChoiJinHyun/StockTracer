package com.stocktracer.backend.price.service;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceSaveBulkRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.DuplicateStockPriceException;
import com.stocktracer.backend.price.exception.InvalidDateRangeException;
import com.stocktracer.backend.price.exception.StockPriceNotFoundException;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
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
        List<StockPriceResponseDto> priceList = stockPriceMapper.findPricesByCodeAndPeriod(normalizedStockCode,startDate,endDate);

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

        // 1. stockCode 분해
        List<String> stockCodes = bulkDto.prices().stream()
                .map(StockPriceSaveRequestDto::stockCode)
                .distinct()
                .toList();

        // 2. db 호출 전 중복 발견 시 거부 처리
        validateNoDuplicationKeys(bulkDto.prices());

        // 3. IN 쿼리로 StockInfo 일괄 조회 (jpa가 fk에 값을 넣을 시 객체를 통해 간접적으로 입력하므로 객체 조회 필요)
        // in 쿼리로 한번에 조회하여 네트워크 낭비 방지
        // db 부하를 막기 위해 배치 처리
        Map<String, StockInfo> stockInfoMap = new HashMap<>(stockCodes.size()); // 오버헤드 방지
        List<List<String>> codeBatches = ListUtils.partition(stockCodes, 1000);
        for(List<String> codeBatch : codeBatches){ // 바깥 루프: 배치 개수(N/1000)번 순회 // 안쪽: 배치 크기(최대 1000)만큼 순회
            stockInfoRepository.findAllByStockCodeIn(codeBatch)
                    .forEach(stockInfo -> stockInfoMap.put(stockInfo.getStockCode(),stockInfo)); // 위에서 distinct로 중복체크 했으므로 putIfAbsent 대신 put 사용
        }
        /** for문 내부에 foreach 효율이 괜찮은가? */
        // 다른 이중 FOR문과는 다르게 1000건 처리 후 다음 건(예: 1001번째)으로 넘어가기 때문에 중첩되지 않음 -> O(N)으로 해결

        // 4. DTO -> StockPrice 도메인 객체 변환
        List<StockPrice> prices = bulkDto.prices().stream() // 가독성 좋은 for문
                .map(dto -> StockPrice.of(dto,findStockInfo(stockInfoMap, dto.stockCode()))) // 각 dto를 StockInfo와 조합해 객체로 변환
                .toList();

        /** collect와 map의 차이 */
        // map => 각 객체마다 수행해야 하는 로직이 필요할 시
        // collect => map 사용 여부와 관계없이 map이나 list를 최종 포장할 시 (list는 toList로 대체 사용 가능하나 map은 collect 필수)

        // 5. 1000개 단위로 분할하여 한 묶음씩 저장
        List<List<StockPrice>> batches = ListUtils.partition(prices, 1000); // 1000개 단위로 분할
        for(List<StockPrice> batch : batches){
            stockPriceMapper.bulkUpsert(batch);
        }
    }

    // StockInfo 객체 조회
    private StockInfo findStockInfo(Map<String, StockInfo> stockInfoMap, String stockCode){
        return Optional.ofNullable(stockInfoMap.get((stockCode))) // null이면 빈 값 생성
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }

    // 중복 확인 로직
    private void validateNoDuplicationKeys(List<StockPriceSaveRequestDto> prices){
        Set<String> seen = new HashSet<>();
        for (StockPriceSaveRequestDto price : prices){
            String key = price.stockCode() + "_" + price.stockDate(); // 복합키
            if(!seen.add(key)){
                // 추가가 불가하면 이미 존재하는 키
                throw new DuplicateStockPriceException(price.stockCode(), price.stockDate());
            }
        }
    }
}
