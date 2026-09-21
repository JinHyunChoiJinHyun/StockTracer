package com.stocktracer.backend.stock.domain;

import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import lombok.*;

import java.util.Objects;

/**
 * Domain은 JPA(Entity)를 알지 못하도록 유지한다.
 * 변환 책임은 Entity(또는 Repository 구현체) 쪽에 둔다.
 * -> persistence 기술이 바뀌어도 Domain 로직은 영향받지 않는다. (= 기술 변경 시에도 수정 안해도 된다)
 */
public record StockInfo (
        String stockCode,
        String stockName,
        MarketType market,
        String sector
){
    /* 생성자 */
    public StockInfo{
        validate(stockCode, stockName);
    }

    /** 검증 메서드 */
    private static void validate(String stockCode, String stockName){
        if (stockCode == null || stockCode.isBlank()){
            throw new IllegalArgumentException("종목코드는 필수입니다.");
        }
        if (stockName == null || stockName.isBlank()){
            throw new IllegalArgumentException("종목명은 필수입니다.");
        }
    }

    /** 비즈니스 메서드 */

    public StockInfo update(StockInfo other){
        return new StockInfo(
                this.stockCode,
                other.stockName,
                other.market,
                other.sector
        ); // stockCode는 업데이트 되면 안됨
    }

    // 변경된 dto 내용 조회
    public boolean hasChanged(StockInfo other){
        return !Objects.equals(this.stockName, other.stockName)
                || this.market != other.market;
    }
}
