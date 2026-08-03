package com.stocktracer.backend.stock.domain;

import aQute.bnd.annotation.headers.BundleLicense;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class Stock {
    private Long id;
    private String stockCode;
    private String stockName;
    private MarketType marketType;

    @Builder
    public Stock(Long id, String stockCode, String stockName, MarketType marketType){
        validateStockCode(stockCode);
        validateStockName(stockName);

        this.id = id;
        this.stockCode = stockCode;
        this.stockName = stockName;
        this.marketType = marketType;
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
    // 1. 주식명 변경
    public void changeStockName(String newName){
        this.stockName = newName;
    }

    // 2. 주식 시장 변경
    public void changeMarketType(MarketType newMarketType){
        if(this.marketType == newMarketType){
            return;
        }
        this.marketType = newMarketType;
    }
}
