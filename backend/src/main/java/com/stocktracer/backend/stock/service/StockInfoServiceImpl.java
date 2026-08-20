package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import com.stocktracer.backend.stock.service.interfaces.StockInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** 주가 정보의 경우 소량이므로 jpa로 처리 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockInfoServiceImpl implements StockInfoService {
    private final StockInfoRepository stockInfoRepository;

    // 주식 정보 upsert
    @Transactional
    @Override
    public void saveOrUpdateStocks(List<StockInfoDto> dtos){
        // null 체크
        if (dtos == null || dtos.isEmpty()){
            log.info("저장할 종목 정보 없음");
            return;
        }

        // 각 dto domain으로 변환
        List<StockInfo> stocks = dtos.stream().map(StockInfoDto::toDomain).toList();

        // 일괄 저장
        stockInfoRepository.bulkSave(stocks);
        log.info("종목 정보 upsert 완료 - {}건", stocks.size());
    }

    // 주식 정보 조회
    @Transactional(readOnly = true)
    @Override
    public StockInfo findByStockCode(String stockCode){
        return stockInfoRepository.findByStockCode(stockCode)
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }

}
