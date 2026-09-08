package com.stocktracer.backend.value.facade;

import com.stocktracer.backend.value.domain.ScoredScope;
import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.dto.FundamentalSaveResponseDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.service.EpsHistoryService;
import com.stocktracer.backend.value.service.ValueFundamentalService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FundamentalFacadeTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,9,1);

    @Mock
    private ValueFundamentalService valueFundamentalService;

    @Mock
    private EpsHistoryService epsHistoryService;

    @InjectMocks
    private FundamentalFacade facade;

    @Captor
    private ArgumentCaptor<EpsHistorySaveRequestDto> epsCaptor;

    @Nested
    @DisplayName("저장")
    class Save{
        @Test
        @DisplayName("value와 eps 정상 저장")
        void save_success(){
            ValueFundamentalSaveRequestDto request = createValueDto(List.of(
                    item("005930", BASE_DATE ,new BigDecimal("100.50")),
                    item("000660", BASE_DATE ,new BigDecimal("200.30"))
            ));

            when(valueFundamentalService.save(request)).thenReturn(2);

            when(epsHistoryService.save(any(EpsHistorySaveRequestDto.class))).thenReturn(2);

            FundamentalSaveResponseDto response = facade.save(request);

            assertThat(response.savedValueCount()).isEqualTo(2);
            assertThat(response.savedEpsCount()).isEqualTo(2);
            assertThat(response.missingEpsCount()).isEqualTo(0);

            verify(valueFundamentalService).save(request);
            verify(epsHistoryService).save(epsCaptor.capture()); // 정상 변환 확인 (파라미터 캡처)

            EpsHistorySaveRequestDto epsRequest = epsCaptor.getValue();

            assertThat(epsRequest.items())
                    .extracting(EpsHistorySaveRequestDto.Item::stockCode)
                    .containsExactly("005930", "000660");
        }

        @Test
        @DisplayName("eps가 null인 경우 eps_history 저장 제외")
        void save_skips_null_eps(){
            ValueFundamentalSaveRequestDto request = createValueDto(List.of(
                    item("005930", BASE_DATE ,new BigDecimal("100.50")),
                    item("000660", BASE_DATE ,null),
                    item("035720", BASE_DATE ,new BigDecimal("300.20"))
            ));

            when(valueFundamentalService.save(request)).thenReturn(3);
            when(epsHistoryService.save(any(EpsHistorySaveRequestDto.class))).thenReturn(2);

            FundamentalSaveResponseDto response = facade.save(request);

            assertThat(response.savedValueCount()).isEqualTo(3);
            assertThat(response.savedEpsCount()).isEqualTo(2);
            assertThat(response.missingEpsCount()).isEqualTo(1);

            verify(valueFundamentalService).save(request);
            verify(epsHistoryService).save(epsCaptor.capture());

            EpsHistorySaveRequestDto epsRequest = epsCaptor.getValue();

            assertThat(epsRequest.items()).hasSize(2);
            assertThat(epsRequest.items())
                    .extracting(EpsHistorySaveRequestDto.Item::stockCode)
                    .containsExactly("005930","035720")
                    .doesNotContain("000660");
        }

        @Test
        @DisplayName("eps가 모두 null이어도 value는 저장")
        void saved_value_if_all_eps_null(){
            ValueFundamentalSaveRequestDto request = createValueDto(List.of(
                    item("005930", BASE_DATE ,null),
                    item("000660", BASE_DATE ,null),
                    item("035720", BASE_DATE ,null)
            ));

            facade.save(request);

            verify(valueFundamentalService).save(request);

            verify(epsHistoryService).save(epsCaptor.capture());
            assertThat(epsCaptor.getValue().items().isEmpty());
        }
    }

    /* 객체 생성 */
    private ValueFundamentalSaveRequestDto.Item item(
            String stockCode,
            LocalDate effectiveDate,
            BigDecimal eps
    ){
        return new ValueFundamentalSaveRequestDto.Item(
                stockCode,
                effectiveDate,
                "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("1.2500"),
                eps,
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

    private ValueFundamentalSaveRequestDto createValueDto(List<ValueFundamentalSaveRequestDto.Item> items){
        return new ValueFundamentalSaveRequestDto(items);
    }

}
