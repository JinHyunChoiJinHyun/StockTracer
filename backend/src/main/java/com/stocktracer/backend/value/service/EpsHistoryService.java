package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpsHistoryService {
    private final EpsHistoryRepository repository;

    @Transactional(readOnly = true)
    public EpsPrevResponseDto getPrevEps(LocalDate baseDate, int lag){
        validate(baseDate);
        List<EpsHistory> items = repository.findPrevEps(baseDate, lag);

        if(items.isEmpty()){
            log.warn("prev_eps 이력 없음: baseDate={} lag={}", baseDate, lag);
        } else {
            log.info("prev_eps 조회: baseDate={} lag={} 건수={}", baseDate, lag, items.size());
        }

        return EpsPrevResponseDto.of(baseDate,lag,items);
    }

    /* 검증 */
    private void validate(LocalDate baseDate){
        if (baseDate == null){
            throw new IllegalArgumentException(("baseDate는 필수입니다"));
        }

        if (baseDate.isAfter(LocalDate.now())){
            throw new IllegalArgumentException("미래 일자는 조회할 수 없습니다: " + baseDate);
        }
    }
}
