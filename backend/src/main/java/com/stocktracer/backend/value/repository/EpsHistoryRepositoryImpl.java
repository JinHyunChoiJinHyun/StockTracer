package com.stocktracer.backend.value.repository;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.mapper.EpsHistoryMapper;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EpsHistoryRepositoryImpl implements EpsHistoryRepository {
    private final EpsHistoryMapper mapper;

    @Override
    public List<EpsHistory> findPrevEps(LocalDate baseDate, int lag) {
        return mapper.findPrevEps(baseDate, lag);
    }
}
