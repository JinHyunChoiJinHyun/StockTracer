package com.stocktracer.backend.stock.service;

import com.stocktracer.backend.stock.domain.MarketType;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.entitiy.StockInfoEntity;
import com.stocktracer.backend.stock.repository.interfaces.StockInfoJpaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class) // Mockito 사용
public class StockInfoServiceImplTest {
    @Mock
    private StockInfoJpaRepository stockInfoJpaRepository;

    @InjectMocks
    private StockInfoServiceImpl stockInfoServiceImpl; // 가짜 repository 주입

    @Test
    @DisplayName("주식 정보가 이미 존재하면 업데이트 실행")
    void updateExistingStock(){
        // given
        StockInfo existingDomain = new StockInfo("005930", "삼성전자", MarketType.KOSPI);
        StockInfoEntity existingEntity = new StockInfoEntity(existingDomain);

        given(stockInfoJpaRepository.findById("005930"))
                .willReturn(Optional.of(existingEntity));

        StockInfoDto dto = new StockInfoDto("005930", "삼성전자우","KOSDAQ");

        // when
        stockInfoServiceImpl.saveOrUpdateStocks(List.of(dto));

        // then
        // save가 어떤 값으로 저장 됐는지 검증 (가짜 레포지토리이므로 실제 저장되지 않아 캡처 필요)
        ArgumentCaptor<StockInfoEntity> captor = ArgumentCaptor.forClass(StockInfoEntity.class);
        verify(stockInfoJpaRepository).save(captor.capture()); // save 되는 순간의 값을 캡처

        assertThat(captor.getValue().getStockName()).isEqualTo("삼성전자우");
        assertThat(captor.getValue().getMarket());

        // 신규 생성 여부 확인
        verify(stockInfoJpaRepository, times(1)).save(any()); // save라는 행위가 1번만 일어났는지 검증

    }

}
