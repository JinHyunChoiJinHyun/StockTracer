package com.stocktracer.backend.value.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record EpsHistory(
        String stockCode,
        LocalDate effectiveDate,
        BigDecimal eps
) {
    public EpsHistory {
        if (stockCode == null || !stockCode.matches("[A-Za-z0-9]{6}"))
            throw new IllegalArgumentException("허용되지 않는 종목코드: " + stockCode);
        if (effectiveDate == null)
            throw new IllegalArgumentException("날짜는 필수입니다.");
        if (eps == null)
            throw new IllegalArgumentException("eps는 필수입니다.");
    }
}
