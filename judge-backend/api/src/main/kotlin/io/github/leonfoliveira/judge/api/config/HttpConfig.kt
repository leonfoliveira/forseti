package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.api.middleware.http.HttpAuthExtractionFilter
import io.github.leonfoliveira.judge.api.middleware.http.HttpPrivateInterceptor
import io.github.leonfoliveira.judge.api.middleware.http.HttpRateLimitInterceptor
import io.github.leonfoliveira.judge.api.middleware.http.HttpRequestContextFilter
import io.github.leonfoliveira.judge.common.util.SkipCoverage
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@EnableWebSecurity
@SkipCoverage
class HttpConfig(
    @Value("\${server.cors.allowed-origins}")
    val allowedOrigins: String,
    private val httpRequestContextFilter: HttpRequestContextFilter,
    private val httpAuthExtractionFilter: HttpAuthExtractionFilter,
    private val httpPrivateInterceptor: HttpPrivateInterceptor,
    private val httpRateLimitInterceptor: HttpRateLimitInterceptor,
) : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("*")
            .exposedHeaders(HttpHeaders.CONTENT_DISPOSITION)
            .allowCredentials(true)
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain =
        http
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .addFilterBefore(httpRequestContextFilter, BasicAuthenticationFilter::class.java)
            .addFilterAfter(httpAuthExtractionFilter, BasicAuthenticationFilter::class.java)
            .build()

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(httpRateLimitInterceptor).order(0)
        registry.addInterceptor(httpPrivateInterceptor).order(1)
    }
}
