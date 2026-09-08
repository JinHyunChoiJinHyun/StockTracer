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

import static com.stocktracer.backend.common.validate.Validates.duplicateKeys;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValueFundamentalService {
    private final ValueFundamentalRepository repository;

    @Transactional
    public int save(ValueFundamentalSaveRequestDto request){
        // 검증
        duplicateKeys(request.items(), item -> item.stockCode() + "@" + item.effectiveDate()); // List와 함수 전달
        System.out.println(request.items().stream().map(ValueFundamentalSaveRequestDto.Item::tradingValue).toList());

        // dto 도메인으로 변환
        List<ValueFundamental> values = request.toDomain();

        // ValueFundamental 저장
        int affected = repository.upsertAll(values);

        log.debug("value 데이터 저장 완료: 요청={}건, 반영={}건", values.size(), affected);

        return affected;
    }

}
