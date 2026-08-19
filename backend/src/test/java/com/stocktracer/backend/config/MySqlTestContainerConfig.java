package com.stocktracer.backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mysql.MySQLContainer;

// Mapper 테스트가 많아질 경우 MySQLContainer 설정을 공통 Config로 분리하여, 각 테스트에서 Import해 사용
@TestConfiguration
public class MySqlTestContainerConfig {
    @Bean
    @ServiceConnection // // Spring이 컨테이너의 JDBC 접속 정보(url/user/pw/driver) 자동 파악 → @DynamicPropertySource 불필요
    MySQLContainer mySQLContainer(){
        return new MySQLContainer("mysql:8.0");
    }
}
