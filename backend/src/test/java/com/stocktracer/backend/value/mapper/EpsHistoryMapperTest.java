package com.stocktracer.backend.value.mapper;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.value.domain.EpsHistory;
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

@MapperTest
public class EpsHistoryMapperTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,8,26);

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
}
