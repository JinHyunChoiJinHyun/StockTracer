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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

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
        assertThat(result.get("per"))
                .isEqualTo("10.5");
        assertThat(result.get("pbr"))
                .isEqualTo("1.2");
        assertThat(result.get("value_score"))
                .isEqualTo("72.5");
        assertThat(result.get("scored_scope"))
                .isEqualTo("sector");
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

        assertThat(jdbc.queryForObject(
                """
                    SELECT count(*) FROM value_fundamental
                    """,
                Integer.class
        )).isEqualTo(2);

        assertThat(currentResult.get("per")).isEqualTo(10.5);
        assertThat(prevResult.get("per")).isEqualTo(18.5);


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
}
