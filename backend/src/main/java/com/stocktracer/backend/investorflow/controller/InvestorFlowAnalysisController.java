package com.stocktracer.backend.investorflow.controller;

import com.stocktracer.backend.investorflow.dto.InvestorFlowAnalysisBulkRequestDto;
import com.stocktracer.backend.investorflow.dto.InvestorFlowDailyBulkRequestDto;
import com.stocktracer.backend.investorflow.service.InvestorFlowAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class InvestorFlowAnalysisController {
    private final InvestorFlowAnalysisService analysisService;

    @PostMapping("/analysis")
    public ResponseEntity<Map<String,Object>> save(
            @Valid @RequestBody InvestorFlowAnalysisBulkRequestDto request){
        int affected = analysisService.save(request.items());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("requested", request.items().size(), "affected", affected));
    }
}
