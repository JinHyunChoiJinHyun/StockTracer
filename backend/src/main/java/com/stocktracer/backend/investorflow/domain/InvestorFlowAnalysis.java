package com.stocktracer.backend.investorflow.domain;

import com.stocktracer.backend.investorflow.dto.InvestorFlowAnalysisRequestDto;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder(access = AccessLevel.PRIVATE) // 외부 build 차단
public class InvestorFlowAnalysis {

    private static final BigDecimal RATIO_TOLERANCE = new BigDecimal("0.0001"); // 파이썬 float64 -> DECIMAL(9,6) 변환 허용 오차

    private final String stockCode;
    private final LocalDate baseDate;
    private final BigDecimal netRatio;
    private final BigDecimal score;
    private final Boolean doubleBuy; // isDoubleBuy getter 생성
    private final Boolean cleanBuy; // isCleanBuy getter 생성
    private final String reason;

    /** final로 지정하는 이유 */
    // 조립하는 시점에만 값을 넣고 이후에는 변경 불가하도록 설계

    /** boolean 타입 필드명에 is가 없는 이유 */
    // boolean 타입은 getter가 is를 붙여서 생성됨 (이미 is가 붙어 있다면 필드명 그대로 getter 생성)
    // JSON 변환기(Jackson)는 getter 이름(is~)을 보고 변수명에 붙은 is를 제거하고 추론함
    // 따라서 애초에 필드명에서 is를 빼고 작성해야 JSON 키값과 의도한 이름이 일치함
    public static InvestorFlowAnalysis of(
            String stockCode,
            LocalDate baseDate,
            BigDecimal netRatio,
            BigDecimal score,
            Boolean doubleBuy,
            Boolean cleanBuy,
            String reason,
            InvestorFlowDaily daily
    ){
        validateSameKey(stockCode, baseDate, daily);
        validateFlagLogic(stockCode, doubleBuy, cleanBuy);
        validateFlagAgainstDaily(stockCode, doubleBuy, cleanBuy, daily);
        validateNetRatio(stockCode, netRatio, daily);

        return InvestorFlowAnalysis.builder()
                .stockCode(stockCode)
                .baseDate(baseDate)
                .netRatio(netRatio)
                .score(score)
                .doubleBuy(doubleBuy)
                .cleanBuy(cleanBuy)
                .reason(reason)
                .build();
    };

    /* 도메인 규칙 검증 */

    // pk 검증
    private static void validateSameKey(String stockCode, LocalDate baseDate, InvestorFlowDaily daily){
        if(!stockCode.equals(daily.getStockCode()) || !baseDate.equals(daily.getBaseDate())){
            throw new IllegalArgumentException(String.format(
                    "원본 매칭 오류: 분석=(%s, %s), 원본=(%s, %s)",
                    stockCode, baseDate, daily.getStockCode(), daily.getBaseDate()
            ));
        }
    }

    // 손바뀜 논리 검증
    private static void validateFlagLogic(String stockCode, boolean doubleBuy, boolean cleanBuy){
        if(cleanBuy && !doubleBuy){
            throw new IllegalArgumentException(
                    "["+ stockCode + "] 손바뀜은 쌍끌이가 일어나야 가능합니다"
            );
        }
    }

    // 플래그와 원본 금액의 모순 검증
    private static void validateFlagAgainstDaily(String stockCode, boolean doubleBuy, boolean cleanBuy, InvestorFlowDaily daily){
        if (doubleBuy && (daily.getForeignNet() <= 0 || daily.getInstitutionNet() <= 0)){
            throw new IllegalArgumentException(String.format(
                    "[%s] 쌍끌이인데 순매수가 양수가 아닙니다 (외국인 = %d, 기관 = %d)",
                    stockCode, daily.getForeignNet(), daily.getInstitutionNet()
            ));
        }

        if(cleanBuy && daily.getIndividualNet() >= 0){
            throw new IllegalArgumentException(String.format(
                    "[%s] 손바뀜인데 개인이 순매수(%d)입니다",
                    stockCode, daily.getIndividualNet()
            ));
        }
    }

    // 순매수 비율 계산 검증
    private static void validateNetRatio(String stockCode, BigDecimal netRatio, InvestorFlowDaily daily){
        BigDecimal expected = daily.netRatio();

        if (netRatio == null && expected == null){
            return;
        }

        if (netRatio == null || expected == null){
            throw new IllegalArgumentException(String.format(
                    "[%s] 순매수 비율 존재 여부 불일치: 수신=%s, 검증=%s",
                    stockCode, netRatio, expected
            ));
        }

        if (expected.subtract(netRatio).abs().compareTo(RATIO_TOLERANCE) > 0){
            throw new IllegalArgumentException(String.format(
                    "[%s] 순매수 비율 존재 여부 불일치: 수신=%s, 검증=%s",
                    stockCode, netRatio, expected
            ));
        }

    }
}
