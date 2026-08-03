package com.stocktracer.backend.stock.repository.interfaces;

import com.stocktracer.backend.stock.domain.StockPrice;
import com.stocktracer.backend.stock.repository.entitiy.StockPriceEntity;
import com.stocktracer.backend.stock.repository.entitiy.StockPriceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPriceEntity, StockPriceId> {
}
