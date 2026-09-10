package com.stocktracer.backend.main.dto;

import java.math.BigDecimal;
import java.util.Arrays;

/* 프론트엔드 필터 렌즈 */
public enum AnalysisLens {
    // 종합 저평가 점수 상위
    VALUE(new LensFilter(BigDecimal.valueOf(70), null, null, null, false)),
    // per 기준 저평가
    CHEAP_EARNINGS(new LensFilter(null, BigDecimal.valueOf(20), null, null, false)),
    // pbr 기준 저평가
    CHEAP_ASSETS(new LensFilter(null, null, BigDecimal.valueOf(20), null, false)),
    // 배당 중심
    DIVIDED(new LensFilter(null, null, null, BigDecimal.valueOf(4.0), false)),
    // value_trap을 거둬낸 저평가
    SAFE_VALUE(new LensFilter(BigDecimal.valueOf(20),null, null, null,true)),
    // 기본 목록
    ALL(new LensFilter(null,null, null, null,true));

    private final LensFilter filter;

    AnalysisLens(LensFilter filter) {
        this.filter = filter;
    }

    public LensFilter filter(){return filter;}

    public static AnalysisLens from(String raw){
        if (raw == null || raw.isBlank()){
            return ALL;
        }

        return Arrays.stream(values())
                .filter(lens -> lens.name().equalsIgnoreCase(raw.trim()))
                .findFirst()
                .orElse(ALL);
    }

    /**
     * 렌즈 필터 조건 (해당 파일 내에서만 유효하므로 해당 파일에만 작성)
     * @param minValueScore
     * @param maxPerPct
     * @param maxPbrPct
     * @param minDivYield
     * @param excludeValueTrap
     */
    public record LensFilter(
            BigDecimal minValueScore,
            BigDecimal maxPerPct,
            BigDecimal maxPbrPct,
            BigDecimal minDivYield,
            boolean excludeValueTrap
    ){
        public boolean requiredScored(){
            return minValueScore != null || maxPerPct != null || maxPbrPct != null;
        }
    }
}
