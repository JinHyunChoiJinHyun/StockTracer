package com.stocktracer.backend.tag.mapper;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import jakarta.validation.constraints.Max;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TagMapper {
    // tag 계산 정보 조회
    List<TagSnapshot> selectSnapshots(
            @Param("baseDate") LocalDate baseDate
    );

    // 동일 날짜 태그 재계산 시 사용
    int deleteByBaseDate(
            @Param("baseDate") LocalDate baseDate
    );

    // 태그 저장
    int insertAll(
            @Param("tags") List<StockTag> tags
    );
}
