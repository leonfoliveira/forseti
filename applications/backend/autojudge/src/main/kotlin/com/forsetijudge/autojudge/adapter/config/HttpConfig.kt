package com.forsetijudge.autojudge.adapter.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
@EnableWebSecurity
class HttpConfig : WebMvcConfigurer {
    /**
     * Security filter chain configuration.
     * Allow all requests.
     * AutoJudge service only exposes health and metrics endpoints.
     */
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain =
        http
            // There is no private endpoints in AutoJudge service
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            // There is no write operations in AutoJudge service, so CSRF protection is not needed
            .csrf { it.disable() }
            // Session management is handled manually
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.NEVER) }
            .build()
}
