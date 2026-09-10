package com.stocktracer.backend.main.controller;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("api/v1/main/stocks")
public class MainStockController {
    private static final int MAX_PAGE_SIZE = 100;

}
