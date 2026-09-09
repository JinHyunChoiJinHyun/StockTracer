package com.stocktracer.backend.value.facade;

import com.stocktracer.backend.config.MySqlTestContainerConfig;
import com.stocktracer.backend.value.domain.ScoredScope;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.repository.interfaces.EpsHistoryRepository;
import com.stocktracer.backend.value.service.EpsHistoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.willThrow;

@SpringBootTest
@Import(MySqlTestContainerConfig.class)
public class FundamentalFacadeRollbackTest {
    private static final LocalDate BASE_DATE = LocalDate.of(2026,9,1);

    @Autowired
    private FundamentalFacade facade;

    @Autowired
    private JdbcTemplate jdbc;

    @MockitoBean
    private EpsHistoryRepository epsHistoryRepository; // 실패 지점을 만들기 위해 목으로 설정

    @BeforeEach
    void setUp() {
        jdbc.update("DELETE FROM value_fundamental");
        jdbc.update("DELETE FROM eps_history");
    }

    @Test
    @DisplayName("EpsHistory 저장 실패 시 ValueFundamental도 실패")
    void eps_failure_rollback_value(){
        willThrow(new IllegalStateException("eps 저장 실패"))
                .given(epsHistoryRepository).upsertAll(anyList());

        assertThatThrownBy(() -> facade.save(createDto(List.of(
                item("005930", BASE_DATE ,new BigDecimal("1200.0000")),
                item("000660", BASE_DATE ,new BigDecimal("800.0000"))
        )))).isInstanceOf(IllegalStateException.class);

        // 트랜젝션 동작 확인
        assertThat(count("value_fundamental")).isZero();
        assertThat(count("eps_history")).isZero();
    }

    /* 헬퍼 메서드 */
    private Integer count(String table){
        return jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
    }

    /* 객체 생성 */
    private ValueFundamentalSaveRequestDto.Item item(
            String stockCode,
            LocalDate effectiveDate,
            BigDecimal eps
    ){
        return new ValueFundamentalSaveRequestDto.Item(
                stockCode,
                effectiveDate,
                "전기전자",
                new BigDecimal("12.3456"),
                new BigDecimal("1.2500"),
                eps,
                new BigDecimal("52000.0000"),
                new BigDecimal("1.8000"),
                400_000_000_000L,
                5_969_782_550L,
                1_234_567_890_123L,
                new BigDecimal("0.3200"),
                new BigDecimal("0.4100"),
                new BigDecimal("0.3650"),
                ScoredScope.SECTOR,
                new BigDecimal("0.152300"),
                Boolean.FALSE
        );
    }

    private ValueFundamentalSaveRequestDto createDto(List<ValueFundamentalSaveRequestDto.Item> items){
        return new ValueFundamentalSaveRequestDto(items);
    }
}
