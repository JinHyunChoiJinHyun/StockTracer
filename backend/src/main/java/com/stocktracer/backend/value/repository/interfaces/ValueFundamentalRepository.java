package com.stocktracer.backend.value.repository.interfaces;

import com.stocktracer.backend.value.domain.ValueFundamental;

import java.util.List;

public interface ValueFundamentalRepository {
    public int upsertAll(List<ValueFundamental> values);
}
