package com.stocktracer.backend.price.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

import java.util.List;

@Builder
public record StockPriceBulkSaveRequestDto(
        /** 빈 리스트 방지와 내부 데이터 검증이 필요한 이유 */
        // 1. 빈 리스트가 입력될 시 불필요한 서비스 로직 호출이나 db 커넥션 사전 차단
        // 2. 정보가 엉망인 데이터로 인한 db 오염 방지
        // >> 서비스 호출 전 검증하여 1번 요소 수행
        @NotEmpty String stockCode,
        @NotEmpty @Valid List<StockPriceSaveRequestDto> prices
){
}
