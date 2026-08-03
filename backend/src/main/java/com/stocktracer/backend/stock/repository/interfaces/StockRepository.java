package com.stocktracer.backend.stock.repository.interfaces;

import com.stocktracer.backend.stock.repository.entitiy.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<StockEntity, String> {
}
