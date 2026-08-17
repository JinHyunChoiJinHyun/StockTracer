package com.stocktracer.backend.global;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.Objects;

// 서버 요청 실패 시 출력
@RestControllerAdvice // 모든 컨트롤러에서 발생하는 에러 감시
public class GlobalExceptionHandler {
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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessRule(IllegalArgumentException e){
        return ResponseEntity.badRequest()
                .body(Map.of("error", "BUSINESS_RULE_VIOLATION", "message", e.getMessage()));
    }
}
