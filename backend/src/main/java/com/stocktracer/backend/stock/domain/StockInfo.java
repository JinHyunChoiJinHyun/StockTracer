package com.stocktracer.backend.stock.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
/**
 * Domain은 JPA(Entity)를 알지 못하도록 유지한다.
 * 변환 책임은 Entity(또는 Repository 구현체) 쪽에 둔다.
 * -> persistence 기술이 바뀌어도 Domain 로직은 영향받지 않는다. (= 기술 변경 시에도 수정 안해도 된다)
 */
@Getter
@NoArgsConstructor
public class StockInfo {
    private String stockCode;
    private String stockName;
    private MarketType market;

    @Builder
    public StockInfo(String stockCode, String stockName, MarketType market){
        validateStockCode(stockCode);
        validateStockName(stockName);

        this.stockCode = stockCode;
        this.stockName = stockName;
        this.market = market;
    }

    /** 검증 메서드 */
    private void validateStockCode(String stockCode){
        if (stockCode == null || stockCode.isBlank()){
            throw new IllegalArgumentException("종목코드는 필수입니다.");
        }
    }

    private void validateStockName(String stockName){
        if (stockName == null || stockName.isBlank()){
            throw new IllegalArgumentException("종목명은 필수입니다.");
        }
    }

    /** 비즈니스 메서드 */
    public void update(String stockName, MarketType market){
        this.stockName = stockName;
        this.market = market;
    }
}
