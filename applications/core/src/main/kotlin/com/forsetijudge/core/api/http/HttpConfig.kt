package com.forsetijudge.core.api.http

import com.forsetijudge.core.api.http.dto.response.ErrorResponseBodyDTO
import com.forsetijudge.core.api.http.middleware.AuthenticationFilter
import com.forsetijudge.core.api.http.middleware.SessionCsrfTokenRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import tools.jackson.databind.ObjectMapper

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Suppress("unused")
class HttpConfig(
    @Value($$"${server.cors.allowed-origins}")
    private val allowedOrigins: String,
    private val authenticationFilter: AuthenticationFilter,
    private val sessionCsrfTokenRepository: SessionCsrfTokenRepository,
    private val objectMapper: ObjectMapper,
) : WebMvcConfigurer {
    companion object {
        private val SIGN_IN_ROUTES =
            arrayOf(
                "/v1/root:sign-in",
                "/v1/contests/*:sign-in",
            )
    }

    /**
     * Spring Boot auto-registers any [jakarta.servlet.Filter] bean as a global servlet filter.
     * [AuthenticationFilter] must instead run only once, as part of the Spring Security filter
     * chain (see [securityFilterChain]), so its automatic registration is disabled here.
     */
    @Bean
    fun authenticationFilterRegistration(): FilterRegistrationBean<AuthenticationFilter> {
        val registration = FilterRegistrationBean(authenticationFilter)
        registration.isEnabled = false
        return registration
    }

    /**
     * Configure CORS to allow requests from the frontend application.
     *
     * @param registry the CORS registry to configure
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(*allowedOrigins.split(",").map { it.trim() }.toTypedArray())
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .exposedHeaders(HttpHeaders.CONTENT_DISPOSITION)
            .allowCredentials(true)
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain? {
        http
            .cors { }
            .sessionManagement { session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .csrf { csrf ->
                csrf
                    .csrfTokenRepository(sessionCsrfTokenRepository)
                    .csrfTokenRequestHandler(CsrfTokenRequestAttributeHandler())
                    .ignoringRequestMatchers(*SIGN_IN_ROUTES)
            }.authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/actuator/**",
                        "/metrics/**",
                        *SIGN_IN_ROUTES,
                        "/v1/contests/slug/*",
                        "/v1/contests/*/attachments/*",
                        "/v1/contests/*/dashboard/guest",
                    ).permitAll()
                    .anyRequest()
                    .authenticated()
            }.exceptionHandling { exceptionHandling ->
                exceptionHandling
                    .authenticationEntryPoint { _, response, _ ->
                        response.status = 401
                        response.contentType = MediaType.APPLICATION_JSON_VALUE
                        response.writer.write(objectMapper.writeValueAsString(ErrorResponseBodyDTO("Unauthorized")))
                    }.accessDeniedHandler { _, response, _ ->
                        response.status = 403
                        response.contentType = MediaType.APPLICATION_JSON_VALUE
                        response.writer.write(objectMapper.writeValueAsString(ErrorResponseBodyDTO("Forbidden")))
                    }
            }.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}
