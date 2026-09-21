package com.stocktracer.backend.investorflow.service;

import com.stocktracer.backend.common.validate.Validates;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestorFlowDailyService {

    private final InvestorFlowDailyRepository investorFlowDailyRepository;
    private final StockInfoRepository stockInfoRepository;

    @Transactional
    public int save(List<InvestorFlowDailyRequestDto> request){
        // 1. 입력값 검증
        if (request.isEmpty()) return 0; // 휴장일 빈 리스트 입력 가능성 방지
        validateSingleBaseDate(request);
        Validates.duplicateKeys(request, item -> item.stockCode() + "@" + item.baseDate());
        // 2. in 쿼리로 stockInfo 일괄 조회

        // 1) stockCode 분해
        List<String> stockCodes = request.stream()
                .map(InvestorFlowDailyRequestDto::stockCode)
                .distinct()
                .toList();

        // 2) IN 쿼리로 StockInfo 객체 조회
        List<StockInfo> stockInfos = stockInfoRepository.findAllByStockCodeIn(stockCodes);

        // 3. dto -> InvestorFlowDaily로 변환
        Map<String, StockInfo> stockInfoMap = stockInfos.stream()
                .collect(Collectors.toMap(StockInfo::stockCode, Function.identity()));

        // 누락 종목 처리 (해결법 논의 필요)
        List<String> missing = stockCodes.stream()
                .filter(code -> !stockInfoMap.containsKey(code))
                .toList();
        if (!missing.isEmpty()) {
            throw new IllegalStateException("stock_info 미등록 종목: " + missing);
        }

        List<InvestorFlowDaily> flows = request.stream()
                .map(dto -> new InvestorFlowDaily(dto.stockCode(),dto.baseDate(),dto.foreignNet(),dto.institutionNet(),dto.individualNet(),dto.tradingValue()))
                .toList();


        return investorFlowDailyRepository.bulkSave(flows);
    }

    /** 검증 메서드 */
    // 하나의 영업일인지 체크 >> Validate로 이동 필요
    private void validateSingleBaseDate(List<InvestorFlowDailyRequestDto> request){
        Set<LocalDate> dates = request.stream()
                .map(InvestorFlowDailyRequestDto::baseDate)
                .collect(Collectors.toSet());
        if (dates.size() > 1){
            throw new IllegalArgumentException((
                    "단일 일자만 처리합니다. 입력된 날짜: " + new TreeSet<>(dates) // 중복을 제거하고 오름차순으로 출력
            ));
        }
    }

    // StockInfo 객체 조회
    private StockInfo findStockInfo(Map<String, StockInfo> stockInfoMap, String stockCode){
        return Optional.ofNullable(stockInfoMap.get((stockCode))) // null이면 빈 값 생성
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }

}
