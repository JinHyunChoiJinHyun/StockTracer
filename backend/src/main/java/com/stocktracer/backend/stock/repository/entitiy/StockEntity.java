package com.stocktracer.backend.stock.repository.entitiy;

import com.stocktracer.backend.common.entity.BaseEntity;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.Stock;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "stock",
        indexes = {
                @Index(name = "idx_stock_code", columnList = "stockCode", unique = true)
        }
)
@Getter
@NoArgsConstructor
public class StockEntity extends BaseEntity {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    private String stockCode;

    @Column(nullable = false, length = 100)
    private String stockName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MarketType marketType;

    /** 매핑 및 변환 메서드 */
    public StockEntity(Stock stock) {
        this.stockCode = stock.getStockCode();
        this.stockName = stock.getStockName();
        this.marketType = stock.getMarketType();
    }

    public Stock toStock(){
        return Stock.builder()
                .stockCode(this.stockCode)
                .stockName(this.stockName)
                .marketType(this.marketType)
                .build();
    }
}
