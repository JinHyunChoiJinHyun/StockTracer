package com.stocktracer.backend.common.util;

import java.math.BigDecimal;

public final class BIgDecimalUtils {
    private BIgDecimalUtils(){
        // 객체 생성 방지
    }
    public static boolean gte(BigDecimal value, double threshold){
        return value != null && value.compareTo(BigDecimal.valueOf(threshold)) >= 0;
    }

    public static boolean lte(BigDecimal value, double threshold){
        return value != null && value.compareTo(BigDecimal.valueOf(threshold)) <= 0;
    }
}
