package com.stocktracer.backend.stock.mapper;

import com.stocktracer.backend.price.dto.StockPriceDto;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

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
        List<StockPriceDto> result = stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate);

        assertThat(result).isNotEmpty();
    }
}
