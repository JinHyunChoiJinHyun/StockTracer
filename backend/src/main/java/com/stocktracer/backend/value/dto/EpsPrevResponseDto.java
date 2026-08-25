package com.stocktracer.backend.value.dto;

import com.stocktracer.backend.value.domain.EpsHistory;

import java.time.LocalDate;
import java.util.List;

public record EpsPrevResponseDto(
        LocalDate baseDate,
        int lag,
        int count,
        int undecidableCount, // prevEps == null인 건수
        List<EpsHistory> items
) {
    /* domain -> dto 변환 */
    // response dto이므로 domain이 아닌 dto 변환 메서드 필요
    // 이미 검증된 값이 들어오므로 굳이 다시 검증할 필요 없음
    public static EpsPrevResponseDto of (
            LocalDate baseDate,
            int lag,
            List<EpsHistory> items
    ){
        long undecidable = items.stream().filter(i -> i.prevEps() == null).count(); // prevEps가 null인 객체의 수를 long 타입으로 반환
        return new EpsPrevResponseDto(
                baseDate,
                lag,
                items.size(),
                (int) undecidable,
                items
        );
    }
}
