package com.stocktracer.backend.value.repository.interfaces;

import com.stocktracer.backend.value.domain.EpsHistory;

import java.time.LocalDate;
import java.util.List;

public interface EpsHistoryRepository {

    public List<EpsHistory> findPrevEps(LocalDate baseDate, int lag);
}
