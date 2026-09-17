package com.stocktracer.backend.tag.domain;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.function.Predicate;

@Getter
public enum TagCode {
    // 수급
    FLOW_STRONG("수급 강세", s -> gte(s.flowScore(), 70)),

    // 가치
    UNDERVALUED("저평가", s -> s.valueScore() != null && gte(s.valueScore(), 70)),
    HIGH_DIVIDEND("고배당", s -> gte(s.divYield(), 4)),

    // 경고
    VALUE_TRAP("실적악화", s -> isTrue(s.valueTrap()));

    private final String displayName;
    private final Predicate<TagSnapshot> condition;

    TagCode(String displayName, Predicate<TagSnapshot> condition){
        this.displayName = displayName;
        this.condition = condition;
    }

    // 헬퍼 메서드
    private static boolean gte(BigDecimal value, double threshold){
        return value != null && value.compareTo(BigDecimal.valueOf(threshold)) >= 0;
    }

    private static boolean isTrue(Boolean value) {
        return Boolean.TRUE.equals(value);
    }
}
