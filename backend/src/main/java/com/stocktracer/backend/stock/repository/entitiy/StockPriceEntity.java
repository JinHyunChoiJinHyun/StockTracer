package com.stocktracer.backend.stock.repository.entitiy;

import com.stocktracer.backend.common.BaseEntity;
import com.stocktracer.backend.stock.domain.Stock;
import com.stocktracer.backend.stock.domain.StockPrice;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "stock_price",
        // 인덱스를 key로 위치를 value로 저장하여 위치 바로 반환 (조회 시 성능 증가)
        indexes = {
                @Index(name = "idx_price_date", columnList = "price_date")
        }
)
@IdClass(StockPriceId.class)
@Getter
@NoArgsConstructor
public class StockPriceEntity extends BaseEntity {
        @Id
        @Column(name = "stock_code")
        private String stockCode;

        @Id
        @Column(name = "price_date")
        private LocalDate priceDate;

        // 주가의 경우 2진수 변환 없이 10진수를 그대로 저장하는 big decimal 사용 (오차 보정)
        @Column(name = "open_price")
        private BigDecimal openPrice;

        @Column(name = "high_price")
        private BigDecimal highPrice;

        @Column(name = "low_price")
        private BigDecimal lowPrice;

        @Column(name = "close_price")
        private BigDecimal closePrice;

        @Column(name = "volume")
        private Long volume;

        @Column(name = "price_change")
        private BigDecimal priceChange;

        @Column(name = "price_change_rate")
        private BigDecimal priceChangeRate;

        @ManyToOne(fetch = FetchType.LAZY) // 여러 일봉 데이터들이 하나의 주식 정보 데이터를 필요하므로 사용
        // oneToMany를 Stock에 사용해 모든 일봉 데이터를 가져오는 경우는 필터링이 불가 >> 사용 용도에 맞지 않음
        // EAGER - 조회 즉시 연관 엔티티를 row마다 한번씩 조회 >> 필요없는 데이터도 조회
        // LAZY - 연관 엔티티는 깡통 객체로 두고 호출하는 순간에만 필요한 row만 조회
        // >> EAGER는 시대의 망령... 무조건 LAZY로 조회
        @JoinColumn(name = "stock_code", referencedColumnName = "stock_code", insertable = false, updatable = false)
        private StockEntity stock;

        public StockPriceEntity(StockPrice stockPrice) {
                this.stockCode = stockPrice.getStockCode();
                this.priceDate = stockPrice.getPriceDate();
                this.openPrice = stockPrice.getOpenPrice();
                this.highPrice = stockPrice.getHighPrice();
                this.lowPrice = stockPrice.getLowPrice();
                this.closePrice = stockPrice.getClosePrice();
                this.volume = stockPrice.getVolume();
                this.priceChange = stockPrice.getPriceChange();
                this.priceChangeRate = stockPrice.getPriceChangeRate();
                this.stock = new StockEntity(stockPrice.getStock());
        }
}
