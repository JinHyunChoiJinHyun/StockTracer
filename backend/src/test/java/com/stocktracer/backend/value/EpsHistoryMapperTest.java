package com.stocktracer.backend.value;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.mapper.EpsHistoryMapper;
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
            String eps,
            int seq
    ){
        jdbc.update("""
            INSERT INTO eps_history (stock_code, effective_date, eps, seq)
            VALUES (?, ?, ?, ?)
        """, code, LocalDate.parse(date), new BigDecimal(eps), seq);
    }

    private Map<String, EpsHistory> byCode(List<EpsHistory> rows){
        return rows.stream()
                .collect(Collectors.toMap(EpsHistory::stockCode, Function.identity()));
    }

    @Test
    @DisplayName("종목별 최신 1건만 prev_eps로 반환한다")
    void latestPerStock(){
        insert("005930", "2026-02-10", "5000", 1);
        insert("005930", "2026-05-15", "6012", 2); // 같은 날짜가 들어갈 일이 있을까? 설계 면에서 검토 필요
        insert("000660", "2026-05-15", "12040", 1);

        Map<String, EpsHistory> result = byCode(mapper.findPrevEps(BASE_DATE, 1));

        assertThat(result).hasSize(2);
        assertThat(result.get("005930").prevEps()).isEqualByComparingTo("6012");
        assertThat(result.get("005930").prevEffectiveDate()).isEqualTo(LocalDate.of(2026,5,15));
        assertThat(result.get("000660").prevEps()).isEqualByComparingTo("12040");

    }
}
