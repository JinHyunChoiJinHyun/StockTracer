package com.stocktracer.backend.common.validate;

import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

public final class Validates {
    // List<T>의 각 원소(item)를 입력 받은 함수(item -> item.stockCode() + "@" + item.effectiveDate())에 대입
    public static <T> void duplicateKeys(List<T> items, Function<T, String> keyOf){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = items.stream()
                .map(keyOf)
                .filter(key -> !seen.add(key))
                .distinct()
                .toList();

        if (!duplicates.isEmpty()){
            throw new IllegalArgumentException(("중복된 key: " + duplicates));
        }
    }
}
