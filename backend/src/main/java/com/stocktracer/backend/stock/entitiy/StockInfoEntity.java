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

    @Column(name = "sector")
    private String sector;

    /** 매핑 및 변환 메서드 */
    private StockInfoEntity(
            String stockCode,
            String stockName,
            MarketType market,
            String sector
    ) {
        this.stockCode = stockCode;
        this.stockName = stockName;
        this.market = market;
        this.sector = sector;
    }

    public static StockInfoEntity from(StockInfo stockInfo){
        return new StockInfoEntity(
                stockInfo.stockCode(),
                stockInfo.stockName(),
                stockInfo.market(),
                stockInfo.sector()
        );
    }

    public StockInfo toDomain(){
        return new StockInfo(
                stockCode,
                stockName,
                market,
                sector
        );
    }
}
