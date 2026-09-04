package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveResponseDto;
import com.stocktracer.backend.value.repository.interfaces.ValueFundamentalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValueFundamentalService {
    private final ValueFundamentalRepository repository;

    @Transactional
    public int save(ValueFundamentalSaveRequestDto request){
        // 검증
        validateNoDuplicateKey(request);

        // dto 도메인으로 변환
        List<ValueFundamental> values = request.toDomain();

        // ValueFundamental 저장
        int affected = repository.upsertAll(values);

        log.debug("value 데이터 저장 완료: 요청={}건, 반영={}건", values.size(), affected);

        return affected;
    }

    /**
     * 종목코드 중복 검증
     * @param request
     */
    private void validateNoDuplicateKey(ValueFundamentalSaveRequestDto request){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = request.items().stream()
                .map(i -> i.effectiveDate() + "@" + i.stockCode())
                .filter(key -> !seen.add(key))
                .distinct()
                .toList();

        if (!duplicates.isEmpty()){
            throw new IllegalArgumentException(("중복된 key: " + duplicates));
        }
    }
}
