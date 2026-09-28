package com.stocktracer.backend.tag.service;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagCode;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import com.stocktracer.backend.tag.dto.TagGenerationResponseDto;
import com.stocktracer.backend.tag.repository.interfaces.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagGenerationService {
    private final TagRepository repository;

    // 태그 생성
    @Transactional
    public TagGenerationResponseDto tagGenerate(LocalDate baseDate){
        // 태그 계산 필드 조회
        List<TagSnapshot> snapshots = repository.findSnapshots(baseDate);

        // 태그 계산 필드가 존재하지 않을 시
        if (snapshots.isEmpty()){
            log.warn("태그 생성 대상 없음 baseDate={}", baseDate);
            return TagGenerationResponseDto.empty(baseDate);
        }

        // 태그 계산 및 저장
        List<StockTag> tags = evaluate(snapshots);
        int saved = repository.replaceByBaseDate(baseDate, tags);

        // 태그 개수 출력
        Map<TagCode, Long> countByTag = tags.stream()
                        .collect(Collectors.groupingBy(
                                StockTag::tagCode,
                                Collectors.counting()
                        ));

        log.info("태그 생성 완료. baseDate={}, 종목={}건, 태그={}건", baseDate, snapshots.size(), saved);
        return new TagGenerationResponseDto(baseDate, snapshots.size(), saved, countByTag);
    }

    // 태그 계산 필드 전달
    private List<StockTag> evaluate(List<TagSnapshot> snapshots){
        List<StockTag> tags = new ArrayList<>();
        for (TagSnapshot snapshot : snapshots){
            // 모든 enum 상수 순회
            for (TagCode tagCode : TagCode.values()){
                // snapshot이 각 TagCode의 조건을 충족하는지 검사
                if (tagCode.matches(snapshot)){
                    // snapshot의 필드가 조건을 충족하는 태그만 저장
                    tags.add(new StockTag(snapshot.baseDate(),snapshot.stockCode(), tagCode));
                }
            }
        }
        return tags;
    }
}
