package com.stocktracer.backend.main.repository;

import com.stocktracer.backend.main.dto.MainStockQuery;
import com.stocktracer.backend.main.mapper.MainStockQueryMapper;
import com.stocktracer.backend.main.mapper.MainStockRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MainStockQueryRepositoryImpl implements MainStockQueryRepository{
    private final MainStockQueryMapper mapper;

    @Override
    public Optional<LocalDate> findLatestBaseDate() {
        return mapper.findLatestBaseDate();
    }

    @Override
    public List<MainStockRow> findRows(MainStockQuery query) {
        return mapper.findMainStockRows(query);
    }

    @Override
    public long countRows(MainStockQuery query) {
        return mapper.countMainStockRows(query);
    }
}
