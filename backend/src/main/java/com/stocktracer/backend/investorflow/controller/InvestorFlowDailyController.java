package com.stocktracer.backend.investorflow.controller;

import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyBulkRequestDto;
import com.stocktracer.backend.investorflow.service.InvestorFlowDailyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/stocks/investor-flows")
@RequiredArgsConstructor
public class InvestorFlowDailyController {

    private final InvestorFlowDailyService investorFlowDailyService;

    @PostMapping("daily")
    public ResponseEntity<Map<String, Object>> save(
            @Valid @RequestBody InvestorFlowDailyBulkRequestDto bulkDto
    ){
        int affected = investorFlowDailyService.save(bulkDto.items());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("requested", bulkDto.items().size(), "affected",affected));
    }
}
