package com.stocktracer.backend.main.domain;

import com.stocktracer.backend.tag.domain.TagCode;

import javax.swing.text.html.HTML;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

import static com.stocktracer.backend.common.util.BIgDecimalUtils.lte;

public enum StockStatus {
    RECOMMENDED("권장",
            t -> t.contains(TagCode.FLOW_STRONG)
            && t.contains(TagCode.UNDERVALUED)
            && !t.contains(TagCode.VALUE_TRAP)),
    RISK("위험",
            t -> t.contains(TagCode.VALUE_TRAP)
            || (t.contains(TagCode.FLOW_WEAK) && t.contains(TagCode.VALUE_WEAK))),
    NEUTRAL("중립", t -> true);

    private final String label;
    private final Predicate<Set<String>> condition;

    StockStatus(String label, Predicate<Set<String>> condition){
        this.label = label;
        this.condition = condition;
    }

    // status 결정 메서드
    public static StockStatus resolve(Set<String> tags){
        // ENUM의 필드를 순회하여 조건 검사 & true인 조건 중 첫번쨰 조건 반환
        return Arrays.stream(values())
                .filter(status -> status.condition.test(tags))
                .findFirst()
                .orElse(NEUTRAL);
    }
}
