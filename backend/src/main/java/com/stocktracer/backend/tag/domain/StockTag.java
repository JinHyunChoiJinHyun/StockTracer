package com.stocktracer.backend.tag.domain;

import java.time.LocalDate;

public record StockTag(
        LocalDate baseDate,
        String stockCode,
        TagCode tagCode
) {
}
