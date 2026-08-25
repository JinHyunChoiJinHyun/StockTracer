package com.stocktracer.backend.value.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record EpsHistory(
        String stockCode,
        BigDecimal eps,
        BigDecimal prevEps,
        LocalDate effectiveDate,
        LocalDate prevEffectiveDate
) {
    // 성장률 계산
    public BigDecimal epsGrowth(){
        if (prevEps == null || prevEps.signum() == 0) return null;
        return eps.subtract(prevEps).divide(prevEps.abs(), 4, RoundingMode.HALF_UP);
    }
}
