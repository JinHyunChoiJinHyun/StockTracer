package com.stocktracer.backend.investorflow.service;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InvestorFlowDailyService 단위 테스트")
public class InvestorFlowDailyServiceTest {
    @Mock
    private InvestorFlowDailyRepository investorFlowDailyRepository;

    @Mock
    private StockInfoRepository stockInfoRepository;

    @InjectMocks
    private InvestorFlowDailyService investorFlowDailyService;

    private static final LocalDate BASE_DATE = LocalDate.of(2026, 8, 14);
    private static final String SAMSUNG = "005930";
    private static final String Sk = "000660";

    StockInfo samsung = stockInfo(SAMSUNG);
    StockInfo sk = stockInfo(Sk);

    // 검증
    @Nested
    @DisplayName("입력값 검증")
    class Validation {
        @Test
        @DisplayName("빈 리스트가 들어오면 0을 반환하고 어떤 레포지토리도 호출하지 않는다")
        void save_emptyList_returnZeroWithoutRepositoryCall(){
            // when
            int result = investorFlowDailyService.save(List.of());

            // then
            assertThat(result).isZero();
            verifyNoInteractions(stockInfoRepository, investorFlowDailyRepository);
        }

        @Test
        @DisplayName("기준일이 2개 이상 섞여 있으면 IllegalArgumentException")
        void save_multipleBaseDate_throws(){
            // given
            List<InvestorFlowDailyRequestDto> dtos = List.of(
                dto(SAMSUNG, BASE_DATE),
                dto(Sk, BASE_DATE.minusDays(1))
            );

            // when & then
            assertThatThrownBy(() -> investorFlowDailyService.save(dtos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("단일 일자만 처리합니다.")
                    .hasMessageContaining(BASE_DATE.minusDays(1).toString());

            verifyNoInteractions(stockInfoRepository, investorFlowDailyRepository);
        }

        @Test
        @DisplayName("(종목코드, 기준일) 이 중복되면 IllegalArgumentException")
        void save_duplicateKey_throws(){
            // given (같은 pk가 두건인 경우 덮어쓰기 방지)
            List<InvestorFlowDailyRequestDto> dtos = List.of(
                    dto(SAMSUNG,BASE_DATE),
                    dto(SAMSUNG,BASE_DATE),
                    dto(Sk,BASE_DATE)
            );

            // when & then
            assertThatThrownBy(() -> investorFlowDailyService.save(dtos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("중복된 (종목코드, 기준일)")
                    .hasMessageContaining(SAMSUNG);

            verifyNoInteractions(stockInfoRepository, investorFlowDailyRepository);
        }
    }

    // StockInfo 매핑
    @Nested
    @DisplayName("StockInfo 조회 및 매핑")
    class StockInfoMapping{
        @Test
        @DisplayName("stock_info 에 없는 종목이 섞여 있으면 IllegalStateException 이고 저장은 하지 않는다")
        void save_missingStockInfo_throwsAndDoesNotSave(){
            // given (SAMSUNG만 등록되고 SK는 미등록)
            List<InvestorFlowDailyRequestDto> dtos = List.of(
                    dto(SAMSUNG,BASE_DATE),
                    dto(Sk,BASE_DATE)
            );
            StockInfo info = stockInfo(SAMSUNG);

            given(stockInfoRepository.findAllByStockCodeIn(anyList()))
                    .willReturn(List.of(info)); // 어떤 값이 들어오던 SAMSUNG 코드 반환

            // when & then
            assertThatThrownBy(() -> investorFlowDailyService.save(dtos))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("stock_info 미등록 종목")
                    .hasMessageContaining(Sk);

            verify(investorFlowDailyRepository, never()).bulkSave(anyList());
        }

        @Test
        @DisplayName("조회에는 중복 없는 종목코드 목록이 전달된다")
        void save_passedDistinctStockCodes(){
            // given
            List<InvestorFlowDailyRequestDto> dtos = List.of(
                    dto(SAMSUNG, BASE_DATE),
                    dto(Sk, BASE_DATE)
            );

            given(stockInfoRepository.findAllByStockCodeIn(anyList()))
                    .willReturn(List.of(samsung, sk));

            given(investorFlowDailyRepository.bulkSave(anyList())).willReturn(2);

            // when
            investorFlowDailyService.save(dtos);

            // then
            ArgumentCaptor<List<String>> captor = ArgumentCaptor.forClass(List.class);
            verify(stockInfoRepository).findAllByStockCodeIn(captor.capture()); // 메서드 실행 전 전달된 파라미터 낚아채기
            assertThat(captor.getValue())
                    .containsExactlyInAnyOrder(SAMSUNG,Sk)
                    .doesNotHaveDuplicates();

        }
    }

    // 저장
    @Nested
    @DisplayName("정상 저장")
    class SaveSuccess{
        @Test
        @DisplayName("DTO 건수만큼 도메인으로 변환해 bulkSave 에 넘기고, 반영 건수를 그대로 반환한다")
        void save_success(){
            // given
            List<InvestorFlowDailyRequestDto> dtos = List.of(
                    dto(SAMSUNG, BASE_DATE),
                    dto(Sk, BASE_DATE)
            );
            given(stockInfoRepository.findAllByStockCodeIn((anyList())))
                    .willReturn(List.of(samsung, sk)); // 뭐가 들어가던 samsung, sk 반환

            given(investorFlowDailyRepository.bulkSave(anyList())).willReturn(2);

            // when
            int result = investorFlowDailyService.save(dtos);

            // then
            assertThat(result).isEqualTo(2);

            ArgumentCaptor<List<InvestorFlowDaily>> captor = ArgumentCaptor.forClass(List.class);
            verify(investorFlowDailyRepository).bulkSave(captor.capture()); // 전달된 파라미터 캡쳐
            assertThat(captor.getValue()).hasSize(2);
        }

        @Test
        @DisplayName("단건 처리")
        void save_singleRow(){
            // given
            List<InvestorFlowDailyRequestDto> dtos = List.of(dto(SAMSUNG, BASE_DATE));
            given(stockInfoRepository.findAllByStockCodeIn(anyList()))
                    .willReturn(List.of(samsung));
            given(investorFlowDailyRepository.bulkSave(anyList())).willReturn(1);

            // when
            int result = investorFlowDailyService.save(dtos);

            // then
            assertThat(result).isEqualTo(1);
        }
    }

    // 헬퍼 메서드
    private static InvestorFlowDailyRequestDto dto(String stockCode, LocalDate baseDate) {
        return new InvestorFlowDailyRequestDto(
                stockCode,
                baseDate,
                1_000_000L,
                -600_000L,
                -400_000L,
                4_000_000L
        );
    }

    private static StockInfo stockInfo(String stockCode) {
        StockInfo stockInfo = mock(StockInfo.class); // 가짜 객체 생성 (new처럼 생성하나 실제 실행 불가)
        given(stockInfo.getStockCode()).willReturn(stockCode); // stockCode 호출 시 반환값 지정
        return stockInfo;
    }

}
