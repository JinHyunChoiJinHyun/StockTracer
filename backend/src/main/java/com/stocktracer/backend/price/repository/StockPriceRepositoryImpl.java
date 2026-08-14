package com.stocktracer.backend.price.repository;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import com.stocktracer.backend.price.repository.interfaces.StockPriceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class StockPriceRepositoryImpl implements StockPriceRepository {
    private final StockPriceMapper stockPriceMapper;

    @Override
    public List<StockPriceResponseDto> findPricesByCodeAndPeriod(String stockCode, LocalDate startDate, LocalDate endDate) {
        return stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate);
    }

    @Override
    public List<StockPriceResponseDto> findPricesByCodes(String stockCodes, LocalDate priceDate, String sortBy) {
        return stockPriceMapper.findPricesByCodes(stockCodes,priceDate,sortBy);
    }

    @Override
    public void bulkUpsert(List<StockPrice> prices) {
        // 1000개씩 배치 처리
        List<List<StockPrice>> batches = ListUtils.partition(prices, 1000);
        for(List<StockPrice> batch : batches){
            stockPriceMapper.bulkUpsert(batch);
        }
    }
}
