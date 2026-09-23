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

    private final InvestorFlowDailyRepository dailyRepository;
    private final StockInfoRepository stockInfoRepository;

    @Transactional
    public int save(List<InvestorFlowDailyRequestDto> request){
        // 1. 검증
        if (request.isEmpty()) {
            log.info("일별 수급 요청 없음");
            return 0;
        }
        Validates.duplicateKeys(request, item -> item.stockCode() + "@" + item.baseDate());

        // 2. 미등록 종목 검증


        List<InvestorFlowDaily> flows = request.stream()
                .map(dto -> new InvestorFlowDaily(dto.stockCode(),dto.baseDate(),dto.foreignNet(),dto.institutionNet(),dto.individualNet()))
                .toList();


        return dailyRepository.bulkSave(flows);
    }

    // stock_info 미등록 종목 검증
    private void validateStockInfoExists(List<InvestorFlowDailyRequestDto> request){
        // 1. stockCode 추출
        List<String> stockCodes = request.stream()
                .map(InvestorFlowDailyRequestDto::stockCode)
                .distinct()
                .toList();

        // 2. 추출한 stockCode로 IN 쿼리 조회
        Set<String> registered = stockInfoRepository.findAllByStockCodeIn(stockCodes).stream()
                .map(StockInfo::stockCode)
                .collect(Collectors.toSet());

    }

}
