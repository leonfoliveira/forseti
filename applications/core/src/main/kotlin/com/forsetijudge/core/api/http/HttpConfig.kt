package com.forsetijudge.core.api.http

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@Suppress("unused")
class HttpConfig(
    @Value("\${server.cors.allowed-origins}")
    private val allowedOrigins: String,
) : WebMvcConfigurer {
    /**
     * Configure CORS to allow requests from the frontend application.
     *
     * @param registry the CORS registry to configure
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .exposedHeaders(HttpHeaders.CONTENT_DISPOSITION)
            .allowCredentials(true)
    }
}
