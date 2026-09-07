package com.stocktracer.backend.value.service;

import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import net.bytebuddy.implementation.bind.annotation.Argument;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatCode;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EpsHistoryServiceTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,8,26);
    private static final LocalDate Q1 = LocalDate.of(2026, 3, 31);
    private static final LocalDate Q2 = LocalDate.of(2026, 6, 30);

    @Mock
    private EpsHistoryRepository repository;

    @InjectMocks
    private EpsHistoryService service;

    @Captor
    private ArgumentCaptor<List<EpsHistory>> captor;


    @Nested
    @DisplayName("조회")
    class Find{
        @Test
        @DisplayName("조회 결과를 응답 DTO로 변환한다")
        void mapsToResponse(){
            List<EpsHistory> items = List.of(
                    epsHistory("005930", "6012", "2026-05-15"),
                    epsHistory("000660", "12040", "2026-05-15")
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

    @Nested
    @DisplayName("저장")
    class Save{
        @Test
        @DisplayName("요청을 도메인으로 변환해 레포지토리로 전달")
        void converts_and_delegates(){
            given(repository.upsertAll(anyList())).willReturn(2);

            service.save(createDto(List.of(
                    item("005930", Q1, "1200.0000"),
                    item("000660", Q1, "500.0000")
                    )
            ));

            verify(repository).upsertAll(captor.capture()); // 서비스에서 정상 변환 후 전달 확인
            assertThat(captor.getValue())
                    .extracting(EpsHistory::stockCode)
                    .containsExactly("005930", "000660");
        }

        @ParameterizedTest(name = "{0}") // 0번째 요소 출력 (label)
        @MethodSource("com.stocktracer.backend.value.service.EpsHistoryServiceTest#duplicate_requests")
        @DisplayName("중복 키가 있으면 레포지토리 호출 x")
        void rejects_duplicate_key(String label, List<EpsHistorySaveRequestDto.Item> items){
            EpsHistorySaveRequestDto request = createDto(items);

            assertThatThrownBy(() -> service.save(request))
                    .isInstanceOf(IllegalArgumentException.class)
                            .hasMessageContaining("중복된 key");

            verifyNoInteractions(repository);
        }

    }

    static Stream<Arguments> duplicate_requests(){ // junit이 인스턴스(new) 없이 직접 호출할 수 있도록 static으로 선언
        return Stream.of(
                arguments("중복 키 2회",List.of(
                        item("005930", Q1, "1"),
                        item("005930", Q1, "2")
                )),
                arguments("중복 키 3회",List.of(
                        item("005930", Q1, "1"),
                        item("005930", Q1, "2"),
                        item("005930", Q1, "3")
                )),
                arguments("중복 사이 다른 항목",List.of(
                        item("005930", Q1, "1"),
                        item("000660", Q1, "2"),
                        item("005930", Q1, "3")
                )),
                arguments("두 종목에서 각각 중복",List.of(
                        item("005930", Q1, "1"),
                        item("000660", Q1, "2"),
                        item("005930", Q1, "3"),
                        item("000660", Q1, "4")
                ))
        );
    }

    /* 객체 생성 */
    private EpsHistory epsHistory(String stockCode, String effectiveDate, String eps ){
        return new EpsHistory(stockCode, LocalDate.parse(effectiveDate), new BigDecimal(eps));
    }

    private static EpsHistorySaveRequestDto createDto(List<EpsHistorySaveRequestDto.Item> items){
        return new EpsHistorySaveRequestDto(items);
    }

    private static EpsHistorySaveRequestDto.Item item(
            String stockCode,
            LocalDate effectiveDate,
            String eps
    ){
        return new EpsHistorySaveRequestDto.Item(
                effectiveDate,
                stockCode,
                new BigDecimal(eps)
        );
    }
}
