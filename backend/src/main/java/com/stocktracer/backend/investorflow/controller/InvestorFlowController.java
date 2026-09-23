package com.stocktracer.backend.investorflow.controller;

import com.stocktracer.backend.investorflow.dto.InvestorFlowResponseDto;
import com.stocktracer.backend.investorflow.dto.InvestorFlowSaveRequestDto;
import com.stocktracer.backend.investorflow.facade.InvestorFlowFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stocks/investor-flow")
@RequiredArgsConstructor
public class InvestorFlowController {
    private final InvestorFlowFacade facade;

    @PostMapping("/save")
    public ResponseEntity<InvestorFlowResponseDto> save(
            @RequestBody InvestorFlowSaveRequestDto request
            ){
        return ResponseEntity.ok(facade.save(request));
    }

}
