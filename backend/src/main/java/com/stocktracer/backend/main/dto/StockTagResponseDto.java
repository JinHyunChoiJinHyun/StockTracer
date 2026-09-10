package com.stocktracer.backend.main.dto;

import com.stocktracer.backend.tag.StockTag;

import java.math.BigDecimal;

/**
 * 프론트로 전달하는 태그 표현
 * @param code 필터링 / 정렬용 식별자
 * @param label 기본 라벨
 * @param plain 설명 라벨
 * @param sentiment 색상 결정용 방향성
 * @param evidence 판정 근거 수치
 * @param scopeLabel 근거 수치 모집단
 */
public record StockTagResponseDto(
        String code,
        String label,
        String plain,
        String sentiment,
        BigDecimal evidence,
        String scopeLabel
) {
    public static StockTagResponseDto from(StockTag tag){
        return new StockTagResponseDto(
                tag.code().name(),
                tag.code().label(),
                tag.code().plain(),
                tag.code().sentiment().name(),
                tag.evidence(),
                tag.scope() == null ? null : tag.scope().label()
                );
    }
}
