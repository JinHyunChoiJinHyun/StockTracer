package com.stocktracer.backend.stock.domain;

import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import lombok.*;

import java.util.Objects;

/**
 * Domain은 JPA(Entity)를 알지 못하도록 유지한다.
 * 변환 책임은 Entity(또는 Repository 구현체) 쪽에 둔다.
 * -> persistence 기술이 바뀌어도 Domain 로직은 영향받지 않는다. (= 기술 변경 시에도 수정 안해도 된다)
 */
@Getter
@Builder(access = AccessLevel.PRIVATE) // 외부 build 차단
@NoArgsConstructor
@AllArgsConstructor
public class StockInfo {
    private String stockCode;
    private String stockName;
    private MarketType market;

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
    // 유일한 생성 지점 -> 외부에서 생성 시 무조건 검증 후 객체 생성
    public static StockInfo create(String stockCode, String stockName, MarketType market){ // 도메인 객체의 성격에 따라 of로 대체 가능
        validate(stockCode, stockName);
        return new StockInfo(stockCode, stockName, market);
    }

    // 정정 생성 매서드 (파라미터가 하나이므로 from으로 생성) -> 변환 필요 시 사용
    public static StockInfo from(StockInfoEntity entity){
        return create(entity.getStockCode(), entity.getStockName(), entity.getMarket());
    }

    public StockInfo update(StockInfo other){
        return create(this.stockCode, other.getStockName(), other.getMarket()); // stockCode는 업데이트 되면 안됨
    }

    // 변경된 dto 내용 조회
    public boolean hasChanged(StockInfo other){
        return !Objects.equals(this.stockName, other.stockName)
                || this.market != other.market;
    }
}
