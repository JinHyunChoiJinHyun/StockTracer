package com.stocktracer.backend.value.domain;

public enum ScoredScope {
    SECTOR("업종 내"),
    MARKET("시장 전체");

    private final String label;

    ScoredScope(String label){this.label = label;}

    public String label(){return label;}
}
