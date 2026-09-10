package com.stocktracer.backend.tag;

import com.stocktracer.backend.value.domain.ScoredScope;

import java.math.BigDecimal;

/* tag 생성 */
public record StockTag(
        TagCode code,
        BigDecimal evidence,
        ScoredScope scope
) {
    // 판단 근거가 있는 경우
    public static StockTag of(
            TagCode code,
            BigDecimal evidence,
            ScoredScope scope
    ){
        return new StockTag(
                code,
                evidence,
                scope
        );
    }

    // 판단 근거가 없는 경우
    public static StockTag of(
            TagCode code
    ){
        return new StockTag(
                code,
                null,
                null
        );
    }
}
