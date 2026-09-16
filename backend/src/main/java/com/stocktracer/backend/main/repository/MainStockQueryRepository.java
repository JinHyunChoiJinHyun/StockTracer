package com.stocktracer.backend.main.repository;

import com.stocktracer.backend.main.dto.MainStockQuery;
import com.stocktracer.backend.main.mapper.MainStockRow;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// 상위 계층이 구체적인 DB 조회 방식에 의존하지 않도록 추상화 (DB 조회 방식이 변경돼도 상위 계층 수정 불필요)
public interface MainStockQueryRepository {
    Optional<LocalDate> findLatestBaseDate();
    List<MainStockRow> findRows (MainStockQuery query);
    long countRows(MainStockQuery query);
}
