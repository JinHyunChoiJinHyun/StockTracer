package com.stocktracer.backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mysql.MySQLContainer;

@TestConfiguration
public class MySqlTestContainerConfig {
    @Bean
    @ServiceConnection
    MySQLContainer mySQLContainer(){
        return new MySQLContainer("mysql:8.0");
    }
}
