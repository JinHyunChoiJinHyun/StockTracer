package com.stocktracer.backend.stock.domain;

import com.stocktracer.backend.stock.repository.entitiy.StockInfoEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
/**
 * Domain은 JPA(Entity)를 알지 못하도록 유지한다.
 * 변환 책임은 Entity(또는 Repository 구현체) 쪽에 둔다.
 * -> persistence 기술이 바뀌어도 Domain 로직은 영향받지 않는다. (= 기술 변경 시에도 수정 안해도 된다)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockInfo {
    private String stockCode;
    private String stockName;
    private MarketType market;

    // 정정 생성 매서드 (파라미터가 하나이므로 from으로 생성)
    public static StockInfo from(StockInfoEntity entity){
        StockInfo stockInfo = StockInfo.builder()
                .stockCode(entity.getStockCode())
                .stockName(entity.getStockName())
                .market(entity.getMarket())
                .build();

        stockInfo.validateStockCode();
        stockInfo.validateStockName();

        return stockInfo;
    }

    /** 검증 메서드 */
    private void validateStockCode(){
        if (stockCode == null || stockCode.isBlank()){
            throw new IllegalArgumentException("종목코드는 필수입니다.");
        }
    }

    private void validateStockName(){
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
