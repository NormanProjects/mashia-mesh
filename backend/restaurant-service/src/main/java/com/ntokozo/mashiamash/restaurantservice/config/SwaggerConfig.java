package com.ntokozo.mashiamash.restaurantservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MashiaMesh Restaurant Service API")
                        .description("Manages restaurants, menus and owner operations")
                        .version("1.0.0"));
    }
}