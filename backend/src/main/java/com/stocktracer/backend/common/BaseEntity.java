package com.stocktracer.backend.common;

import java.time.LocalDateTime;

public class BaseEntity {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDelete;
}
