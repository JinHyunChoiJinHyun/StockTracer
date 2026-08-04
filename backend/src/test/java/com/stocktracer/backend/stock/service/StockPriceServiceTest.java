package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.dto.StockPriceDto;
import com.stocktracer.backend.stock.exception.InvalidDateRangeException;
import com.stocktracer.backend.stock.exception.StockPriceNotFoundException;
import com.stocktracer.backend.stock.mapper.StockPriceMapper;
import com.stocktracer.backend.stock.service.StockPriceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // Mockitto 사용 설정
public class StockPriceServiceTest {
    @Mock
    private StockPriceMapper stockPriceMapper; // 가짜 객체 생성

    @InjectMocks
    private StockPriceService stockPriceService; // 가짜 매퍼를 서비스에 주입

    String stockCode = "005930";
    LocalDate startDate = LocalDate.of(2026, 1, 1);
    LocalDate endDate = LocalDate.of(2026, 1, 31);

    @Test
    @DisplayName("유효한 주식 코드로 주가를 조회한다.")
    void getPricesByCodeAndPeriod_Success(){
        // Given (준비)
        // 가짜 리스트 데이터 생성
        List<StockPriceDto> mockList = List.of(
                createDto(stockCode, startDate),
                createDto(stockCode, endDate)
        );

        // Mapper 조작
        given(stockPriceMapper.findPricesByCodeAndPeriod(stockCode,startDate,endDate))
                .willReturn(mockList);

        // When (실행)
        List<StockPriceDto> result = stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,endDate);

        // Then (검증)
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStockCode()).isEqualTo("005930");

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
    private StockPriceDto createDto(
            String stockCode,
            LocalDate priceDate
    ){
        StockPriceDto dto = StockPriceDto.builder()
                .stockCode(stockCode)
                .priceDate(priceDate)
                .build();
        return dto;
    }

}
