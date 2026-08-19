package com.stocktracer.backend.investorflow.service;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowAnalysisRequestDto;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowAnalysisRepository;
import com.stocktracer.backend.investorflow.repository.interfaces.InvestorFlowDailyRepository;
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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

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
    }
}
