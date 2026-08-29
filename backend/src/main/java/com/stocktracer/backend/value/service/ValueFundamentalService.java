package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveResponseDto;
import com.stocktracer.backend.value.repository.interfaces.ValueFundamentalRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ValueFundamentalService {
    private final ValueFundamentalRepository repository;

    @Transactional
    public ValueFundamentalSaveResponseDto save(ValueFundamentalSaveRequestDto request){

        // 검증
        validateNoDuplicateStockCode(request);

        // dto 도메인으로 변환
        List<ValueFundamental> values = request.toDomain();
        int affected = repository.upsertAll(values);

        return new ValueFundamentalSaveResponseDto(request.baseDate(),values.size(), affected);
    }

    /**
     * 종목코드 중복 검증
     * @param request
     */
    private void validateNoDuplicateStockCode(ValueFundamentalSaveRequestDto request){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = request.items().stream()
                .map(ValueFundamentalSaveRequestDto.Item :: stockCode)
                .filter(code -> !seen.add(code))
                .distinct()
                .toList();

        if (!duplicates.isEmpty()){
            throw new IllegalArgumentException(("중복된 종목코드: " + duplicates));
        }
    }
}
