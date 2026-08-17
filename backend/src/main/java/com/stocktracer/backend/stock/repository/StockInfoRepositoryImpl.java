package com.stocktracer.backend.stock.repository;

import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoJpaRepository;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class StockInfoRepositoryImpl implements StockInfoRepository {
    private final StockInfoJpaRepository jpaInfoRepository; // jpa를 따로 호출하여 실행

    @Override
    public Optional<StockInfo> findByStockCode(String stockCode) {
        return jpaInfoRepository.findById(stockCode)
                .map(StockInfo::from);
    }

    @Override
    public List<StockInfo> findAllByStockCodeIn(List<String> stockCodes) {
        // 1000개로 나눠서 배치 처리
        List<StockInfo> result = new ArrayList<>();

        List<List<String>> batches = ListUtils.partition(stockCodes, 1000);
        for (List<String> batch: batches){
            List<StockInfoEntity> entities = jpaInfoRepository.findAllByStockCodeIn(batch);
            result.addAll(entities.stream().map(StockInfoEntity::toDomain).toList());
        }

        return result;
    }

    @Override
    public void save(StockInfo stockInfo) {
        StockInfoEntity entity = new StockInfoEntity(stockInfo);
        jpaInfoRepository.save(entity);
    }
}
