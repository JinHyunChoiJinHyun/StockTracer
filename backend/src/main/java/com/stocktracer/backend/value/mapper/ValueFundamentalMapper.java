package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.value.domain.ValueFundamental;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ValueFundamentalMapper {
    int upsertAll(@Param("values")List<ValueFundamental> values);
}
