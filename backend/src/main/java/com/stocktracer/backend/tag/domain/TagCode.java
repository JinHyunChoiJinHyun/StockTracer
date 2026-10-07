package com.stocktracer.backend.tag.domain;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static com.stocktracer.backend.common.util.BIgDecimalUtils.gte;
import static com.stocktracer.backend.common.util.BIgDecimalUtils.lte;

@Getter
public enum TagCode {
    // 수급
    FLOW_STRONG("수급 강세", s -> gte(s.flowScore(), 70)),

    // 가치
    UNDERVALUED("저평가", s -> s.valueScore() != null && gte(s.valueScore(), 70)),
    HIGH_DIVIDEND("고배당", s -> gte(s.divYield(), 4)),

    // 위험
    VALUE_TRAP("실적악화", s -> isTrue(s.valueTrap())),
    FLOW_WEAK("수급 약세", s -> lte(s.flowScore(), 40)),
    VALUE_WEAK("가치 없음", s -> lte(s.valueScore(), 40));

    private final String label;
    private final Predicate<TagSnapshot> condition;

    TagCode(String label, Predicate<TagSnapshot> condition){
        this.label = label;
        this.condition = condition;
    }

    // 태그의 condition 충족 여부 반환
    public boolean matches(TagSnapshot snapshot){
        // condition에 저장된 람다식 실행 (충족 시 true / 미충족 시 false)
        return condition.test(snapshot);
    }

    // 헬퍼 메서드
    private static boolean isTrue(Boolean value) {
        return Boolean.TRUE.equals(value);
    }

    // 태그 분리
    public static Set<TagCode> splitTags(String tags){
        if (tags == null || tags.isBlank()){
            return EnumSet.noneOf(TagCode.class);
        }
        // string을 공백 처리한 후 빈 EnumSet에 결과 저장
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(TagCode::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(TagCode.class)));
    }
}
