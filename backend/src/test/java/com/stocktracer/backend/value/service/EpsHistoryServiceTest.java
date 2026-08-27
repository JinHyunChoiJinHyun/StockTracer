package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EpsHistoryServiceTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,8,26);
    private static final int LAG = 1;

    @Mock
    private EpsHistoryRepository repository;

    @InjectMocks
    private EpsHistoryService service;

    private EpsHistory eps(String stockCode, String prevEps, String effectiveDate){
        return new EpsHistory(stockCode, new BigDecimal(prevEps), LocalDate.parse(effectiveDate));
    }

    @Nested
    @DisplayName("조회")
    class Find{
        @Test
        @DisplayName("조회 결과를 응답 DTO로 변환한다")
        void mapsToResponse(){
            List<EpsHistory> items = List.of(
                    eps("005930", "6012", "2026-05-15"),
                    eps("000660", "12040", "2026-05-15")
            );

            given(repository.findPrevEps(BASE_DATE)).willReturn(items);

            EpsPrevResponseDto result = service.getPrevEps(BASE_DATE);

            assertThat(result.baseDate()).isEqualTo(BASE_DATE);
            assertThat(result.count()).isEqualTo(2);
            assertThat(result.items()).hasSize(2);

        }

        @Test
        @DisplayName("빈 결과도 정상 응답으로 반환한다 — 첫날은 이력이 없는 것이 정상")
        void emptyResultIsNotError(){
            given(repository.findPrevEps(BASE_DATE)).willReturn(List.of());

            EpsPrevResponseDto result = service.getPrevEps(BASE_DATE);

            assertThat(result.count()).isZero();
            assertThat(result.items()).isEmpty();
        }

        @Test
        @DisplayName("오늘 날짜는 조회할 수 있다")
        void todayIsAllowed() {
            LocalDate today = LocalDate.now();
            given(repository.findPrevEps(today)).willReturn(List.of());

            assertThatCode(() -> service.getPrevEps(today))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("검증")
    class Validation{
        @Test
        @DisplayName("baseDate가 null이면 거부한다")
        void rejectNullBaseDate(){
            assertThatThrownBy(() -> service.getPrevEps(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("baseDate");

            verify(repository, never()).findPrevEps(any());
        }

        @Test
        @DisplayName("미래 일자는 거부한다 — 존재할 수 없는 시점")
        void rejectFutureDate(){
            LocalDate tomorrow = LocalDate.now().plusDays(1);

            assertThatThrownBy(() -> service.getPrevEps(tomorrow))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("미래");
            verify(repository,never()).findPrevEps(any());
        }

        @Test
        @DisplayName("검증 실패 시 repository를 호출하지 않는다")
        void doesNotTouchRepositoryOnInvalidInput() {
            assertThatThrownBy(() -> service.getPrevEps(null))
                    .isInstanceOf(IllegalArgumentException.class);

            verifyNoInteractions(repository);
        }
    }
}
