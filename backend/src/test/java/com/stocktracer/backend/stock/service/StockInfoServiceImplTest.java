package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.exception.StockInfoNotFoundException;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoJpaRepository;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class) // Mockito 사용
public class StockInfoServiceImplTest {

    @Mock
    private StockInfoRepository stockInfoRepository;

    @InjectMocks
    private StockInfoServiceImpl stockInfoServiceImpl; // 가짜 repository 주입

    @Test
    @DisplayName("DTO를 도메인으로 변환해 repository에 위임한다")
    void saveOrUpdateStocks_delegatesToRepository(){
        // given
        List<StockInfoDto> dtos = List.of(
                new StockInfoDto("005930", "삼성전자", "KOSPI"),
                new StockInfoDto("035720", "카카오", "KOSPI")
        );

        // when
        stockInfoServiceImpl.saveOrUpdateStocks(dtos);

        // then
        ArgumentCaptor<List<StockInfo>> captor = ArgumentCaptor.forClass(List.class);
        verify(stockInfoRepository).bulkSave(captor.capture());

        List<StockInfo> saved = captor.getValue();
        assertThat(saved).hasSize(2);
        assertThat(saved).extracting((StockInfo::getStockCode))
                .containsExactly("005930","035720");
        assertThat(saved.get(0).getMarket()).isEqualTo(MarketType.KOSPI);
    }

    @Test
    @DisplayName("빈 리스트면 repository를 호출하지 않는다")
    void saveOrUpdateStocks_emptyList(){
        stockInfoServiceImpl.saveOrUpdateStocks(List.of());
        verify(stockInfoRepository, never()).bulkSave(any());
    }

    @Test
    @DisplayName("null이면 repository를 호출하지 않는다")
    void saveOrUpdateStocks_null() {
        stockInfoServiceImpl.saveOrUpdateStocks(null);
        verify(stockInfoRepository, never()).bulkSave(any());
    }

    @Test
    @DisplayName("종목 코드로 조회한다")
    void findByStockCode_found(){
        StockInfo stock = StockInfo.create("005930", "삼성전자", MarketType.KOSPI);
        given(stockInfoRepository.findByStockCode("005930"))
                .willReturn(Optional.of(stock));

        StockInfo result = stockInfoServiceImpl.findByStockCode("005930");

        assertThat(result.getStockName()).isEqualTo("삼성전자");
    }

    @Test
    @DisplayName("없는 종목 코드면 예외를 던진다")
    void findByStockCode_notFound(){
        given(stockInfoRepository.findByStockCode(("999999")))
                .willReturn(Optional.empty());
        assertThatThrownBy(() -> stockInfoServiceImpl.findByStockCode("999999"))
                .isInstanceOf(StockInfoNotFoundException.class)
                .hasMessageContaining("999999");
    }

}
