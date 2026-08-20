package com.stocktracer.backend.investorflow.service;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowAnalysisRequestDto;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowAnalysisRepository;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
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
public class InvestorFlowAnalysisService {
    private final InvestorFlowAnalysisRepository analysisRepository;
    private final InvestorFlowDailyRepository dailyRepository;

    @Transactional
    public int save(List<InvestorFlowAnalysisRequestDto> requests){
        // 검증
        if(requests.isEmpty()){
            log.info("수급 분석 요청 없음 - 처리 생략");
            return 0;
        }

        validateSingleBaseDate(requests);
        validateNoDuplicateKey(requests);

        LocalDate baseDate = requests.get(0).baseDate();
        Map<String, InvestorFlowDaily> dailyMap = loadDaily(baseDate);
        validateNoMissingDailyData(requests, dailyMap);

        // 변환
        List<InvestorFlowAnalysis> flows = requests.stream()
                .map(r -> r.toDomain(dailyMap.get(r.stockCode())))
                .toList(); // 수정 불가

        // 저장
        int affected = analysisRepository.bulkUpsert(flows);
        log.info("수급 분석 저장 완료: 기준일={}, 요청={}건, 반영={}",
                baseDate, flows.size(),affected);

        return affected;
    }

    /* 서비스 검증 로직 */
    // 배치 1회당 1 영업일
    private void validateSingleBaseDate(List<InvestorFlowAnalysisRequestDto> requests){
        Set<LocalDate> dates = requests.stream()
                .map(InvestorFlowAnalysisRequestDto::baseDate)
                .collect(Collectors.toSet());

        if (dates.size() > 1){
            throw new IllegalArgumentException(
                    "단일 일자만 처리합니다. 입력된 날짜: " + new TreeSet<>(dates)
            );
        }
    }

    // pk 중복 검증
    private void validateNoDuplicateKey(List<InvestorFlowAnalysisRequestDto> requests){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = requests.stream()
                .map(InvestorFlowAnalysisRequestDto::stockCode)
                .filter(code -> !seen.add(code)) // 이미 seen에 존재해서 add에 실패한 값만 필터
                .distinct()
                .toList();

        if (!duplicates.isEmpty()){
            throw new IllegalArgumentException("중복된 종목코드: " + duplicates);
        }

    }

    // daily flow 조회
    private Map<String, InvestorFlowDaily> loadDaily (LocalDate baseDate){
        List<InvestorFlowDaily> daily = dailyRepository.findByBaseDate(baseDate);

        if (daily.isEmpty()){
            throw new IllegalArgumentException(String.format(
                    "%s 원본 수급 데이터가 없습니다. daily flow 적재를 먼저 수행하세요",
                    baseDate
            ));
        }

        return daily.stream().collect(Collectors.toMap(InvestorFlowDaily::getStockCode, Function.identity()));
    }

    // daily 데이터 누락 여부 확인
    private void validateNoMissingDailyData(
            List<InvestorFlowAnalysisRequestDto> requests,
            Map<String, InvestorFlowDaily> dailyMap
    ){
        List<String> missing = requests.stream()
                .map(InvestorFlowAnalysisRequestDto::stockCode)
                .filter(code -> !dailyMap.containsKey(code)) // map에 없는 key만 필터
                .distinct()
                .toList();

        if (!missing.isEmpty()){
            throw new IllegalArgumentException(String.format(
                    "원본 수급에 없는 종목 %d건: %s%s",
                    missing.size(),
                    missing.stream().limit(10).toList(),
                    missing.size() > 10 ? "...": ""
            ));
        }
    }
}
