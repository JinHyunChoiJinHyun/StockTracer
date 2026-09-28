package com.stocktracer.backend.tag;

import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagCode;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import com.stocktracer.backend.tag.dto.TagGenerationResponseDto;
import com.stocktracer.backend.tag.repository.interfaces.TagRepository;
import com.stocktracer.backend.tag.service.TagGenerationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.stocktracer.backend.tag.domain.TagCode.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;


@ExtendWith(MockitoExtension.class)
public class TagGenerationServiceTest {
    private static final LocalDate baseDate = LocalDate.of(2026,9,25);

    @Mock
    TagRepository repository;

    @InjectMocks
    TagGenerationService service;

    @Captor
    ArgumentCaptor<List<StockTag>> captor;

    /* 공통 */
    // 스냅샷 객체 생성
    private static TagSnapshot snapshot(String code, String flowScore, String valueScore,
                                        String divYield, Boolean valueTrap) {
        return new TagSnapshot(baseDate, code, dec(flowScore), dec(valueScore), dec(divYield), valueTrap);
    }

    // tag 객체 생성
    private static StockTag tag(String code, TagCode tagCode) {
        return new StockTag(baseDate, code, tagCode);
    }

    // big decimal 변환
    private static BigDecimal dec(String s) {
        return s == null ? null : new BigDecimal(s);
    }

    // 높은 점수 → 여러 태그에 걸릴 가능성이 큰 스냅샷 (FLOW_STRONG / UNDERVALUED / HIGH_DIVIDEND)
    private static TagSnapshot strong(String code) {
        return snapshot(code, "95.00", "95.00", "8.0000", false);
    }

    // 수급 분석만 있는 종목 ()
    private static TagSnapshot flowOnly(String code) {
        return snapshot(code, "50.00", null, null, null);
    }

    // 가치 지표만 있는 종목 (UNDERVALUED / HIGH_DIVIDEND / VALUE_TRAP)
    private static TagSnapshot valueOnly(String code) {
        return snapshot(code, null, "95.00", "8.0000", true);
    }

    // given 설정
    private void repositoryReturns(List<TagSnapshot> snapshots) {
        given(repository.findSnapshots(baseDate)).willReturn(snapshots);
    }

    // capture 설정
    private List<StockTag> capturedTags(){
        verify(repository).replaceByBaseDate(eq(baseDate), captor.capture());
        return captor.getValue();
    }

    /* 테스트 */
    @Test
    void 스냅샷이_없으면_저장하지_않고_empty_반환(){
        given(repository.findSnapshots(baseDate)).willReturn(List.of());

        TagGenerationResponseDto result = service.tagGenerate(baseDate);

        assertThat(result).usingRecursiveComparison().isEqualTo(TagGenerationResponseDto.empty(baseDate));
        verify(repository, never()).replaceByBaseDate(any(), any());
    }

    @Test
    void 조건을_충족하는_태그만_해당_날짜와_종목으로_저장한다(){
        List<TagSnapshot> snapshots = List.of(
                strong("005930"),
                flowOnly("000660"),
                valueOnly("123456")
        );

        repositoryReturns(snapshots);

        service.tagGenerate(baseDate);

        verify(repository).replaceByBaseDate(eq(baseDate),captor.capture());
        List<StockTag> saved = captor.getValue();

        assertThat(saved).containsExactlyInAnyOrder(
                tag("005930", FLOW_STRONG),
                tag("005930", UNDERVALUED),
                tag("005930", HIGH_DIVIDEND),
                tag("123456", UNDERVALUED),
                tag("123456", HIGH_DIVIDEND),
                tag("123456", VALUE_TRAP));
    }

    @Test
    void 모든_값이_NULL_이면_빈_리스트_호출해_이전_태그_삭제(){
        repositoryReturns(List.of(snapshot("000001", null, null, null, null)));

        TagGenerationResponseDto result = service.tagGenerate(baseDate);

        assertThat(capturedTags()).isEmpty();
        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(new TagGenerationResponseDto(baseDate, 1, 0, Map.of()));
    }
}
