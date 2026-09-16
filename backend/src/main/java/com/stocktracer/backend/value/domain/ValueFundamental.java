package com.stocktracer.backend.value.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

// 불변의 값이 담기므로 record로 작성
public record ValueFundamental (
        LocalDate effectiveDate,
        String stockCode,
        String sector,
        BigDecimal per,
        BigDecimal pbr,
        BigDecimal eps,
        BigDecimal bps,
        BigDecimal divYield,
        Long marketCap,
        Long sharesOutstanding,
        Long tradingValue,
        BigDecimal perPct,
        BigDecimal pbrPct,
        BigDecimal valueScore,
        ScoredScope scoredScope,
        BigDecimal epsGrowth,
        Boolean valueTrap
){
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    /* record는 of가 아닌 생성자에서 규칙을 검증하는 이유 */
    // public record는 canonical constructor가 기본 생성 경로이며 외부에서 new로 직접 생성 가능
    // -> 생성자에서 생성 규칙 검증하여 유효성 보장

    public ValueFundamental {
        /* 생성 규칙 검증 */
        if (effectiveDate == null) throw new IllegalArgumentException(("날짜는 필수입니다."));
        if (stockCode == null || !stockCode.matches("[A-Za-z0-9]{6}"))
            throw new IllegalArgumentException("invalid stockCode: " + stockCode);
        validatePctInRange("perPct", perPct);
        validatePctInRange("pbrPct", pbrPct);
        validateNoNegative("marketCap", marketCap);
        validateNoNegative("sharesOutstanding", sharesOutstanding);
        validateNoNegative("tradingValue", tradingValue);
    }

    /* 검증 */
    // 백분위 검증
    private static void validatePctInRange(String name, BigDecimal pct){
        if(pct == null) return;
        if(pct.compareTo(BigDecimal.ZERO) < 0 || pct.compareTo(HUNDRED) > 0){
            throw new IllegalArgumentException(name + "은 0 ~ 100 이내여야 합니다. " + pct);
        }
    }

    // 음수가 아닌지 검증
    private static void validateNoNegative(String name, Long value){
        if (value != null && value < 0){
            throw new IllegalArgumentException(name + "은 음수가 될 수 없습니다. " + value);
        }
    }

    /* tag 계산 */
    // 계산 가능한지 확인
    public boolean isScored(){
        return scoredScope != null && valueScore != null;
    }

    // value_trap 확인 (null인 경우 에러 방지)
    public boolean isValueTrap(){
        return Boolean.TRUE.equals(valueTrap);
    }

    // 이익 감소 확인 (성장률이 음수인지 확인)
    public boolean isEarningShrinking(){
        return epsGrowth != null && epsGrowth.compareTo(BigDecimal.ZERO) < 0;
    }
}
