package com.stocktracer.backend.value.controller;

import com.stocktracer.backend.value.dto.EpsPrevResponseDto;
import com.stocktracer.backend.value.service.EpsHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("api/v1/stocks/value")
@RequiredArgsConstructor
public class EpsHistoryController {
    private final EpsHistoryService service;

    @GetMapping("/prev-eps")
    public ResponseEntity<EpsPrevResponseDto> getPrevEps(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate baseDate
            ){
        return ResponseEntity.ok(service.getPrevEps(baseDate));
    }
}
