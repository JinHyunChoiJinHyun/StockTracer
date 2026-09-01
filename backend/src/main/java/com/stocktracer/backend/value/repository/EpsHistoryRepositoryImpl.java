package com.stocktracer.backend.value.repository;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.mapper.EpsHistoryMapper;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EpsHistoryRepositoryImpl implements EpsHistoryRepository {
    private final EpsHistoryMapper mapper;

    @Override
    public List<EpsHistory> findPrevEps(LocalDate baseDate) {
        return mapper.findPrevEps(baseDate);
    }

    @Override
    public int upsertAll(List<EpsHistory> eps) {
        int affected = 0;
        List<List<EpsHistory>> batches = ListUtils.partition(eps, 1000);
        for (List<EpsHistory> batch : batches){
            affected = mapper.upsertAll(eps);
        }
        return affected;
    }
}
