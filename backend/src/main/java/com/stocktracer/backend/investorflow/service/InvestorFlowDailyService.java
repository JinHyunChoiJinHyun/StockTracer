package com.stocktracer.backend.investorflow.service;

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
    public int save(List<InvestorFlowDailyRequestDto> dtos){
        // 1. 입력값 검증
        validateSingleBaseDate(dtos);
        validateNoDuplicateKey(dtos);

        // 2. in 쿼리로 stockInfo 일괄 조회

        // 1) stockCode 분해
        List<String> stockCodes = dtos.stream()
                .map(InvestorFlowDailyRequestDto::stockCode)
                .distinct()
                .toList();

        // 2) IN 쿼리로 StockInfo 객체 조회
        List<StockInfo> stockInfos = stockInfoRepository.findAllByStockCodeIn(stockCodes);

        // 3. dto -> InvestorFlowDaily로 변환
        Map<String, StockInfo> stockInfoMap = stockInfos.stream()
                .collect(Collectors.toMap(StockInfo::getStockCode, Function.identity()));

        List<InvestorFlowDaily> flows = dtos.stream()
                .map(dto -> InvestorFlowDaily.of(dto,findStockInfo(stockInfoMap, dto.stockCode())))
                .toList();

        return investorFlowDailyRepository.bulkSave(flows);
    }

    /** 검증 메서드 */
    // 하나의 영업일인지 체크
    private void validateSingleBaseDate(List<InvestorFlowDailyRequestDto> dtos){
        Set<LocalDate> dates = dtos.stream()
                .map(InvestorFlowDailyRequestDto::baseDate)
                .collect(Collectors.toSet());
        if (dates.size() > 1){
            throw new IllegalArgumentException((
                    "단일 일자만 처리합니다. 입력된 날짜: " + new TreeSet<>(dates) // 중복을 제거하고 오름차순으로 출력
            ));
        }
    }

    // duplicate key update로 인한 데이터 소실 방지를 위해 pk 중복 체크
    private void validateNoDuplicateKey(List<InvestorFlowDailyRequestDto> dtos){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = dtos.stream()
                .map(dto -> dto.stockCode() + "|" + dto.baseDate())
                .filter(key -> !seen.add(key)) // 이미 seen에 존재해 add에 실패한 값만 필터
                .distinct()
                .toList();
        if(!duplicates.isEmpty()){
            throw new IllegalArgumentException(("중복된 (종목코드, 기준일): ") + duplicates);
        }
    }

    // StockInfo 객체 조회
    private StockInfo findStockInfo(Map<String, StockInfo> stockInfoMap, String stockCode){
        return Optional.ofNullable(stockInfoMap.get((stockCode))) // null이면 빈 값 생성
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }

}
