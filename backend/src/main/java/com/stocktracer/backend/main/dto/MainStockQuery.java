package com.stocktracer.backend.main.dto;

import com.stocktracer.backend.tag.domain.TagCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/* 필터 사용 시 쿼리문에 넘길 조회 조건 */
public record MainStockQuery(
        LocalDate baseDate,
        String keyword,
        List<TagCode> tags,
        MainStockSort sort,
        long offset,
        int limit

) {
    public enum MainStockSort {
        // null인 값을 아래로 보내고 값이 있으면 내림차순 정렬
        MARKET_CAP("sp.market_cap DESC"),
        DIV_YIELD("vf.div_yield IS NULL ASC, vf.div_yield DESC"),
        CHANGE_RATE("sp.change_rate DESC"),
        STOCK_NAME("si.stock_name ASC"),
        STOCK_CODE("si.stock_code ASC");

        private final String orderByClause;

        MainStockSort(String orderByClause){this.orderByClause = orderByClause;}

        public String getOrderByClause(){return orderByClause;}

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
        LocalDate baseDate,
        String keyword,
        List<TagCode> tags,
        MainStockSort sort,
        int page,
        int size
    ){
        return new MainStockQuery(
                baseDate,
                keyword,
                tags,
                sort,
                (long) page * size,
                size
        );
    }
}
