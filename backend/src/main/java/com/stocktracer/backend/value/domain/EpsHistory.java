package com.stocktracer.backend.value.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record EpsHistory(
        String stockCode,
        BigDecimal prevEps,
        LocalDate prevEffectiveDate
) {}
