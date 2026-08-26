package com.stocktracer.backend.value;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.value.domain.EpsHistory;
import com.stocktracer.backend.value.mapper.EpsHistoryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

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
            INSERT INTO eps_history ()
        """)
    }
}
