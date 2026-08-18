package com.stocktracer.backend.price.service;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceSaveBulkRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.exception.InvalidDateRangeException;
import com.stocktracer.backend.price.exception.StockPriceNotFoundException;
import com.stocktracer.backend.price.mapper.StockPriceMapper;
import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Mockitto 사용 설정
public class StockPriceServiceTest {
    @Mock
    private StockPriceMapper stockPriceMapper; // 가짜 객체 생성

    @Mock
    private StockInfoRepository stockInfoRepository;

    @InjectMocks // 직접 Impl 객체 생성
    private StockPriceServiceImpl stockPriceService; // 가짜 매퍼를 서비스에 주입

    /** 주가 조회 */
    String stockCode = "005930";
    LocalDate startDate = LocalDate.of(2026, 1, 1);
    LocalDate endDate = LocalDate.of(2026, 1, 31);

    @Test
    @DisplayName("유효한 주식 코드로 주가를 조회한다.")
    void getPricesByCodeAndPeriod_Success(){
        // Given (준비)
        // 가짜 리스트 데이터 생성
        List<StockPriceResponseDto> mockList = List.of(
                createDto(stockCode, startDate),
                createDto(stockCode, endDate)
        );

        // Mapper 조작
        given(stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate))
                .willReturn(mockList);

        // When (실행)
        List<StockPriceResponseDto> result = stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,endDate);

        // Then (검증)
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).stockCode()).isEqualTo("005930");

        // Mapper 제대로 1번 호출됐는지 확인
        verify(stockPriceMapper).findPricesByCodeAndPeriod(stockCode,startDate,endDate);
    }

    @Test
    @DisplayName("조회 결과가 비어있으면 StockPriceNotFoundException을 던진다")
    void throwsWhenResultIsEmpty(){
        // Given
        given(stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate))
                .willReturn(List.of());

        // When & Then
        assertThatThrownBy(() ->
                stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,endDate))
                .isInstanceOf(StockPriceNotFoundException.class)
                .hasMessageContaining(stockCode);
    }
    @Test
    @DisplayName("종목 코드가 빈 문자열이면 IllegalArgumentException을 던진다")
    void throwsWhenStockCodeIsBlank(){
        assertThatThrownBy(()->
                stockPriceService.getPricesByCodeAndPeriod("    ",startDate,endDate))
                .isInstanceOf(IllegalArgumentException.class);

        // 예외로 인해 호출되지 않았는지 확인
        verify(stockPriceMapper, never()).findPricesByCodeAndPeriod(anyString(),any(),any());
    }

    @Test
    @DisplayName("시작일 또는 종료일이 null이면 IllegalArgumentException을 던진다")
    void throwsWhenDateIsNull(){
        assertThatThrownBy(() ->
                stockPriceService.getPricesByCodeAndPeriod(stockCode,null,endDate))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() ->
                stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,null))
                .isInstanceOf(IllegalArgumentException.class);

        verify(stockPriceMapper, never()).findPricesByCodeAndPeriod(anyString(),any(),any());
    }

    @Test
    @DisplayName("시작일이 종료일보다 늦으면 IllegalArgumentException을 던진다")
    void throwsWhenStartDateAfterEndDate(){
        LocalDate invaildStart = endDate.plusDays(1);

        assertThatThrownBy(() ->
                stockPriceService.getPricesByCodeAndPeriod(stockCode,invaildStart,endDate))
                .isInstanceOf(InvalidDateRangeException.class);

        verify(stockPriceMapper, never()).findPricesByCodeAndPeriod(anyString(),any(),any());
    }
    private StockPriceResponseDto createDto(
            String stockCode,
            LocalDate priceDate
    ){
        StockPriceResponseDto dto = StockPriceResponseDto.builder()
                .stockCode(stockCode)
                .stockDate(priceDate)
                .build();
        return dto;
    }

    /** 주가 저장 */
    @Test
    @DisplayName("정상적인 주가 리스트가 들어오면 정상 호출")
    void bulkSave_Success(){
        // given
        LocalDate targetDate = LocalDate.of(2026, 8, 6);

        StockPriceSaveRequestDto requestDto = new StockPriceSaveRequestDto(
                "005930",                           // stockCode
                targetDate,                         // stockDate
                new BigDecimal("70000"),            // openPrice
                new BigDecimal("72000"),            // closePrice
                new BigDecimal("69500"),            // lowPrice
                new BigDecimal("72500"),            // highPrice
                new BigDecimal("2000"),             // priceChange
                15000000L,                           // volume
                new BigDecimal("2000"),
                new BigDecimal("2000")
        );
        StockPriceSaveBulkRequestDto bulkDto = new StockPriceSaveBulkRequestDto(List.of(requestDto));

        StockInfo mockInfo = new StockInfo("005930", "삼성전자", MarketType.KOSPI);

        given(stockInfoRepository.findAllByStockCodeIn(anyList())).willReturn(List.of(mockInfo));

        // when
        stockPriceService.bulkSave(bulkDto);

        // then
        verify(stockPriceMapper, times(1)).bulkUpsert(anyList());
    }

    @Test
    @DisplayName("stockInfoMap에 없는 stockCode가 들어오면 StockInfoNotFoundException이 발생한다")
    void bulkSave_NotFoundStockCode_ThrowsException(){
        // given
        StockPriceSaveRequestDto invalidDto = new StockPriceSaveRequestDto(
                "INVALID_CODE",
                LocalDate.now(),
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, 0L,BigDecimal.ZERO, BigDecimal.ZERO
        );
        StockPriceSaveBulkRequestDto bulkDto = new StockPriceSaveBulkRequestDto(List.of(invalidDto));
//        List<StockPriceSaveRequestDto> bulkDto = List.of(invalidDto);

        // IN 쿼리 결과가 빈 리스트일 떄
        given(stockInfoRepository.findAllByStockCodeIn(anyList())).willReturn(List.of()); // 해당 로직 실행 시 반환할 값 지정

        // when & then
        assertThatThrownBy(() -> stockPriceService.bulkSave(bulkDto))
                .isInstanceOf(StockInfoNotFoundException.class);
    }


    private StockPrice createStockPrice(String stockCode, String open, String high, String low, String close){
        return StockPrice.builder()
                .stockCode(stockCode)
                .priceDate(LocalDate.of(2026, 8, 6))
                .openPrice(new BigDecimal(open))
                .highPrice(new BigDecimal(high))
                .lowPrice(new BigDecimal(low))
                .closePrice(new BigDecimal(close))
                .priceChange(BigDecimal.ZERO)
                .volume(1_000_000L)
                .build();
    }

}
