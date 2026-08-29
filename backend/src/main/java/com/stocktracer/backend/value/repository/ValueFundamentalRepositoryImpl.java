package com.stocktracer.backend.value.repository;

import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.mapper.ValueFundamentalMapper;
import com.stocktracer.backend.value.repository.interfaces.ValueFundamentalRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor // 생성자 주입 함수 생성
public class ValueFundamentalRepositoryImpl implements ValueFundamentalRepository {
    private final ValueFundamentalMapper mapper;

    @Override
    public int upsertAll(List<ValueFundamental> values) {
        int affected = 0;
        List<List<ValueFundamental>> batches = ListUtils.partition(values, 500);
        for(List<ValueFundamental> batch : batches){
            affected = mapper.upsertAll(values);
        }
        return affected;
    }
}
