package com.stocktracer.backend.stock.repository.interfaces;

import com.stocktracer.backend.stock.repository.entitiy.StockInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockInfoRepository extends JpaRepository<StockInfoEntity, String> {
}
