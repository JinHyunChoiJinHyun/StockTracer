package com.stocktracer.backend.price.controller;

import com.stocktracer.backend.price.domain.StockPrice;
import com.stocktracer.backend.price.dto.StockPriceBulkSaveRequestDto;
import com.stocktracer.backend.price.dto.StockPriceResponseDto;
import com.stocktracer.backend.price.dto.StockPriceSaveRequestDto;
import com.stocktracer.backend.price.service.StockPriceServiceImpl;
import com.stocktracer.backend.price.service.interfaces.StockPriceService;
import com.stocktracer.backend.stock.domain.StockInfo;
import com.stocktracer.backend.stock.service.interfaces.StockInfoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController // @Controller + @ResponseBody (json 반환)
@RequiredArgsConstructor
@RequestMapping("api/v1/stocks/prices") // v1 --> 버전 관리
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StockPriceController {
    private final StockPriceService stockPriceService;
    private final StockInfoService stockInfoService;

    @GetMapping("/{stockCode}")
    public ResponseEntity<List<StockPriceResponseDto>>getStockPrices(
            @PathVariable("stockCode")  String stockCode,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, // 파라미터로 받은 날짜 문자열 -> 날짜로 변환
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ){
        List<StockPriceResponseDto> priceList = stockPriceService.getPricesByCodeAndPeriod(stockCode,startDate,endDate);
        return ResponseEntity.ok(priceList);
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> bulkSave(@Valid @RequestBody StockPriceBulkSaveRequestDto bulkDto){
        stockPriceService.bulkSave(bulkDto); // dto는 서비스에서 분해
        return ResponseEntity.ok().build();
    }
}
