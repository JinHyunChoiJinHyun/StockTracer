package com.stocktracer.backend.investorflow.service;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowAnalysisRequestDto;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowAnalysisRepository;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.internal.verification.NoInteractions;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("InvestorFlowAnalysisService 단위 테스트")
public class InvestorFlowAnalysisServiceTest {
    @Mock
    private InvestorFlowAnalysisRepository analysisRepository;

    @Mock
    private InvestorFlowDailyRepository dailyRepository;

    @InjectMocks
    private InvestorFlowAnalysisService analysisService;

    private static final LocalDate BASE_DATE = LocalDate.of(2026, 8, 18);
    private static final String SAMSUNG = "005930";
    private static final String HYNIX = "000660";

    /* 객체 생성 헬퍼 */
    private InvestorFlowAnalysisRequestDto request(
            String stockCode
    ){
        return new InvestorFlowAnalysisRequestDto(
                stockCode,
                BASE_DATE,
                new BigDecimal("0.006000"),   // netRatio (계산 틀리면 오류 발생... ㅠㅠ)
                new BigDecimal("82.5000"),  // score
                true,                       // doubleBuy
                true,                       // cleanBuy
                "외국인/기관 동반 순매수"      // reason
        );
    }
    private InvestorFlowAnalysisRequestDto request(
            String stockCode,
            LocalDate baseDate
    ){
        return new InvestorFlowAnalysisRequestDto(
                stockCode,
                baseDate,
                new BigDecimal("0.006000"),   // netRatio (계산 틀리면 오류 발생... ㅠㅠ)
                new BigDecimal("82.5000"),  // score
                true,                       // doubleBuy
                true,                       // cleanBuy
                "외국인/기관 동반 순매수"      // reason
        );
    }

    private InvestorFlowDaily daily(String stockCode){
        return InvestorFlowDaily.of(
                stockCode,
                BASE_DATE,
                1_000L,
                2_000L,
                -3_000L,
                500_000L
        );
    }

    /* 정상 경로 테스트 */
    @Nested
    @DisplayName("정상 저장")
    class SaveSuccess {
        @Test
        @DisplayName("검증을 통과하면 bulkUpsert 결과를 그대로 반환한다")
        void save_returnsAffectedRows(){
            given(dailyRepository.findByBaseDate(BASE_DATE))
                    .willReturn(List.of(daily(SAMSUNG), daily(HYNIX)));
            given(analysisRepository.bulkUpsert(anyList())).willReturn(2);

            int affected = analysisService.save(List.of(request(SAMSUNG), request(HYNIX)));

            assertThat(affected).isEqualTo(2);
            verify(dailyRepository).findByBaseDate(BASE_DATE);
            verify(analysisRepository).bulkUpsert(anyList());

        }

        @Test
        @DisplayName("요청 건수만큼 DTO를 도메인으로 변환해 전달한다")
        void save_convertsAllRequestToDomain(){
            given(dailyRepository.findByBaseDate(BASE_DATE))
                    .willReturn(List.of(
                            daily(SAMSUNG),
                            daily(HYNIX)
                    ));

            given(analysisRepository.bulkUpsert(anyList())).willReturn(2);

            analysisService.save(List.of(
                    request(SAMSUNG),
                    request(HYNIX)
            ));

            ArgumentCaptor<List<InvestorFlowAnalysis>> captor = ArgumentCaptor.forClass(List.class);
            verify(analysisRepository).bulkUpsert(captor.capture());

            List<InvestorFlowAnalysis> flows = captor.getValue();
            assertThat(flows).hasSize(2);
            assertThat(flows)
                    .extracting(InvestorFlowAnalysis::getStockCode)
                    .containsExactly(SAMSUNG, HYNIX);
            assertThat(flows)
                    .extracting(InvestorFlowAnalysis::getBaseDate)
                    .containsOnly(BASE_DATE);
        }

        @Test
        @DisplayName("daily에 여분의 종목이 있어도 요청한 종목만 저장한다")
        void save_ignoreExtraDailyRows(){
            given(dailyRepository.findByBaseDate(BASE_DATE))
                    .willReturn(List.of(
                            daily(SAMSUNG),
                            daily(HYNIX),
                            daily("035420")
                    ));
            given(analysisRepository.bulkUpsert(anyList())).willReturn(1);

            analysisService.save(List.of(request(SAMSUNG)));

            ArgumentCaptor<List<InvestorFlowAnalysis>> captor = ArgumentCaptor.forClass(List.class);
            verify(analysisRepository).bulkUpsert(captor.capture());
            assertThat(captor.getValue()).hasSize(1);
        }

    }

    /* 검증 실패 테스트 */
    @Nested
    @DisplayName("입력 검증")
    class Validation{
        @Test
        @DisplayName("기준일이 2개 이상이면 예외를 던지고 저장소에 접근하지 않는다")
        void save_rejectsMultipleBaseDates(){
            List<InvestorFlowAnalysisRequestDto> requests = List.of(
                    request(SAMSUNG),
                    request(HYNIX, BASE_DATE.minusDays(1))
            );

            assertThatThrownBy(() -> analysisService.save(requests))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("단일 일자");

            verifyNoInteractions(dailyRepository, analysisRepository);
        }

        @Test
        @DisplayName("종목코드가 중복되면 예외를 던지고 저장소에 접근하지 않는다")
        void save_rejects_DuplicateStockCode(){
            List<InvestorFlowAnalysisRequestDto> requests = List.of(
                    request(SAMSUNG),
                    request(SAMSUNG),
                    request(HYNIX)
            );

            assertThatThrownBy(() -> analysisService.save(requests))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("중복된 종목코드")
                    .hasMessageContaining(SAMSUNG);

            verifyNoInteractions(dailyRepository, analysisRepository);
        }

        @Test
        @DisplayName("원본 수급 데이터가 없으면 예외를 던지고 저장하지 않는다")
        void save_rejectsWhenDailyIsEmpty(){
            given(dailyRepository.findByBaseDate(BASE_DATE)).willReturn(List.of());

            assertThatThrownBy(() -> analysisService.save(List.of(request(SAMSUNG))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("원본 수급 데이터가 없습니다");

            verifyNoInteractions(analysisRepository);
        }

        @Test
        @DisplayName("원본 수급에 없는 종목이 섞이면 예외를 던지고 저장하지 않는다")
        void save_rejectsMissingStockCode(){
            given(dailyRepository.findByBaseDate(BASE_DATE))
                    .willReturn(List.of(daily(SAMSUNG)));

            assertThatThrownBy(() -> analysisService.save(List.of(request(SAMSUNG), request(HYNIX))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("원본 수급에 없는 종목 1건")
                    .hasMessageContaining(HYNIX);

            verifyNoInteractions(analysisRepository);
        }

        @Test
        @DisplayName("누락 종목이 10건을 넘으면 메시지를 10건까지만 노출한다")
        void save_truncatesMissingListOverTen(){
            List<InvestorFlowAnalysisRequestDto> requests = IntStream.range(0,11)
                    .mapToObj(i -> request(String.format("%06d", i)))
                    .toList();

            given(dailyRepository.findByBaseDate(BASE_DATE))
                    .willReturn(List.of(daily(SAMSUNG)));

            assertThatThrownBy(() -> analysisService.save(requests))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("원본 수급에 없는 종목 11건")
                    .hasMessageContaining("...");

            verifyNoInteractions(analysisRepository);
        }

        /* 엣지 케이스 */
        @Nested
        @DisplayName("경계 조건")
        class EdgeCases {
            @Test
            @DisplayName("단건 요청도 정상 처리한다")
            void save_handleSingleRequest(){
                given(dailyRepository.findByBaseDate(BASE_DATE)).willReturn(List.of(daily(SAMSUNG)));
                given(analysisRepository.bulkUpsert(anyList())).willReturn(1);

                assertThat(analysisService.save(List.of(request(SAMSUNG)))).isEqualTo(1);
            }

            @Test
            @DisplayName("빈 리스트는 0을 반환하고 저장소에 접근하지 않는다")
            void save_returnsZeroOnEmptyList(){
                assertThat(analysisService.save(List.of())).isZero();
                verifyNoInteractions(dailyRepository, analysisRepository);
            }
        }
    }
}
