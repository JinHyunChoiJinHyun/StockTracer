package com.stocktracer.backend.stock.domain;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

@Getter
public enum MarketType {
    KOSPI("코스피", "유가증권시장"),
    KOSDAQ("코스닥", "코스닥시장"),
    KONEX("코넥스", "코넥스시장");

    private final String shortName;
    private final String description;

    MarketType(String shortName, String description) {
        this.shortName = shortName;
        this.description = description;
    }

    /** 검증 메서드 */
    @JsonCreator
    public static MarketType replaceMarket(String input){
        if (input == null || input.isBlank()){
            throw new IllegalArgumentException(("Market 값이 비었습니다."));
        }
        String cleanInput = input.trim().toUpperCase();

        // 1. KOSDAQ과 KOSDAQ GLOBAL 모두 KOSDAQ으로 매핑
        if (cleanInput.contains("KOSDAQ")) {
            return KOSDAQ;
        }

        // 2. KOSPI 매핑
        if (cleanInput.contains("KOSPI")) {
            return KOSPI;
        }

        // 3. KONEX 매핑
        if (cleanInput.contains("KONEX")) {
            return KONEX;
        }
        try{
            return MarketType.valueOf(cleanInput);
        } catch (IllegalArgumentException e){
            throw new IllegalArgumentException(("지원하지 않는 Market 타입입니다." + input));
        }
    }
}
