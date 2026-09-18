package com.stocktracer.backend.tag.service;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import com.stocktracer.backend.tag.repository.interfaces.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagGenerationService {
    private final TagRepository repository;

    // 태그 생성
    @Transactional
    public int tagGenerate(LocalDate baseDate){
        // 태그 계산 필드 조회
        List<TagSnapshot> snapshots = repository.findSnapshots(baseDate);

        // 태그 계산 필드가 존재하지 않을 시
        if (snapshots.isEmpty()){
            log.warn("태그 생성 대상 없음 baseDate={}", baseDate);
            return 0;
        }

        //
    }

    // 태그 계산 필드 전달
    private List<StockTag> evaluate(List<TagSnapshot> snapshots){
        List<StockTag> tags = new ArrayList<>();

    }
}
