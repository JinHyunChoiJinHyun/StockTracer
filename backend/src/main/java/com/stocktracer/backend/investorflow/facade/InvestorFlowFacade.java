package com.stocktracer.backend.investorflow.facade;

import com.stocktracer.backend.investorflow.dto.*;
import com.stocktracer.backend.investorflow.service.InvestorFlowAnalysisService;
import com.stocktracer.backend.investorflow.service.InvestorFlowDailyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.tree.Tree;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestorFlowFacade {
    private final InvestorFlowDailyService dailyService;
    private final InvestorFlowAnalysisService analysisService;

    @Transactional
    public InvestorFlowResponseDto save(InvestorFlowSaveRequestDto request){
        List<InvestorFlowDailyRequestDto> daily = request.daily();
        List<InvestorFlowAnalysisRequestDto> analysis = request.analysis();

        // 1. 빈 요청 처리
        if (daily.isEmpty() && analysis.isEmpty()){
            log.info("수급 저장 요청 없음");
            return InvestorFlowResponseDto.empty();
        }

        // 2. daily 없이 analysis만 오는 경우 차단
        if (daily.isEmpty()){
            throw new IllegalArgumentException("daily 없이 analysis만 저장 불가합니다.");
        }

        // 3. 기준일 일치 검증
        LocalDate baseDate = validateSameBaseDate(daily, analysis);

        // 4. 저장
        int dailyAffected = dailyService.save(daily);
        int analysisAffected = analysisService.save(analysis);

        log.info("수급 저장 완료: 기준일={}, daily={}건, analysis={}건",
                baseDate, dailyAffected, analysisAffected);

        return new InvestorFlowResponseDto(baseDate, dailyAffected, analysisAffected);
    }

    // 모든 요청의 기준일이 동일한지 검증
    private LocalDate validateSameBaseDate(
            List<InvestorFlowDailyRequestDto> daily,
            List<InvestorFlowAnalysisRequestDto> analysis
    ){
        Set<LocalDate> dates = Stream.concat(
                daily.stream().map(InvestorFlowDailyRequestDto::baseDate),
                analysis.stream().map(InvestorFlowAnalysisRequestDto::baseDate)
        ).collect(Collectors.toSet());

        // 개수가 한개가 아닐 시 기준일이 통일되지 않음 (list 내부까지 검증)
        if (dates.size() != 1) {
            throw new IllegalArgumentException(
                    "기준일이 일치하지 않습니다." + new TreeSet<>(dates)
            );
        }

        // 날짜 반환
        return dates.iterator().next();
    }

}
