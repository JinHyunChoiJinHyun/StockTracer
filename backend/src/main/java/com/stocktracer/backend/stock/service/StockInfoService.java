package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.repository.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StockInfoService {
    private final StockInfoRepository stockInfoRepository;

    @Transactional
    public void saveOrUpdateStocks(List<StockInfoDto> dtos){
        for(StockInfoDto dto : dtos){
            // 1. pk를 기준으로 데이터가 이미 있는지 조회
            // optional이므로 함수형으로 작성하는게 안전 (휴먼 에러 방지)
            stockInfoRepository.findById(dto.stockCode())
                    .map(StockInfoEntity::toDomain) // 엔티티 -> 객체로 변환
                    .ifPresentOrElse(
                            stock -> {
                                // 값이 존재할 시 업데이트
                                stock.update(dto.stockName(),MarketType.valueOf(dto.market()));
                                StockInfoEntity entity = new StockInfoEntity(stock);
                                stockInfoRepository.save(entity);
                            },
                            () -> {
                                // 값이 없을 시 새 객체 생성 후 저장
                                StockInfo stock = dto.toDomain();
                                StockInfoEntity entity = new StockInfoEntity(stock);
                                stockInfoRepository.save(entity);
                            }
                    );
        }
    }
}
