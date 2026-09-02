package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.EpsHistorySaveResponseDto;
import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
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
public class EpsHistoryService {
    private final EpsHistoryRepository repository;

    /* 조회 */
    @Transactional(readOnly = true)
    public EpsPrevResponseDto getPrevEps(LocalDate baseDate){
        validateBaseDate(baseDate);
        List<EpsHistory> items = repository.findPrevEps(baseDate);

        if(items.isEmpty()){
            log.warn("prev_eps 이력 없음: baseDate={}", baseDate);
        } else {
            log.info("prev_eps 조회: baseDate={} 건수={}", baseDate, items.size());
        }

        return EpsPrevResponseDto.of(baseDate, 1,items);
    }

    /* 저장 */
    @Transactional
    public int save(EpsHistorySaveRequestDto request){
        // 검증
        validateNoDuplicateKey(request);

        // 도메인 변환
        List<EpsHistory> eps = request.toDomain();

        int affected = repository.upsertAll(eps);

        log.debug("eps 데이터 저장 완료: 요청={}건, 반영={}",eps.size(), affected);

        return affected;
    }

    /* 검증 */
    private void validateBaseDate(LocalDate baseDate){
        if (baseDate == null){
            throw new IllegalArgumentException(("baseDate는 필수입니다"));
        }

        if (baseDate.isAfter(LocalDate.now())){
            throw new IllegalArgumentException("미래 일자는 조회할 수 없습니다: " + baseDate);
        }
    }

    private void validateNoDuplicateKey(EpsHistorySaveRequestDto request){
        Set<String> seen = new HashSet<>();
        List<String> duplicates = request.items().stream()
                .map(i -> i.stockCode() + "@" + i.effectiveDate())
                .filter(key -> !seen.add(key))
                .distinct()
                .toList();

        if (!duplicates.isEmpty()){
            throw new IllegalArgumentException(("중복된 key: " + duplicates));
        }
    }
}
