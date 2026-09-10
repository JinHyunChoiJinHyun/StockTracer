package com.stocktracer.backend.main.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/* 필터 사용 시 쿼리문에 넘길 조회 조건 */
public record MainStockQuery(
        BigDecimal minValueScore,
        BigDecimal maxPerPct,
        BigDecimal maxPbrPct,
        BigDecimal minDivYield,
        boolean excludeValueTrap,
        boolean requireScored,
        MainStockSort sort,
        long offset,
        int limit

) {
    public enum MainStockSort {
        // null인 값을 아래로 보내고 값이 있으면 내림차순 정렬
        VALUE_SCORE("vf.value_score IS NULL ASC, vf.value_score DESC"),
        PER_PCT("vf.per_pct IS NULL ASC, vf.per_pct ASC"),
        DIV_YIELD("vf.div_yield IS NULL ASC, vf.div_yield DESC"),
        MARKET_CAP("vf.market_cap DESC"),
        PRICE_CHANGE_DESC("sp.price_change DESC"),
        PRICE_CHANGE_ASC("sp.price_change ASC");

        private final String orderByClause;

        MainStockSort(String orderByClause){this.orderByClause = orderByClause;}

        public String getOrderByClause(){return orderByClause;} // MyBatis가 {@code ${criteria.sort.orderByClause}}로 꺼내서 사용

        // 정렬 기준 enum으로 변환
        public static MainStockSort from(String raw){
            if (raw == null || raw.isBlank()){
                return MARKET_CAP;
            }

            try {
                return valueOf(raw.trim().toUpperCase());
            } catch (IllegalArgumentException e){
                return MARKET_CAP;
            }
        }
    }

    public static MainStockQuery of (
        AnalysisLens lens,
        String rawSort,
        int page,
        int size
    ){
        AnalysisLens.LensFilter f = lens.filter();
        return new MainStockQuery(
                f.minValueScore(),
                f.maxPerPct(),
                f.maxPbrPct(),
                f.minDivYield(),
                f.excludeValueTrap(),
                f.requiredScored(),
                MainStockSort.from(rawSort),
                (long) page * size,
                size
        );
    }
}
