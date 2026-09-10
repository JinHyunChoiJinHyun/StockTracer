package com.stocktracer.backend.tag;

import com.stocktracer.backend.value.domain.ValueFundamental;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/* 태그 계산 및 생성 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class StockTagCalculator {
    private static final BigDecimal CHEAP_PERCENTILE = BigDecimal.valueOf(20); // 하위 몇 %까지 저평가인지
    private static final BigDecimal UNDERVALUE_SCORE = BigDecimal.valueOf(70); // 몇 점부터 저평가인지 (높을수록 저평가)
    private static final BigDecimal HIGHG_DIVIDED = BigDecimal.valueOf(4.0); // 몇 %부터 고배당인지

    // private StockTagCalculator(){} == @NoArgsConstructor(access = AccessLevel.PRIVATE)

    /* tag 계산 */
    public static List<StockTag> assemble(ValueFundamental vf){
        // 빈 값 체크
        if (vf == null){
            return List.of();
        }

        List<StockTag> tags = new ArrayList<>();

        /* 계산 */
        // value_trap 계산
        if (vf.isValueTrap()){
            tags.add(StockTag.of(TagCode.VALUE_TRAP, vf.epsGrowth(), null));
        } else if (vf.isEarningShrinking()){
            // 이익 감소 중이나 value_trap이 아닌 경우
            tags.add(StockTag.of(TagCode.EARNING_SHRINKING, vf.epsGrowth(), null));
        }

        // 배당 계산
        if (isGreaterThanOrEqual(vf.divYield(), HIGHG_DIVIDED)){
            tags.add(StockTag.of(TagCode.HIGH_DIVIDED, vf.divYield(), null));
        }

        // null 체크
        if (!vf.isScored()){
            return List.copyOf(tags);
        }

        // 저평가 계산
        if (isGreaterThanOrEqual(vf.valueScore(), UNDERVALUE_SCORE)){
            tags.add(StockTag.of(TagCode.UNDERVALUED, vf.valueScore(), vf.scoredScope()));
        }

        // per 백분위 비교
        if (isLessThanOrEqual(vf.perPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PER, vf.perPct(), vf.scoredScope()));
        }

        // pbr 백분위 비교
        if (isLessThanOrEqual(vf.pbrPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PBR, vf.pbrPct(), vf.scoredScope()));
        }

        return List.copyOf(tags);
    }

    // 입력값이 임계값 이상인지 계산
    private static boolean isGreaterThanOrEqual(BigDecimal value, BigDecimal threshold){
        return value != null && value.compareTo(threshold) >= 0;
    }
    // 입력값이 임계값 이하인지 계산
    private static boolean isLessThanOrEqual(BigDecimal value, BigDecimal threshold){
        return value != null && value.compareTo(threshold) <= 0;
    }

}
