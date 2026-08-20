package com.stocktracer.backend.investorflow.domain;

import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Getter
@Builder
public class InvestorFlowDaily {
    private final String stockCode;
    private final LocalDate baseDate;
    private final long foreignNet; // null 불가
    private final long institutionNet; // null 불가
    private final long individualNet; // null 불가
    private final Long tradingValue; // null 허용

    /* 계산 로직 */
    // major 수급 (외국인 + 기관)
    public long majorNet() {
        return foreignNet + institutionNet;
    }

    // 순매수 비율 (major 수급 / 거래대금)
    private static final int RATIO_SCALE = 6; // final이 붙은 상수는 대문자 + _로 구분
    public BigDecimal netRatio(){
        if(tradingValue == null || tradingValue == 0L){
            return null;
        }

        return BigDecimal.valueOf(majorNet())
                .divide(BigDecimal.valueOf(tradingValue), RATIO_SCALE, RoundingMode.HALF_UP);
    }

    public static InvestorFlowDaily of(
            String stockCode,
            LocalDate baseDate,
            long foreignNet,
            long institutionNet,
            long individualNet,
            Long tradingValue
    ){
        validateAmountScale(stockCode, foreignNet, institutionNet, individualNet, tradingValue);

        return InvestorFlowDaily.builder()
                .stockCode(stockCode)
                .baseDate(baseDate)
                .foreignNet(foreignNet)
                .institutionNet(institutionNet)
                .individualNet(individualNet)
                .tradingValue(tradingValue)
                .build();
    }

    /* 도메인 규칙 검증 */
    private static void validateAmountScale(
            String stockCode,
            long foreignNet,
            long institutionNet,
            long individualNet,
            Long tradingValue
    ){
        // 매칭 실패 했거나 거래가 없는 종목
        if (tradingValue == null || tradingValue == 0L){
            return;
        }
        // 각 투자자의 순매수 절대값이 거래대금을 넘는지 확인
        checkWithinTradingValue(stockCode,"외국인", foreignNet, tradingValue);
        checkWithinTradingValue(stockCode,"기관", institutionNet, tradingValue);
        checkWithinTradingValue(stockCode,"개인", individualNet, tradingValue);
    }

    // 순매수 절대값이 거래대금을 초과하는지 확인
    // -> 넘는다면 단위 불일치 혹은 코드 조인 오류
    private static void checkWithinTradingValue(
            String stockCode,
            String label,
            long net,
            Long tradingValue
    ){
        if(Math.abs(net) > tradingValue){
            throw new IllegalArgumentException((String.format(
                    "[%s] %s 순매수(%d)가 거래대금(%d)을 초과합니다. 단위 또는 조인 키를 확인하세요",
                    stockCode, label, net, tradingValue
            )));
        }
    }
}
