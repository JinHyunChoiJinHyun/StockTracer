package com.stocktracer.backend.stock.entitiy;

import com.stocktracer.backend.common.entity.BaseEntity;
import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "stock_info",
        indexes = {
                @Index(name = "idx_stock_info_market", columnList = "market")
        }
)
@Getter
@NoArgsConstructor
public class StockInfoEntity extends BaseEntity {

    @Id
    @Column(name = "stock_code", length = 6)
    private String stockCode;

    @Column(name = "stock_name", nullable = false, length = 100)
    private String stockName;

    @Enumerated(EnumType.STRING)
    @Column(name = "market", nullable = false, length = 20)
    private MarketType market;

    /** 매핑 및 변환 메서드 */
    private StockInfoEntity(StockInfo stockInfo) {
        this.stockCode = stockInfo.getStockCode();
        this.stockName = stockInfo.getStockName();
        this.market = stockInfo.getMarket();
    }

    public static StockInfoEntity from(StockInfo stockInfo){
        return new StockInfoEntity(stockInfo);
    }

    public StockInfo toDomain(){
        return StockInfo.create(
                this.stockCode,
                this.stockName,
                this.market
        );
    }
}
