package com.forsetijudge.api.adapter.config

import com.forsetijudge.api.adapter.driving.http.middleware.HttpAuthenticationInterceptor
import com.forsetijudge.api.adapter.driving.http.middleware.HttpExecutionContextInterceptor
import com.forsetijudge.api.adapter.driving.http.middleware.HttpPrivateInterceptor
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@Suppress("unused")
class HttpConfig(
    @Value("\${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    private val httpExecutionContextInterceptor: HttpExecutionContextInterceptor,
    private val httpAuthenticationInterceptor: HttpAuthenticationInterceptor,
    private val httpPrivateInterceptor: HttpPrivateInterceptor,
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

    /**
     * Add interceptors to the registry in the order of execution:
     *
     * @param registry the interceptor registry to configure
     */
    override fun addInterceptors(registry: InterceptorRegistry) {
        // Interceptor to extract execution context (ip, traceId, contestId)
        registry.addInterceptor(httpExecutionContextInterceptor).order(1)
        // Interceptor to load session from cookie and set in the execution context
        registry.addInterceptor(httpAuthenticationInterceptor).order(2)
        // Interceptor to enforce @Private annotations
        registry.addInterceptor(httpPrivateInterceptor).order(3)
    }
}
