package com.stocktracer.backend.investorflow.mapper;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.config.MySqlTestContainerConfig;
import com.stocktracer.backend.investorflow.domain.InvestorFlowAnalysis;
import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@MapperTest
public class InvestorFlowAnalysisMapperTest {
    @Autowired
    private InvestorFlowAnalysisMapper analysisMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final LocalDate BASE_DATE = LocalDate.of(2026,8,18);
    private static final String SAMSUNG = "005930";
    private static final String HYNIX = "000660";

    @BeforeEach
    void clean(){
        jdbcTemplate.execute("TRUNCATE TABLE investor_flow_analysis");
    }

    /* 객체 생성 헬퍼 */
    // daily 테스트 객체
    private InvestorFlowDaily daily(
            String stockCode,
            LocalDate baseDate,
            long foreignNet,
            long institutionNet,
            long individualNet,
            Long tradingValue
    ){
        return InvestorFlowDaily.of(
                stockCode,
                baseDate,
                foreignNet,
                institutionNet,
                individualNet,
                tradingValue
        );
    }

    // analysis 테스트 객체
    private InvestorFlowAnalysis analysis(
            String stockCode,
            LocalDate baseDate,
            BigDecimal netRatio,
            BigDecimal score,
            boolean doubleBuy,
            boolean cleanBuy,
            String reason,
            InvestorFlowDaily daily
    ){
        return InvestorFlowAnalysis.of(
                stockCode,
                baseDate,
                netRatio,
                score,
                doubleBuy,
                cleanBuy,
                reason,
                daily
        );
    }

    // daily 기본값
    private InvestorFlowDaily defaultDaily(String stockCode) {
        return daily(stockCode, BASE_DATE, 1_000L, 2_000L, -3_000L, 500_000L);
    }

    @Test
    @DisplayName("신규 데이터는 전부 INSERT 된다")
    void upsertAll_insertsNewRows(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.1500"),
                        new BigDecimal("82.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                ),
                analysis(HYNIX,
                        BASE_DATE,
                        new BigDecimal("-0.2500"),
                        new BigDecimal("31.0000"),
                        false,
                        false,
                        "기관 순매도",
                        defaultDaily(HYNIX))
        ));

        assertThat(countAll()).isEqualTo(2);

        Map<String, Object> row = findByStockCode(SAMSUNG);
        assertThat((BigDecimal) row.get("net_ratio")).isEqualByComparingTo("0.1500");
        assertThat((BigDecimal) row.get("score")).isEqualByComparingTo("82.5000");
        assertThat(row.get("doubleBuy")).isEqualTo(true);
        assertThat(row.get("cleanBuy")).isEqualTo(true);
        assertThat(row.get("reason")).isEqualTo("외국인/기관 동반 순매수");
    }

    @Test
    @DisplayName("PK가 같으면 INSERT 되지 않고 값만 갱신된다")
    void upsertAll_updatesOnDuplicateKey(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.1500"),
                        new BigDecimal("82.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                )
        ));

        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.9900"),
                        new BigDecimal("95.0000"),
                        false,
                        false,
                        "재계산 결과",
                        defaultDaily(SAMSUNG)
                )
        ));

        assertThat(countAll()).isEqualTo(1);

        Map<String, Object> row = findByStockCode(SAMSUNG);
        assertThat((BigDecimal) row.get("net_ratio")).isEqualByComparingTo("0.9900");
        assertThat((BigDecimal) row.get("score")).isEqualByComparingTo("95.0000");
        assertThat(row.get("double_buy")).isEqualTo(false);
        assertThat(row.get("clean_buy")).isEqualTo(false);
        assertThat(row.get("reason")).isEqualTo("재계산 결과");
    }

    @Test
    @DisplayName("신규와 기존이 섞인 배치도 한 번에 처리된다")
    void upsertAll_handleMixedBatch(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.1500"),
                        new BigDecimal("82.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                )
        ));

        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.5000"),
                        new BigDecimal("70.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                ), // 갱신
                analysis(
                        HYNIX,
                        BASE_DATE,
                        new BigDecimal("-0.2500"),
                        new BigDecimal("31.0000"),
                        false,
                        false,
                        "기관 순매도",
                        defaultDaily(HYNIX)
                ) // 신규
        ));

        assertThat(countAll()).isEqualTo(2);
        assertThat((BigDecimal) findByStockCode(SAMSUNG).get("score"))
                .isEqualByComparingTo("70.5000");
        assertThat((BigDecimal) findByStockCode(HYNIX).get("score"))
                .isEqualByComparingTo("31.0000");

    }

    @Test
    @DisplayName("동일 배치 안에 중복 PK가 있으면 마지막 값이 남는다")
    void upsertAll_lastWinsWithSameBatch(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.5000"),
                        new BigDecimal("70.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                ),
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.7000"),
                        new BigDecimal("10.5000"),
                        true,
                        true,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                )
        ));

        assertThat(countAll()).isEqualTo(1);
        assertThat((BigDecimal) findByStockCode(SAMSUNG).get("score"))
                .isEqualByComparingTo("10.5000");
    }

    @Test
    @DisplayName("boolean 플래그가 독립적으로 저장된다")
    void upsertAll_persistsFlagsIndependently(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.5000"),
                        new BigDecimal("70.5000"),
                        true,
                        false,
                        "외국인/기관 동반 순매수",
                        defaultDaily(SAMSUNG)
                )
        ));

        Map<String, Object> row = findByStockCode(SAMSUNG);
        assertThat(row.get("double_buy")).isEqualTo(true);
        assertThat(row.get("clean_buy")).isEqualTo(false);
    }

    @Test
    @DisplayName("reason이 null이어도 저장된다")
    void upsertAll_allowsNullReason(){
        analysisMapper.upsertAll(List.of(
                analysis(
                        SAMSUNG,
                        BASE_DATE,
                        new BigDecimal("0.5000"),
                        new BigDecimal("70.5000"),
                        true,
                        false,
                        null,
                        defaultDaily(SAMSUNG)
                )
        ));
        assertThat(findByStockCode(SAMSUNG).get("reason")).isNull();
    }

    private int countAll(){
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM investor_flow_analysis", Integer.class);
    }

    private Map<String, Object> findByStockCode(String stockCode){
        return jdbcTemplate.queryForMap(
                "SELECT * FROM investor_flow_analysis WHERE stock_code = ? AND base_date = ?",
                stockCode, Date.valueOf(BASE_DATE)
        );
    }

}
