package com.stocktracer.backend.tag;

import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.value.domain.ValueFundamental;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/* 태그 계산 및 생성 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class StockTagAssembler {
    private static final BigDecimal CHEAP_PERCENTILE = BigDecimal.valueOf(20); // 하위 몇 %까지 저평가인지
    private static final BigDecimal UNDERVALUE_SCORE = BigDecimal.valueOf(70); // 몇 점부터 저평가인지 (높을수록 저평가)
    private static final BigDecimal HIGH_DIVIDED = BigDecimal.valueOf(4.0); // 몇 %부터 고배당인지
    private static final BigDecimal NET_SELL_RATIO = BigDecimal.valueOf(-0.05); // 거래대금 대비 몇 %까지 순매도인지

    // private StockTagCalculator(){} == @NoArgsConstructor(access = AccessLevel.PRIVATE)

    /* tag 계산 */
    public static List<StockTag> assemble(ValueFundamental fundamental, InvestorFlowAnalysis flow){
        // 빈 값 체크
        if (fundamental == null || flow == null){
            return List.of();
        }

        List<StockTag> tags = new ArrayList<>();

        /* 계산 */
        // value_trap 계산
        if (fundamental.isValueTrap()){
            tags.add(StockTag.of(TagCode.VALUE_TRAP, fundamental.epsGrowth(), null));
        } else if (fundamental.isEarningShrinking()){
            // 이익 감소 중이나 value_trap이 아닌 경우
            tags.add(StockTag.of(TagCode.EARNING_SHRINKING, fundamental.epsGrowth(), null));
        }

        // 배당 계산
        if (isGreaterThanOrEqual(fundamental.divYield(), HIGH_DIVIDED)){
            tags.add(StockTag.of(TagCode.HIGH_DIVIDED, fundamental.divYield(), null));
        }

        // null 체크
        if (!fundamental.isScored()){
            return List.copyOf(tags);
        }

        // 저평가 계산
        if (isGreaterThanOrEqual(fundamental.valueScore(), UNDERVALUE_SCORE)){
            tags.add(StockTag.of(TagCode.UNDERVALUED, fundamental.valueScore(), fundamental.scoredScope()));
        }

        // per 백분위 비교
        if (isLessThanOrEqual(fundamental.perPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PER, fundamental.perPct(), fundamental.scoredScope()));
        }

        // pbr 백분위 비교
        if (isLessThanOrEqual(fundamental.pbrPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PBR, fundamental.pbrPct(), fundamental.scoredScope()));
        }

        return List.copyOf(tags);
    }
    
    // 수급
    private static void addSupplyTags(List<StockTag> tags, InvestorFlowAnalysis flow){
        // 빈값 체크
        if(flow == null){
            return;
        }

        // 쌍끌이 여부 체크 (쌍끌이 우위일 시 쌍끌이 포함 상태)
        if (flow.getCleanBuy()){
            tags.add(StockTag.of(TagCode.CLEAN_BUY, flow.getNetRatio(), null));
        } else if(flow.getDoubleBuy()){
            tags.add(StockTag.of(TagCode.DOUBLE_BUY, flow.getNetRatio(), null));
        }
    }

    private static void addValueTags(List<StockTag> tags, ValueFundamental fundamental){
        if (fundamental == null){
            return;
        }

        // 배당 계산
        if (isGreaterThanOrEqual(fundamental.divYield(), HIGH_DIVIDED)){
            tags.add(StockTag.of(TagCode.HIGH_DIVIDED, fundamental.divYield(), null));
        }

        // null 체크
        if (!fundamental.isScored()){
            return;
        }

        // 저평가 계산
        if (isGreaterThanOrEqual(fundamental.valueScore(), UNDERVALUE_SCORE)){
            tags.add(StockTag.of(TagCode.UNDERVALUED, fundamental.valueScore(), fundamental.scoredScope()));
        }

        // per 백분위 비교
        if (isLessThanOrEqual(fundamental.perPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PER, fundamental.perPct(), fundamental.scoredScope()));
        }

        // pbr 백분위 비교
        if (isLessThanOrEqual(fundamental.pbrPct(),CHEAP_PERCENTILE)){
            tags.add(StockTag.of(TagCode.LOW_PBR, fundamental.pbrPct(), fundamental.scoredScope()));
        }

    }

    // 입력값이 임계값 이상인지 계산
    private static boolean isGreaterThanOrEqual(BigDecimal value, BigDecimal threshold){
        return value != null && value.compareTo(threshold) >= 0;
    }
    // 입력값이 임계값 이하인지 계산
    private static boolean isLessThanOrEqual(BigDecimal value, BigDecimal threshold){
        return value != null && value.compareTo(threshold) <= 0;
    }

}
