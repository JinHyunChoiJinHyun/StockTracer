package com.stocktracer.backend.main.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * 페이지 응답
 * 여러 주식 정보 dto으롤 List로 감싸서 페이지별로 응답
 */
public record MainStockPageResponseDto(
        LocalDate baseDate,
        String lens,
        List<MainStockResponseDto> stocks,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static MainStockPageResponseDto of(
            LocalDate baseDate,
            AnalysisLens lens,
            List<MainStockResponseDto> stocks,
            int page,
            int size,
            long totalElements
    ){
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        return new MainStockPageResponseDto(
                baseDate,
                lens.name(),
                stocks,
                page,
                size,
                totalElements,
                totalPages
        );
    }
}
