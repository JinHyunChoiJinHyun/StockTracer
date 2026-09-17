package com.stocktracer.backend.tag.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TagSnapshot(
        LocalDate baseDate,
        String stockCode,

        BigDecimal flowScore,

        BigDecimal valueScore,
        BigDecimal divYield,
        Boolean valueTrap
) {

}
