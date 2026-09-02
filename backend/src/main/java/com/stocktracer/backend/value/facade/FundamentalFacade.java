package com.stocktracer.backend.value.facade;

import com.stocktracer.backend.value.dto.EpsHistorySaveRequestDto;
import com.stocktracer.backend.value.dto.FundamentalSaveResponseDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.service.EpsHistoryService;
import com.stocktracer.backend.value.service.ValueFundamentalService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundamentalFacade {
    private final ValueFundamentalService valueFundamentalService;
    private final EpsHistoryService epsHistoryService;

    @Transactional
    public FundamentalSaveResponseDto save(ValueFundamentalSaveRequestDto request){
        /* 1. ValueFundamental 저장 */
        int valueAffected = valueFundamentalService.save(request);

        /* 2. EpsHistory 저장 */
        EpsHistorySaveRequestDto epsRequest = toEpsRequestDto(request);

        // 생략된 eps 수 계산 (eps가 null인 경우)
        int epsSkipped = request.items().size() - epsRequest.items().size();

        if (epsSkipped > 0){
            log.info("eps 누락으로 eps_history 저장 제외: {}건", epsSkipped);
        }

        int epsAffected = epsHistoryService.save(epsRequest);

        log.info("fundamental 저장 완료: value(요청={}건, 반영={}건), eps(요청={}건, 반영={}건, 제외={}건)",
                request.items().size(), valueAffected,
                epsRequest.items().size(), epsAffected, epsSkipped
                );

        return new FundamentalSaveResponseDto(valueAffected, epsAffected, epsSkipped);
    }

    /* 변환 */
    // EpsHistorySaveRequestDto로 변환
    private EpsHistorySaveRequestDto toEpsRequestDto(ValueFundamentalSaveRequestDto request){
        // dto에 입력할 items 생성
        List<EpsHistorySaveRequestDto.Item> items = request.items().stream()
                .filter(i -> i.eps() != null) // eps가 null이 아닌 dto만 필터링
                .map(i -> new EpsHistorySaveRequestDto.Item(
                        i.effectiveDate(),
                        i.stockCode(),
                        i.eps()
                ))
                .toList();

        return new EpsHistorySaveRequestDto(items);
    }
}
