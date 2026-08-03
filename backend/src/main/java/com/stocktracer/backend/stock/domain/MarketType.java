package com.stocktracer.backend.stock.domain;
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
}
