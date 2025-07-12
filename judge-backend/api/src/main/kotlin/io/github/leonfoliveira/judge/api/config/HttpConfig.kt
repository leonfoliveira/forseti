package io.github.leonfoliveira.judge.api.config

import io.github.leonfoliveira.judge.api.security.http.HttpJwtAuthFilter
import io.github.leonfoliveira.judge.api.security.http.HttpPrivateInterceptor
import io.github.leonfoliveira.judge.common.util.GeneratedSkipCoverage
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
@GeneratedSkipCoverage
class HttpConfig(
    @Value("\${server.cors.allowed-origins}")
    val allowedOrigins: String,
    private val httpJwtAuthFilter: HttpJwtAuthFilter,
    private val httpPrivateInterceptor: HttpPrivateInterceptor,
) : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("*")
            .exposedHeaders(HttpHeaders.CONTENT_DISPOSITION)
            .allowCredentials(true)
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .addFilterAfter(httpJwtAuthFilter, BasicAuthenticationFilter::class.java)
            .build()
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(httpPrivateInterceptor)
    }
}
