package com.stocktracer.backend.tag.repository;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import com.stocktracer.backend.tag.mapper.TagMapper;
import com.stocktracer.backend.tag.repository.interfaces.TagRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TagRepositoryImpl implements TagRepository {
    private final TagMapper mapper;

    public List<TagSnapshot> findSnapshots(LocalDate baseDate){
        return mapper.selectSnapshots(baseDate);
    }

    public int replaceByBaseDate(LocalDate baseDate, List<StockTag> tags){
        mapper.deleteByBaseDate(baseDate);

        int affected = 0;

        List<List<StockTag>> batches = ListUtils.partition(tags, 1000);
        for(List<StockTag> batch : batches){
            affected += mapper.insertAll(batch);
        }

        return affected;
    }
}
