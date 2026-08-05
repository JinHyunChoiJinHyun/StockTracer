package com.stocktracer.backend.price.controller;

import com.stocktracer.backend.price.dto.StockPriceDto;
import com.stocktracer.backend.price.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController // @Controller + @ResponseBody (json 반환)
@RequiredArgsConstructor
@RequestMapping("api/v1/stocks") // v1 --> 버전 관리
public class StockPriceController {
    private final StockPriceService stockPriceService;
    @GetMapping("/prices/{stockCode}")
    public ResponseEntity<List<StockPriceDto>>getStockPrices(
            @PathVariable("stockCode")  String stockCode,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, // 파라미터로 받은 날짜 문자열 -> 날짜로 변환
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ){
        List<StockPriceDto> priceList = stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,endDate);
        return ResponseEntity.ok(priceList);
    }
}
