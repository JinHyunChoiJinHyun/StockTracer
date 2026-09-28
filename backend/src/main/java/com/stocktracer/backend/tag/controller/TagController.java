package com.stocktracer.backend.tag.controller;

import com.stocktracer.backend.tag.dto.TagGenerationResponseDto;
import com.stocktracer.backend.tag.service.TagGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("api/v1/stocks/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagGenerationService service;

    @PutMapping("/{baseDate}")
    public ResponseEntity<TagGenerationResponseDto> tagGenerate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate
    ){
        return ResponseEntity.ok(service.tagGenerate(baseDate));
    }
}
