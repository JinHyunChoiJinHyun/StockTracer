package com.stocktracer.backend.global;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.Objects;

// 서버 요청 실패 시 출력
@RestControllerAdvice // 모든 컨트롤러에서 발생하는 에러 감시
@Slf4j
public class GlobalExceptionHandler {
    // 유효성 검사 위반 발생 시 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class) // 유효성 검사 (@Valid) 통과 불가 시 작동
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e){
        List<Map<String, String>> errors = e.getBindingResult().getFieldErrors().stream()
                .limit(20) // 최대 출력 갯수 제한
                .map(fe -> Map.of(
                        "field", fe.getField(), // 원인이 된 행
                        "rejected", String.valueOf(fe.getRejectedValue()), // 잘못 보낸 값
                        "message", Objects.requireNonNullElse(fe.getDefaultMessage(), "") // 틀린 이유
                ))
                .toList();
        return ResponseEntity.badRequest().body(Map.of(
                "error", "VALIDATION_FAILED",
                "totalErrors", e.getBindingResult().getFieldErrorCount(),
                "errors", errors
        ));
    }

    // 비즈니스 규칙 위반 발생 시 예외 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessRule(IllegalArgumentException e){
        return ResponseEntity.badRequest()
                .body(Map.of("error", "BUSINESS_RULE_VIOLATION", "message", e.getMessage()));
    }

    // db 제약 조건 위반 발생 시 예외 처리
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegrity(DataIntegrityViolationException e){
        log.error("DB 제약 위반:", e);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "DATA_INTEGRITY_VIOLATION",
                "message", "원본 수급 데이터 누락 또는 제약 조건 위반. 배치 순서 확인"
        ));
    }
}
