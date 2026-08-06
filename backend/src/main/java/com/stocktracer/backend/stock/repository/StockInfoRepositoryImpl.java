package com.stocktracer.backend.stock.repository;

import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.repository.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoJpaRepository;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class StockInfoRepositoryImpl implements StockInfoRepository {
    private final StockInfoJpaRepository jpaRepository; // jpa를 따로 호출하여 실행

    @Override
    public Optional<StockInfo> findByStockCode(String stockCode) {
        return jpaRepository.findById(stockCode)
                .map(StockInfo::from);
    }

    @Override
    public List<StockInfo> findAllByStockCodeIn(List<String> stockCodes) {
        return jpaRepository.findAllByStockCodeIn(stockCodes).stream()
                .map(StockInfoEntity::toDomain)
                .toList();
    }

    @Override
    public void save(StockInfo stockInfo) {
        StockInfoEntity entity = new StockInfoEntity(stockInfo);
        jpaRepository.save(entity);
    }
}
