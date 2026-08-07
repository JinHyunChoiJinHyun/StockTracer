package com.stocktracer.backend.global.config;

import org.apache.ibatis.mapping.DatabaseIdProvider;
import org.apache.ibatis.mapping.VendorDatabaseIdProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class MyBatisConfig {
    @Bean
    public DatabaseIdProvider databaseIdProvider(){
        VendorDatabaseIdProvider provider = new VendorDatabaseIdProvider();

        Properties properties = new Properties();
        // key: 실제 db, value: mapper에 사용된 별칭
        properties.setProperty("MySql", "mysql");
        properties.setProperty("Oracle", "oracle");

        provider.setProperties(properties);
        return provider;
    }
}
