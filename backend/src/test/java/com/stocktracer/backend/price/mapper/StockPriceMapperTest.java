package com.stocktracer.backend.price.mapper;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 db 연결 시
public class StockPriceMapperTest {
    @Autowired
    private StockPriceMapper stockPriceMapper;

    String stockCode = "005930";
    LocalDate startDate = LocalDate.of(2026, 8, 1);
    LocalDate endDate = LocalDate.of(2026, 8, 2);

    @Test
    @DisplayName("실제 db에서 기간별 주가 조회가 잘 되는지 테스트")
    void findPricesByCodeAndPeriod_Success(){
        // 실제 db 혹은 테스트용 데이터 넣은 후 쿼리 실행
        List<StockPriceResponseDto> result = stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate);

        assertThat(result).isNotEmpty();
    }

    /** 주가 저장 */
    @Test
    @DisplayName("bulkUpsert - 신규 데이터 혹은 날짜가 다른 INSERT 동작 검증")
    void bulkUpsert_Insert_Success(){
        // given
        StockPrice existingPrice = StockPrice.of(
                "005930",
                LocalDate.of(2026, 8, 1),
                BigDecimal.valueOf(1000), // openPrice
                BigDecimal.valueOf(2000), // closePrice
                BigDecimal.valueOf(500),  // lowPrice
                BigDecimal.valueOf(3000), // highPrice
                BigDecimal.valueOf(100),  // priceChange
                50000L, // volume
                BigDecimal.valueOf(100),  // tradingValue
                BigDecimal.valueOf(100)  // marketCap
        );

        // when (업데이트 객체 1, 새 객체 1)
        List<StockPrice> dtoList = List.of(
                StockPrice.of(
                    "005930",
                    LocalDate.of(2026, 8, 2),
                    BigDecimal.valueOf(1100), // openPrice
                    BigDecimal.valueOf(2100), // closePrice
                    BigDecimal.valueOf(600),  // lowPrice
                    BigDecimal.valueOf(3100), // highPrice
                    BigDecimal.valueOf(200),  // priceChange
                    50000L, // volume
                    BigDecimal.valueOf(100),  // tradingValue
                    BigDecimal.valueOf(100)  // marketCap
                ),
                StockPrice.of(
                    "000660",
                    LocalDate.of(2026, 8, 2),
                    BigDecimal.valueOf(7000), // openPrice
                    BigDecimal.valueOf(8000), // closePrice
                    BigDecimal.valueOf(6500),  // lowPrice
                    BigDecimal.valueOf(8500), // highPrice
                    BigDecimal.valueOf(500),  // priceChange
                    120000L, // volume
                    BigDecimal.valueOf(100),  // tradingValue
                    BigDecimal.valueOf(100)  // marketCap
                )
        );

        // 실행
        stockPriceMapper.bulkUpsert(dtoList);

        // then
        // (*매우 중요) 순서로 인해 매칭 안될 수 있으니 필수
        List<StockPriceResponseDto> insertedResult1 = stockPriceMapper.findPricesByCodeAndPeriod("005930", LocalDate.of(2026, 8, 2),LocalDate.of(2026, 8, 2));
        assertThat(insertedResult1)
                .singleElement()
                .satisfies(dto -> {
                    assertThat(dto.openPrice()).isEqualTo(BigDecimal.valueOf(1100));
                    assertThat(dto.closePrice()).isEqualTo(BigDecimal.valueOf(2100));
                    assertThat(dto.lowPrice()).isEqualTo(BigDecimal.valueOf(600));
                    assertThat(dto.highPrice()).isEqualTo(BigDecimal.valueOf(3100));
                    assertThat(dto.priceChange()).isEqualTo(BigDecimal.valueOf(200));
                    assertThat(dto.volume()).isEqualTo(50000L);
                });
        List<StockPriceResponseDto> insertedResult2 = stockPriceMapper.findPricesByCodeAndPeriod("000660", LocalDate.of(2026, 8, 2),LocalDate.of(2026, 8, 2));
        assertThat(insertedResult2)
                .singleElement()
                .satisfies(dto -> {
                    assertThat(dto.openPrice()).isEqualTo(BigDecimal.valueOf(7000));
                    assertThat(dto.closePrice()).isEqualTo(BigDecimal.valueOf(8000));
                    assertThat(dto.lowPrice()).isEqualTo(BigDecimal.valueOf(6500));
                    assertThat(dto.highPrice()).isEqualTo(BigDecimal.valueOf(8500));
                    assertThat(dto.priceChange()).isEqualTo(BigDecimal.valueOf(500));
                    assertThat(dto.volume()).isEqualTo(120000L );
                });

    }
}
