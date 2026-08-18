package com.stocktracer.backend.stock.mapper;

import com.stocktracer.backend.config.MySqlTestContainerConfig;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

// Spring Bean 사용 테스트
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(MySqlTestContainerConfig.class)
@ActiveProfiles("test")
public class StockInfoMapperTest {
    @Autowired
    private StockInfoMapper stockInfoMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void clean(){
        jdbcTemplate.execute("TRUNCATE TABLE stock_info");
    }

    @Test
    @DisplayName("신규 종목 일괄 삽입")
    void bulkUpsert_insert(){
        // given
        List<StockInfo> stocks = List.of(
                StockInfo.create("005930", "삼성전자", MarketType.KOSPI),
                StockInfo.create("035720", "카카오", MarketType.KOSPI),
                StockInfo.create("247540", "에코프로비엠", MarketType.KOSDAQ)
        );

        // when
        stockInfoMapper.bulkUpsert(stocks);

        // then
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM stock_info", Integer.class
        );
        assertThat(count).isEqualTo(3);

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT stock_name, market FROM stock_info WHERE stock_code = ?", "247540"
        );
        assertThat(row.get("stock_name")).isEqualTo("에코프로비엠");
        assertThat(row.get("market")).isEqualTo("KOSDAQ");
    }
    @Test
    @DisplayName("같은 종목 코드면 행이 늘지 않고 값만 갱신된다")
    void bulkUpsert_update(){
        // given
        stockInfoMapper.bulkUpsert(
                List.of(
                        StockInfo.create("005930", "삼성전자", MarketType.KOSPI)
                )
        );

        // when
        stockInfoMapper.bulkUpsert(
                List.of(
                        StockInfo.create("005930", "삼성전자우", MarketType.KOSDAQ)
                )
        );

        // then
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM stock_info", Integer.class
        );
        assertThat(count).isEqualTo(1);

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT stock_name, market FROM stock_info WHERE stock_code = ?", "005930"
        );
        assertThat(row.get("stock_name")).isEqualTo("삼성전자우");
        assertThat(row.get("market")).isEqualTo("KOSDAQ");
    }

    @Test
    @DisplayName("신규와 기존이 섞여 있어도 한 번에 처리된다")
    void bulkUpsert_mixed(){
        // given
        stockInfoMapper.bulkUpsert(List.of(
                StockInfo.create("005930", "삼성전자", MarketType.KOSPI)
        ));

        // when
        stockInfoMapper.bulkUpsert(List.of(
                StockInfo.create("005930", "삼성전자", MarketType.KOSPI), // 기존
                StockInfo.create("035720", "카카오", MarketType.KOSPI) // 신규
        ));

        // then
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM stock_info", Integer.class
        );
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("배치 규모(1000건)에서도 정상 동작한다")
    void bulkUpsert_largeBatch(){
        // given
        List<StockInfo> stocks = java.util.stream.IntStream.range(0, 1000) // 단순 데이터 변환 작업이므로 stream 사용
                .mapToObj(i -> StockInfo.create(
                        String.format("%06d", i), "종목" + i, MarketType.KOSPI
                ))
                .toList();

        // when
        stockInfoMapper.bulkUpsert(stocks);

        // then
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM stock_info", Integer.class
        );
        assertThat(count).isEqualTo(1000);
    }
}
