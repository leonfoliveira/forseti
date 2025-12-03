package com.forsetijudge.api.adapter.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig(
    @Value("\${spring.application.version}")
    private val version: String,
) {
    /**
     * Configures the OpenAPI documentation for the Forseti API.
     */
    @Bean
    fun openApi(): OpenAPI =
        OpenAPI()
            .info(
                Info()
                    .title("Forseti API")
                    .version(version)
                    .description("API for the Forseti application"),
            ).components(
                Components()
                    .addSecuritySchemes(
                        "session_id",
                        SecurityScheme()
                            .type(SecurityScheme.Type.APIKEY)
                            .`in`(SecurityScheme.In.COOKIE)
                            .name("session_id"),
                    ),
            )
}
