package com.stocktracer.backend.main.controller;

import com.stocktracer.backend.main.dto.MainStockPageResponseDto;
import com.stocktracer.backend.main.service.MainStockQueryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("api/v1/main/stocks")
@RequiredArgsConstructor
public class MainStockController {
    private static final int MAX_PAGE_SIZE = 100;
    private final MainStockQueryService service;

    @GetMapping
    public ResponseEntity<MainStockPageResponseDto> getMainStocks(
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size
    ){
        return ResponseEntity.ok(service.getMainStocks(sort, page, size));
    }
}
