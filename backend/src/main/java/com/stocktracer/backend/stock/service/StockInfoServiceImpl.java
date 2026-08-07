package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoJpaRepository;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import com.stocktracer.backend.stock.service.interfaces.StockInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 주가 정보의 경우 소량이므로 jpa로 처리 */
@Service
@RequiredArgsConstructor
public class StockInfoServiceImpl implements StockInfoService {
    private final StockInfoRepository stockInfoRepository;

    // 주식 정보 upsert
    @Transactional
    @Override
    public void saveOrUpdateStocks(List<StockInfoDto> dtos){
        for(StockInfoDto dto : dtos){
            // 1. pk를 기준으로 데이터가 이미 있는지 조회
            // optional이므로 함수형으로 작성하는게 안전 (휴먼 에러 방지)
            stockInfoRepository.findByStockCode(dto.stockCode())
                    .ifPresentOrElse(
                            stock -> {
                                // 값이 존재할 시 업데이트
                                System.out.println(">>> 기존 데이터 발견! 업데이트 실행: " + dto.stockCode());
                                StockInfo updatedStock = stock.update(dto.stockCode(), dto.stockName(),MarketType.parseMarketType(dto.market()));
                                stockInfoRepository.save(updatedStock); // 값을 저장하지 않고 stock을 넣으면 이전 데이터가 다시 저장됨 (db 업데이트 안된 이유...)
                            },
                            () -> {
                                // 값이 없을 시 새 객체 생성 후 저장
                                System.out.println(">>> 기존 데이터 없음! 새로 생성: " + dto.stockCode());
                                StockInfo stock = dto.toDomain();
                                stockInfoRepository.save(stock);
                            }
                    );
        }
    }

    // 주식 정보 조회
    @Transactional
    @Override
    public StockInfo findByStockCode(String stockCode){
        return stockInfoRepository.findByStockCode(stockCode)
                .orElseThrow(() -> new StockInfoNotFoundException(stockCode));
    }
}
