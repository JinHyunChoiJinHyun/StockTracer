package com.stocktracer.backend.investorflow.domain;

import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.stock.domain.StockInfo;
import lombok.Builder;
import lombok.Getter;

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
    public Long majorNet() {
        return foreignNet + institutionNet;
    }

    private StockInfo stock;

    public static InvestorFlowDaily of(InvestorFlowDailyRequestDto dto, StockInfo stock){
        validateAmountScale(dto.stockCode(), dto.foreignNet(), dto.institutionNet(), dto.individualNet(), dto.tradingValue());

        return InvestorFlowDaily.builder()
                .stockCode(dto.stockCode())
                .baseDate(dto.baseDate())
                .foreignNet(dto.foreignNet())
                .institutionNet(dto.institutionNet())
                .individualNet(dto.individualNet())
                .tradingValue(dto.tradingValue())
                .stock(stock)
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
