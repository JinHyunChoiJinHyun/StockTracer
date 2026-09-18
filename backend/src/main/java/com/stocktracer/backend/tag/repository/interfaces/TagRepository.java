package com.stocktracer.backend.tag.repository.interfaces;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagSnapshot;

import java.time.LocalDate;
import java.util.List;

public interface TagRepository {
    public List<TagSnapshot> findSnapshots(LocalDate baseDate);

    public int replaceByBaseDate(LocalDate baseDate, List<StockTag> tags);
}
