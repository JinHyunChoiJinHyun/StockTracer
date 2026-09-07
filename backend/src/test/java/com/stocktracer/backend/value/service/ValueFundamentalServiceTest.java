package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.domain.ScoredScope;
import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.repository.interfaces.ValueFundamentalRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class ValueFundamentalServiceTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,9,1);

    @Mock
    private ValueFundamentalRepository repository;

    @Mock
    private EpsHistoryService epsHistoryService;

    @InjectMocks
    private ValueFundamentalService service;

    private ArgumentCaptor<List<ValueFundamental>> captor = ArgumentCaptor.forClass(List.class);

    /* 정상 저장 */
    @Test
    @DisplayName("요청을 도메인으로 변환해 전달")
    void converts_request_to_domain(){
        ValueFundamentalSaveRequestDto request = createDto(List.of(
                    item("005930", BASE_DATE),
                    item("000660", BASE_DATE)
                )
        );
        given(repository.upsertAll(anyList())).willReturn(2);

        service.save(request);

        verify(repository).upsertAll(captor.capture());
        List<ValueFundamental> captured = captor.getValue();

        assertThat(captured).hasSize(2);
        assertThat(captured)
                .extracting(ValueFundamental::stockCode)
                .containsExactly("005930","000660");
    }

    @Test
    @DisplayName("날짜가 다르면 정상 저장")
    void same_stock_different_date_not_duplicate(){
        given(repository.upsertAll(anyList())).willReturn(2);

        int affected = service.save(createDto(List.of(
                item("005930", BASE_DATE),
                item("005930", BASE_DATE.minusDays(1))
        )));

        assertThat(affected).isEqualTo(2);
    }

    /* 중복 검증 */
    @Test
    @DisplayName("같은 키가 두번 들어오면 예외 발생")
    void rejects_duplicate_key(){
        ValueFundamentalSaveRequestDto request = createDto(List.of(
                item("005930", BASE_DATE),
                item("005930", BASE_DATE),
                item("000660", BASE_DATE),
                item("000660", BASE_DATE)
        ));

        assertThatThrownBy(()-> service.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("005930")
                .hasMessageContaining("000660");

        // 레포지토리 호출 여부 확인
        verify(repository, never()).upsertAll(anyList());
    }

    /* 엣지 케이스 */
    @Test
    @DisplayName("빈 요청은 검증을 통과해 레포지토리로 전달 (빈 리스트 검증은 레포지토리의 책임)")
    void empty_request_is_delegated_as_is(){
        given(repository.upsertAll(anyList())).willReturn(0);

        int affected = service.save(createDto(List.of()));

        assertThat(affected).isZero();
        verify(repository).upsertAll(captor.capture());

        assertThat(captor.getValue()).isEmpty();
    }

    @Test
    @DisplayName("EpsHistoryService 호출 x")
    void does_not_touch_eps_history_service(){
        given(repository.upsertAll(anyList())).willReturn(1);

        service.save(createDto(List.of(item("005930",BASE_DATE))));

        verifyNoInteractions(epsHistoryService); // 서비스간의 조율은 facade의 책임 // 서비스끼리 손대면 트랜젝션 경계가 갈라짐
    }


    /* 헬퍼 */
    // item 생성
    private ValueFundamentalSaveRequestDto.Item item(String stockCode, LocalDate effectiveDate){
        return new ValueFundamentalSaveRequestDto.Item(
                stockCode,
                effectiveDate,
                "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("1.2500"),
                new BigDecimal("5000.0000"),
                new BigDecimal("52000.0000"),
                new BigDecimal("1.8000"),
                400_000_000_000L,
                5_969_782_550L,
                1_234_567_890_123L,
                new BigDecimal("0.3200"),
                new BigDecimal("0.4100"),
                new BigDecimal("0.3650"),
                ScoredScope.SECTOR,
                new BigDecimal("0.152300"),
                Boolean.FALSE
        );
    }

    // requestDto 생성
    private ValueFundamentalSaveRequestDto createDto(List<ValueFundamentalSaveRequestDto.Item> items){
        return new ValueFundamentalSaveRequestDto(items);
    }

}
