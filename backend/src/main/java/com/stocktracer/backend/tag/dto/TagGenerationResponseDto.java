package com.stocktracer.backend.tag.dto;

import com.stocktracer.backend.tag.domain.TagCode;

import java.time.LocalDate;
import java.util.Map;

public record TagGenerationResponseDto(
        LocalDate baseDate,
        int stockCount,
        int tagCount,
        Map<TagCode, Long> countByTag
) {
    public static TagGenerationResponseDto empty(LocalDate baseDate){
        return new TagGenerationResponseDto(baseDate, 0, 0, Map.of());
    }
}
