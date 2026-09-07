package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.value.domain.EpsHistory;
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
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.time.YearMonth.parse;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.map;

@MapperTest
public class EpsHistoryMapperTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,8,26);
    private static final LocalDate Q1 = LocalDate.of(2026, 3, 31);
    private static final LocalDate Q2 = LocalDate.of(2026, 6, 30);
    private static final LocalDate Q3 = LocalDate.of(2026, 9, 30);

    @Autowired
    private EpsHistoryMapper mapper;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void clean(){
        jdbc.execute("TRUNCATE TABLE eps_history");
    }

    private void insert(
            String code,
            String date,
            String eps
    ){
        jdbc.update("""
            INSERT INTO eps_history (stock_code, effective_date, eps)
            VALUES (?, ?, ?)
        """, code, LocalDate.parse(date), new BigDecimal(eps));
    }

    private Map<String, EpsHistory> byCode(List<EpsHistory> rows){
        return rows.stream()
                .collect(Collectors.toMap(EpsHistory::stockCode, Function.identity()));
    }

    /* 조회 */
    @Test
    @DisplayName("종목별 최신 1건만 prev_eps로 반환한다")
    void latestPerStock(){
        insert("005930", "2026-02-10", "5000");
        insert("005930", "2026-05-16", "6012"); // 같은 날짜가 들어갈 일이 있을까? 설계 면에서 검토 필요
        insert("000660", "2026-05-15", "12000");
        insert("000660", "2026-05-16", "12040");

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE));

        assertThat(result).hasSize(2);
        assertThat(result.get("005930").eps()).isEqualByComparingTo("6012");
        assertThat(result.get("005930").effectiveDate()).isEqualTo(LocalDate.of(2026,5,16));
        assertThat(result.get("000660").eps()).isEqualByComparingTo("12040");
    }

    @Test
    @DisplayName("이력이 비어있으면 빈 리스트 반환 - 수집 첫날 대비")
    void emptyEpsHistory(){
        assertThat(mapper.findPrevEps(BASE_DATE));
    }

    @Test
    @DisplayName("기준일 당일 이력은 제외한다 — 배치 재실행 멱등성")
    void excludeBaseDate(){
        insert("005930", "2026-05-15", "6012");
        insert("005930", "2026-08-26", "5678"); // 금일 적재분

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE));

        assertThat(result.get("005930").eps()).isEqualByComparingTo("6012");
    }

    @Test
    @DisplayName("기준일 이후 이력도 제외한다 — 과거 시점 재현")
    void excludeFutureDate(){
        insert("005930", "2026-05-15", "6012");
        insert("005930", "2026-09-30", "5678");

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE));

        assertThat(result.get("005930").eps()).isEqualByComparingTo("6012");
    }

    @Test
    @DisplayName("기준일 이전 이력이 없는 종목은 응답에서 빠진다")
    void excludeNew(){
        insert("005930", "2026-05-15", "6012");
        insert("999999", "2026-08-26", "300");

        assertThat(byCode(mapper.findPrevEps(BASE_DATE))).containsOnlyKeys("005930");
    }

    @Test
    @DisplayName("음수 EPS와 0을 그대로 전달한다 — 판정은 Python 책임")
    void preserveNegativeAndZero(){
        insert("005930", "2026-05-15", "-1200.50");
        insert("000660", "2026-05-15", "0");

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE));

        assertThat(result.get("005930").eps()).isEqualByComparingTo("-1200.50");
        assertThat(result.get("000660").eps()).isEqualByComparingTo("0");

    }

    @Test
    @DisplayName("DECIMAL(18,2) 정밀도가 소실되지 않는다")
    void preserveScale(){
        insert("005930", "2026-05-15", "123456789012345.67");

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE));

        assertThat(result.get("005930").eps()).isEqualByComparingTo("123456789012345.67");
    }

    @Test
    @DisplayName("대량 종목도 종목당 1건씩만 반환한다")
    void bulkReturnOne(){
        for (int i = 0; i < 2800; i++){
            String code = String.format("%06d", i);

            insert(code, "2026-02-10", "1000");
            insert(code, "2026-05-15", "2000");
        }

        List<EpsHistory> result = mapper.findPrevEps(BASE_DATE);

        assertThat(result).hasSize(2800);
        assertThat(result).allSatisfy(h ->
                assertThat(h.eps()).isEqualByComparingTo("2000"));
    }

    /* 저장 */
    // 정상
    @Test
    @DisplayName("신규 행이면 그대로 저장")
    void insert_new(){
        mapper.upsertAll(List.of(
                epsHistory("005930", Q1, "1200.5000"),
                epsHistory("000660", Q1, "1300.5000")
        ));

        assertThat(count()).isEqualTo(2);
        assertThat(getEps("005930", Q1)).isEqualByComparingTo("1200.5000");
        assertThat(getEps("000660", Q1)).isEqualByComparingTo("1300.5000");
    }

    @Test
    @DisplayName("같은 종목이더라도 분기가 다르면 별도로 저장")
    void save_history_per_effective_date(){
        mapper.upsertAll(List.of(
                epsHistory("005930", Q1, "1200.0000"),
                epsHistory("005930", Q2, "1350.0000"),
                epsHistory("005930", Q3, "1410.0000")
        ));

        assertThat(count()).isEqualTo(3);
    }

    @Test
    @DisplayName("같은 pk로 재실행 시 업데이트")
    void same_key_update_eps(){
        mapper.upsertAll(List.of(epsHistory("005930", Q1,"1200.0000")));
        mapper.upsertAll(List.of(epsHistory("005930", Q1,"9999.0000")));

        assertThat(count()).isEqualTo(1);
        assertThat(getEps("005930",Q1)).isEqualByComparingTo("9999.0000");
    }

    @Test
    @DisplayName("한번에 신규 insert와 기존 update를 각각 처리")
    void mixed_insert_and_update_in_once(){
        mapper.upsertAll(List.of(
                epsHistory("005930", Q1,"1200.0000"),
                epsHistory("000660", Q1,"800.0000")
        ));

        mapper.upsertAll(List.of(
                epsHistory("005930", Q1,"1250.0000"), // update
                epsHistory("035420", Q1,"300.0000")   // insert
        ));

        assertThat(count()).isEqualTo(3);
        assertThat(getEps("005930",Q1)).isEqualByComparingTo("1250.0000");
        assertThat(getEps("035420",Q1)).isEqualByComparingTo("300.0000");
        assertThat(getEps("000660",Q1)).isEqualByComparingTo("800.0000");
    }

    // 엣지 케이스
    @Test
    @DisplayName("eps는 null이 저장되고 0으로 저장 x")
    void eps_saved_null_not_zero(){
        mapper.upsertAll(List.of(epsHistory("005930", Q1, null)));

        assertThat(count()).isEqualTo(1);
        assertThat(getEps("005930", Q1)).isNull();
    }

    @Test
    @DisplayName("eps가 null로 업데이트 가능")
    void eps_can_back_to_null(){
        mapper.upsertAll(List.of(epsHistory("005930", Q1,"1200.0000")));
        mapper.upsertAll(List.of(epsHistory("005930", Q1,null)));

        assertThat(getEps("005930", Q1)).isNull(); // 산출불가가 옛날 값으로 인해 계산되서는 안됨
    }

    @Test
    @DisplayName("eps는 0과 음수 저장 가능")
    void eps_can_zero_and_negative(){
        mapper.upsertAll(List.of(
                epsHistory("005930", Q1,"0"),
                epsHistory("000660", Q1,"-800.0000")
        ));

        assertThat(getEps("005930", Q1)).isZero();
        assertThat(getEps("000660", Q1)).isEqualByComparingTo("-800.0000");
    }

    @Test
    @DisplayName("DECIMAL 정밀도가 손실 없이 저장된다")
    void decimal_scale_preserved() {
        mapper.upsertAll(List.of(
                epsHistory("005930", Q1, "12345678901234.5678"),
                epsHistory("000660", Q1, "0.0001")
        ));

        assertThat(getEps("005930", Q1)).isEqualByComparingTo("12345678901234.5678");
        assertThat(getEps("000660", Q1)).isEqualByComparingTo("0.0001");
    }

    // 대량
    @Test
    @DisplayName("대량 upsert 정상 동작 확인")
    void bulk_upsert(){
        List<EpsHistory> values = java.util.stream.IntStream.range(0,1000)
                .mapToObj(i -> epsHistory(
                        String.format("%06d", i), Q1, "1"
                ))
                .toList();

        mapper.upsertAll(values);

        List<EpsHistory> updatedValues = java.util.stream.IntStream.range(0,1000)
                .mapToObj(i -> epsHistory(
                        String.format("%06d", i), Q1, "2"
                ))
                .toList();

        mapper.upsertAll(updatedValues);

        assertThat(count()).isEqualTo(1000);
        assertThat(getEps("000001",Q1)).isEqualByComparingTo("2");
    }


    /* 객체 생성 */
    private EpsHistory epsHistory(
            String stockCode,
            LocalDate effectiveDate,
            String eps
    ){
        return new EpsHistory(
                stockCode,
                effectiveDate,
                new BigDecimal(eps)
        );
    }

    /* 헬퍼 메서드 */

    private Integer count(){
        return jdbc.queryForObject(
                """
                    SELECT count(*) FROM eps_history
                    """,
                Integer.class
        );
    }

    private BigDecimal getEps(String stockCode, LocalDate effectiveDate) {
        return jdbc.queryForObject(
                "SELECT eps FROM eps_history WHERE stock_code = ? AND effective_date = ?",
                BigDecimal.class, stockCode, effectiveDate);
    }
}
