package com.stocktracer.backend.main.service;

import com.stocktracer.backend.main.domain.StockStatus;
import com.stocktracer.backend.main.dto.MainStockPageResponseDto;
import com.stocktracer.backend.main.dto.MainStockQuery;
import com.stocktracer.backend.main.dto.MainStockResponseDto;
import com.stocktracer.backend.main.mapper.MainStockRow;
import com.stocktracer.backend.main.repository.MainStockQueryRepository;
import com.stocktracer.backend.tag.domain.TagCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MainStockQueryService {
    private final MainStockQueryRepository repository;

    @Transactional(readOnly = true) // 트랜젝션 범위 명시 (기준 시점 일치를 위해)
    public MainStockPageResponseDto getMainStocks(String keyword, List<TagCode> tags, MainStockQuery.MainStockSort sort, int page, int size){
        // 1. 최신 영업일 조회
        LocalDate baseDate = repository.findLatestBaseDate()
                .orElseThrow(() -> new IllegalArgumentException(
                        "거래일 데이터가 없습니다."
                ));
        // 2. 쿼리 생성
        String trimmedKeyword = keyword.trim();
        MainStockQuery query = MainStockQuery.of(baseDate, trimmedKeyword, tags, sort, page, size);

        // 주식 정보 db 조회
        List<MainStockRow> rows = repository.findRows(query);

        // 조회한 정보 객체로 변환
        List<MainStockResponseDto> stocks = rows.stream()
                .map(this::toResponse)
                .toList();

        // 전체 데이터 갯수 조회
        long totalElements = repository.countRows(query);

        return MainStockPageResponseDto.of(baseDate, stocks, page, size, totalElements);
    }

    // dto 변환 메서드
    private MainStockResponseDto toResponse(MainStockRow row){
        Set<String> tags = TagCode.splitTags(row.tags());
        StockStatus status = StockStatus.resolve(tags);
        return MainStockResponseDto.of(row, tags, status);
    }
}
