package com.stocktracer.backend.stock.entitiy;

import com.stocktracer.backend.common.entity.BaseEntity;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "stock_info",
        indexes = {
                @Index(name = "idx_stock_code", columnList = "stockCode", unique = true)
        }
)
@Getter
@NoArgsConstructor
public class StockInfoEntity extends BaseEntity {

    @Id
    @Column(name = "stock_code", nullable = false, unique = true, length = 20)
    private String stockCode;

    @Column(nullable = false, length = 100)
    private String stockName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MarketType market;

    /** 매핑 및 변환 메서드 */
    public StockInfoEntity(StockInfo domain) {
        this.stockCode = domain.getStockCode();
        this.stockName = domain.getStockName();
        this.market = domain.getMarket();
    }

    public StockInfo toDomain(){
        return StockInfo.builder()
                .stockCode(this.stockCode)
                .stockName(this.stockName)
                .market(this.market)
                .build();
    }
}
