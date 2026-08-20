package com.stocktracer.backend.stock.repository.interfaces;

import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockInfoJpaRepository extends JpaRepository<StockInfoEntity, String> {

    // map을 통해 1번만 실행되는 조회 쿼리 생성 (엔티티 반환)
    List<StockInfoEntity> findAllByStockCodeIn(List<String> stockCodes); // 메서드명을 보고 jpa가 자동으로 쿼리문 생성
}
