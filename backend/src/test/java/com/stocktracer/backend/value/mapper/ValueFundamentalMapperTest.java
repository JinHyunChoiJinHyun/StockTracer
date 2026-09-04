package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.value.domain.ScoredScope;
import com.stocktracer.backend.value.domain.ValueFundamental;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.as;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.map;


@MapperTest
public class ValueFundamentalMapperTest {
    @Autowired
    private ValueFundamentalMapper mapper;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void clean(){ jdbc.execute("TRUNCATE TABLE value_fundamental"); }

    private static final LocalDate BASE = LocalDate.of(2026,9,1);

    /* 테스트 객체 생성 */
    private ValueFundamental valueFundamental(
            LocalDate effectiveDate,
            String stockCode,
            String sector,
            BigDecimal per,
            BigDecimal pbr
    ) {
        return new ValueFundamental(
                effectiveDate,
                stockCode,
                sector,
                per,
                pbr,
                new BigDecimal("100.00"),       // eps
                new BigDecimal("80000.00"),     // bps
                new BigDecimal("2.50"),         // divYield
                100_000_000_000L,               // marketCap
                10_000_000L,                    // sharesOutstanding
                500_000_000L,                   // tradingValue
                new BigDecimal("0.25"),         // perPct
                new BigDecimal("0.30"),         // pbrPct
                new BigDecimal("72.50"),        // valueScore
                ScoredScope.SECTOR,             // scoredScope
                new BigDecimal("15.50"),        // epsGrowth
                false                           // valueTrap
        );
    }
    private ValueFundamental valueFundamental(
            LocalDate effectiveDate,
            String stockCode,
            String sector,
            BigDecimal per,
            BigDecimal pbr,
            BigDecimal eps,
            BigDecimal bps,
            BigDecimal divYield,
            Long marketCap,
            Long sharesOutstanding,
            Long tradingValue,
            BigDecimal perPct,
            BigDecimal pbrPct,
            BigDecimal valueScore,
            ScoredScope scoredScope,
            BigDecimal epsGrowth,
            Boolean valueTrap
    ) {
        return new ValueFundamental(
                effectiveDate,
                stockCode,
                sector,
                per,
                pbr,
                eps,
                bps,
                divYield,
                marketCap,
                sharesOutstanding,
                tradingValue,
                perPct,
                pbrPct,
                valueScore,
                scoredScope,
                epsGrowth,
                valueTrap
        );
    }

    @Test
    @DisplayName("신규 행이면 모든 컬럼이 그대로 저장")
    void insert_new_save_all(){
        // given
        ValueFundamental value = valueFundamental(
                BASE,
                "005930",
                "반도체",
                new BigDecimal("10.5"),
                new BigDecimal("1.2")
        );

        // when
        mapper.upsertAll(List.of(value));

        // then
        Map<String, Object> result = createQueryMap(value);

        assertThat(result.get("stock_code"))
                .isEqualTo("005930");
        assertThat(result.get("sector"))
                .isEqualTo("반도체");
        assertThat((BigDecimal) result.get("per"))
                .isEqualByComparingTo(new BigDecimal("10.5"));
        assertThat((BigDecimal) result.get("pbr"))
                .isEqualByComparingTo(new BigDecimal("1.2"));
        assertThat((BigDecimal) result.get("value_score"))
                .isEqualByComparingTo("72.5");
        assertThat(result.get("scored_scope"))
                .isEqualTo("SECTOR");
        assertThat(result.get("value_trap"))
                .isEqualTo(false);
    }

    @Test
    @DisplayName("effectiveDate가 다르면 별도 행으로 저장")
    void different_effective_date_insert_new(){
        // given, when
        ValueFundamental currentValue = valueFundamental(
                BASE,
                "005930",
                "반도체",
                new BigDecimal("10.5"),
                new BigDecimal("1.2")
        );

        ValueFundamental prevValue = valueFundamental(
                BASE.minusDays(1),
                "005930",
                "반도체",
                new BigDecimal("18.5"),
                new BigDecimal("3.2")
        );

        mapper.upsertAll(List.of(
                currentValue,
                prevValue
        ));

        // then
        Map<String, Object> currentResult = createQueryMap(currentValue);
        Map<String, Object> prevResult = createQueryMap(prevValue);

        assertThat(count()).isEqualTo(2);

        assertThat((BigDecimal) currentResult.get("per")).isEqualByComparingTo("10.5");
        assertThat((BigDecimal) prevResult.get("per")).isEqualByComparingTo("18.5");


    }

    @Test
    @DisplayName("같은 PK로 재실행하면 행이 늘지 않고 UPDATE 목록의 컬럼만 갱신된다")
    void upsert_updates_only_listed_columns(){
        // given
        ValueFundamental value = valueFundamental(
                BASE,
                "005930",
                "반도체",
                new BigDecimal("10.5"),
                new BigDecimal("1.2"),
                new BigDecimal("100.00"),       // eps
                new BigDecimal("80000.00"),     // bps
                new BigDecimal("2.50"),         // divYield
                100_000_000_000L,               // marketCap
                10_000_000L,                    // sharesOutstanding
                500_000_000L,                   // tradingValue
                new BigDecimal("0.25"),         // perPct
                new BigDecimal("0.30"),         // pbrPct
                new BigDecimal("72.50"),        // valueScore
                ScoredScope.SECTOR,             // scoredScope
                new BigDecimal("15.50"),        // epsGrowth
                false                           // valueTrap
        );
        mapper.upsertAll(List.of(value));

        // when
        ValueFundamental updatedValue = valueFundamental(
                BASE,
                "005930",
                "반도체/통신기기",
                new BigDecimal("20.5"),
                new BigDecimal("8.2"),
                new BigDecimal("80.00"),       // eps
                new BigDecimal("70000.00"),     // bps
                new BigDecimal("10.50"),         // divYield
                200_000_000_000L,               // marketCap
                20_000_000L,                    // sharesOutstanding
                700_000_000L,                   // tradingValue
                new BigDecimal("1.25"),         // perPct
                new BigDecimal("1.30"),         // pbrPct
                new BigDecimal("82.50"),        // valueScore
                ScoredScope.SECTOR,             // scoredScope
                new BigDecimal("25.50"),        // epsGrowth
                true
        );
        mapper.upsertAll(List.of(updatedValue));

        // then
        Map<String, Object> result = createQueryMap(value);

        assertThat(result.get("sector")).isEqualTo("반도체/통신기기");
        assertThat((BigDecimal) result.get("per")).isEqualByComparingTo("20.5");
        assertThat((BigDecimal) result.get("pbr")).isEqualByComparingTo("8.2");
        assertThat((BigDecimal) result.get("eps")).isEqualByComparingTo("80.00");
        assertThat((BigDecimal) result.get("bps")).isEqualByComparingTo("70000.00");
        assertThat((BigDecimal) result.get("div_yield")).isEqualByComparingTo("10.50");
        assertThat(result.get("market_cap")).isEqualTo(2_000_000_000L);
        assertThat(result.get("share_outstanding")).isEqualTo(20_000_000L);
        assertThat(result.get("trading_value")).isEqualTo(700_000_000L);
        assertThat((BigDecimal) result.get("per_pct")).isEqualByComparingTo("1.25");
        assertThat((BigDecimal) result.get("pbr_pct")).isEqualByComparingTo("1.30");
        assertThat((BigDecimal) result.get("value_score")).isEqualByComparingTo("82.50");
        assertThat((BigDecimal) result.get("eps_growth")).isEqualByComparingTo("25.50");
        assertThat(result.get("value_trap")).isEqualTo(true);
    }

    @Test
    @DisplayName("한번의 호출에서 신규 insert와 기존 update가 각각 처리된다")
    void mixed_insert_and_update(){
        // given
        mapper.upsertAll(List.of(
                valueFundamental(
                    BASE,
                    "005930",
                    "반도체",
                    new BigDecimal("10.5"),
                    new BigDecimal("1.2")
                ),

                valueFundamental(
                    BASE,
                    "000660",
                    "반도체",
                    new BigDecimal("10.5"),
                    new BigDecimal("1.2")
               )
        ));

        // when
        ValueFundamental newValue = valueFundamental(
                BASE,
                "035420",
                "서비스업",
                new BigDecimal("10.5"),
                new BigDecimal("1.2")
        );

        ValueFundamental updatedValue = valueFundamental(
                BASE,
                "005930",
                "반도체",
                new BigDecimal("20.5"),
                new BigDecimal("2.2")
        );

        mapper.upsertAll(List.of(newValue, updatedValue));

        Map<String, Object> newResult = createQueryMap(newValue);
        Map<String, Object> updatedResult = createQueryMap(updatedValue);

        // then
        assertThat(count()).isEqualTo(3);
        // insert 확인
        assertThat(newResult.get("per")).isEqualTo("10.5");
        // update 확인
        assertThat(updatedResult.get("per")).isEqualTo("20.5");
    }

    @Test
    @DisplayName("nullable 컬럼의 null 값이 그대로 저장")
    void value_trap_can_null(){
        // given
        ValueFundamental value = valueFundamental(
                BASE,
                "005930",
                "반도체/통신기기",
                null,
                null,
                null,
                null,
                null,
                100_000_000_000L,
                10_000_000L,
                500_000_000L,
                null,
                null,
                null,
                ScoredScope.SECTOR,
                null,
                null
        );

        // when
        mapper.upsertAll(List.of(value));

        // then
        Map<String, Object> result = createQueryMap(value);

        assertThat(result.get("per")).isNull();
        assertThat(result.get("pbr")).isNull();
        assertThat(result.get("eps")).isNull();
        assertThat(result.get("bps")).isNull();
        assertThat(result.get("div_yield")).isNull();
        assertThat(result.get("perPct")).isNull();
        assertThat(result.get("pbrPct")).isNull();
        assertThat(result.get("value_score")).isNull();
        assertThat(result.get("eps_growth")).isNull();
        assertThat(result.get("value_trap")).isNull();
    }

    @Test
    @DisplayName("DECIMAL 정밀도와 BIGINT 범위가 손실 없이 저장")
    void decimal_scale_and_bigint_range_preserved(){
        // given
        ValueFundamental extream = valueFundamental(
                BASE, "005930", "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("0.0001"),
                new BigDecimal("5000.0000"),
                new BigDecimal("12345678.9012"),
                new BigDecimal("1.8000"),
                9_223_372_036_854L,
                5_969_782_550L,
                1_234_567_890_123L,
                new BigDecimal("0.3200"),
                new BigDecimal("0.4100"),
                new BigDecimal("0.3650"),
                ScoredScope.SECTOR,
                new BigDecimal("-0.123457"),
                Boolean.FALSE
        );

        // when
        mapper.upsertAll(List.of(extream));

        // then
        Map<String, Object> result = createQueryMap(extream);

        assertThat((BigDecimal) result.get("per")).isEqualByComparingTo("12.3456");
        assertThat((BigDecimal) result.get("pbr")).isEqualByComparingTo("0.0001");
        assertThat((BigDecimal) result.get("bps")).isEqualByComparingTo("12345678.9012");
        assertThat((BigDecimal) result.get("eps_growth")).isEqualByComparingTo("-0.123457");
        assertThat(result.get("market_cap")).isEqualTo(9_223_372_036_854L);
        assertThat(result.get("trading_value")).isEqualTo(1_234_567_890_123L);
    }

    @Test
    @DisplayName("EPS 0 과 음수는 그대로 저장")
    void zero_and_negative_eps_preserved(){
        // given
        ValueFundamental zero = valueFundamental(
                BASE, "005930", "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("0.0001"),
                BigDecimal.ZERO,
                new BigDecimal("12345678.9012"),
                new BigDecimal("1.8000"),
                9_223_372_036_854L,
                5_969_782_550L,
                1_234_567_890_123L,
                new BigDecimal("0.3200"),
                new BigDecimal("0.4100"),
                new BigDecimal("0.3650"),
                ScoredScope.SECTOR,
                BigDecimal.ZERO,
                Boolean.FALSE
        );

        ValueFundamental negative = valueFundamental(
                BASE, "000660", "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("0.0001"),
                new BigDecimal("-1234.5678"),
                new BigDecimal("12345678.9012"),
                new BigDecimal("1.8000"),
                9_223_372_036_854L,
                5_969_782_550L,
                1_234_567_890_123L,
                new BigDecimal("0.3200"),
                new BigDecimal("0.4100"),
                new BigDecimal("0.3650"),
                ScoredScope.SECTOR,
                new BigDecimal("-1.000000"),
                Boolean.FALSE
        );

        // when
        mapper.upsertAll(List.of(zero,negative));

        // then
        Map<String, Object> zeroResult = createQueryMap(zero);
        Map<String, Object> negativeResult = createQueryMap(negative);

        assertThat((BigDecimal) zeroResult.get("eps")).isEqualByComparingTo("0");
        assertThat((BigDecimal) zeroResult.get("eps_growth")).isEqualByComparingTo("0");
        assertThat((BigDecimal) negativeResult.get("eps")).isEqualByComparingTo("0");
        assertThat((BigDecimal) negativeResult.get("eps_growth")).isEqualByComparingTo("0");

    }

    @Test
    @DisplayName("대량 upsert 정상 동작")
    void bulk_upsert_is_correct_at_scale(){
        // given
        List<ValueFundamental> values = java.util.stream.IntStream.range(0,500)
                .mapToObj(i -> valueFundamental(
                        BASE,String.format("%06d", i), "반도체", new BigDecimal("1"), new BigDecimal("1")
                ))
                .toList();

        mapper.upsertAll(values);

        List<ValueFundamental> updatedValues = java.util.stream.IntStream.range(0,500)
                .mapToObj(i -> valueFundamental(
                        BASE,String.format("%06d", i), "변경된업종", new BigDecimal("2"), new BigDecimal("2")
                ))
                .toList();

        // when
        mapper.upsertAll(updatedValues);

        // then
        Map<String, Object> result = createQueryMap(updatedValues.get(0));
        assertThat(count()).isEqualTo(500);
        assertThat(result.get("sector")).isEqualTo("변경된업종");
        assertThat((BigDecimal) result.get("per")).isEqualTo("2");
        assertThat((BigDecimal) result.get("pbr")).isEqualTo("2");
    }

    /* 헬퍼 메서드 */
    // 쿼리 맵 생성
    private Map<String, Object> createQueryMap(ValueFundamental value){
        return jdbc.queryForMap(
                """
                        SELECT
                            stock_code,
                            sector,
                            per,
                            pbr,
                            eps,
                            bps,
                            div_yield,
                            market_cap,
                            shares_outstanding,
                            trading_value,
                            per_pct,
                            pbr_pct,
                            value_score,
                            scored_scope,
                            value_trap
                        FROM value_fundamental
                        WHERE
                            effective_date = ?
                        AND
                            stock_code = ?
                        """,
                value.effectiveDate(),
                value.stockCode()
        );
    }

    private Integer count(){
        return jdbc.queryForObject(
                """
                    SELECT count(*) FROM value_fundamental
                    """,
                Integer.class
        );
    }
}
