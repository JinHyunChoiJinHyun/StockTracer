package com.stocktracer.backend.investorflow.mapper;

import com.stocktracer.backend.investorflow.domain.InvestorFlowDaily;
import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyRequestDto;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
@Testcontainers // 도커 컨테이너들의 타이밍(시작/종료 주기)을 관리해 주는 역할
public class InvestorFlowMapperTest {
    @Container // 내 PC 자원을 떼어내서 도커 컨테이너(격리된 방/작은 PC)를 생성
    @ServiceConnection
    static MySQLContainer mysql = new MySQLContainer("mysql:8.0.36");

    @Autowired
    InvestorFlowDailyMapper mapper;
    @Autowired
    JdbcTemplate jdbc;

    @BeforeEach
    void setUp() {
        jdbc.execute("TRUNCATE TABLE investor_flow_daily");
    }

    @Test
    void 빈_테이블에_신규_INSERT된다(){
        StockInfo samsungStock = new StockInfo("005930", "삼성전자", MarketType.KOSPI); // 가정된 생성자

        InvestorFlowDailyRequestDto samsungDto = new InvestorFlowDailyRequestDto(
                "005930",
                LocalDate.of(2026, 8, 16),
                150000000L,
                -50000000L,
                -100000000L,
                500000000L
        );

        StockInfo skStock = new StockInfo("000660", "SK하이닉스",MarketType.KOSPI);

        InvestorFlowDailyRequestDto skDto = new InvestorFlowDailyRequestDto(
                "000660",
                LocalDate.of(2026, 8, 16),
                150000000L,
                -50000000L,
                -100000000L,
                500000000L
        );
        List<InvestorFlowDaily> flows = List.of(
                InvestorFlowDaily.of(samsungDto,samsungStock),
                InvestorFlowDaily.of(skDto,skStock)
        );

        mapper.bulkUpsert(flows);

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM investor_flow_daily", Integer.class
        );
        assertThat(count).isEqualTo(2);
    }

    @Test
    void 같은_pk로_재실행하면_행이_늘지않고_값만_갱신된다(){
        InvestorFlowDailyRequestDto samsungDto = new InvestorFlowDailyRequestDto(
                "005930",
                LocalDate.of(2026, 8, 16),
                150000000L,
                -50000000L,
                -100000000L,
                500000000L
        );

        StockInfo samsungStock = new StockInfo("005930", "삼성전자", MarketType.KOSPI); // 가정된 생성자

        mapper.bulkUpsert(List.of(InvestorFlowDaily.of(samsungDto, samsungStock)));

        InvestorFlowDailyRequestDto updatedDto = InvestorFlowDailyRequestDto.builder()
                        .stockCode("005930").baseDate(LocalDate.of(2026,8,16))
                        .foreignNet(250000000L).institutionNet(-50000000L)
                        .individualNet(-100000000L).tradingValue(500000000L)
                        .build();

        mapper.bulkUpsert(List.of(InvestorFlowDaily.of(updatedDto,samsungStock)));

        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM investor_flow_daily", Integer.class
        );

        Long foriegnNet = jdbc.queryForObject(
                "SELECT foreign_net FROM investor_flow_daily WHERE stock_code = '005930'",
                Long.class
        );

        assertThat(count).isEqualTo(1);
        assertThat(foriegnNet).isEqualTo(250000000L);
    }

    @Test
    void tradingValue가_null이어도_저장(){
        InvestorFlowDailyRequestDto dto = InvestorFlowDailyRequestDto.builder()
                .stockCode("005930").baseDate(LocalDate.of(2026,8,16))
                .foreignNet(250000000L).institutionNet(-50000000L)
                .individualNet(-100000000L).tradingValue(null)
                .build();

        StockInfo info = StockInfo.builder()
                .stockCode("005930")
                .stockName("삼성전자")
                .market(MarketType.KOSPI)
                .build();

        mapper.bulkUpsert(List.of(InvestorFlowDaily.of(dto,info)));

        Long value = jdbc.queryForObject(
                "SELECT trading_value FROM investor_flow_daily WHERE stock_code = '005930'",
                Long.class
                );
        assertThat(value).isNull();
    }
}
