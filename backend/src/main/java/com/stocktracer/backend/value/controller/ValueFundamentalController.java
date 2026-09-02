package com.stocktracer.backend.value.controller;

import com.stocktracer.backend.value.domain.ValueFundamental;
import com.stocktracer.backend.value.dto.FundamentalSaveResponseDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveRequestDto;
import com.stocktracer.backend.value.dto.ValueFundamentalSaveResponseDto;
import com.stocktracer.backend.value.facade.FundamentalFacade;
import com.stocktracer.backend.value.service.ValueFundamentalService;
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
@RequestMapping("api/v1/stocks/value")
@RequiredArgsConstructor
public class ValueFundamentalController {

    private final FundamentalFacade facade;

    @PostMapping("/save")
    public ResponseEntity<FundamentalSaveResponseDto> save(
            @Valid @RequestBody ValueFundamentalSaveRequestDto request
            ){
        return ResponseEntity.ok(facade.save(request));
    }
}
