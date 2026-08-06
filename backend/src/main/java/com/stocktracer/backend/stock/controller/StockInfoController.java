package com.stocktracer.backend.stock.controller;

import com.stocktracer.backend.stock.dto.StockInfoDto;
import com.stocktracer.backend.stock.service.StockInfoServiceImpl;
import com.stocktracer.backend.stock.service.interfaces.StockInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/stocks")
@RequiredArgsConstructor
public class StockInfoController {
    private final StockInfoService stockInfoService;

    @PostMapping("/info")
    public ResponseEntity<String> saveOrUpdateStocks(
            @RequestBody List<StockInfoDto> dtos // json -> 객체로 변환
    ){
        stockInfoService.saveOrUpdateStocks(dtos);
        return ResponseEntity.ok("주식 정보가 정상적으로 처리되었습니다.");
    }
}
