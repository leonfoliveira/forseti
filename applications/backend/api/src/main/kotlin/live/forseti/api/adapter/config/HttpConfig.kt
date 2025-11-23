package live.forseti.api.adapter.config

import live.forseti.api.adapter.driving.middleware.http.HttpContextExtractionFilter
import live.forseti.api.adapter.driving.middleware.http.HttpPrivateInterceptor
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
class HttpConfig(
    @Value("\${server.cors.allowed-origins}")
    val allowedOrigins: String,
    private val httpContextExtractionFilter: HttpContextExtractionFilter,
    private val httpPrivateInterceptor: HttpPrivateInterceptor,
) : WebMvcConfigurer {
    /**
     * Configure CORS to allow requests from the frontend application.
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry
            .addMapping("/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("*")
            .exposedHeaders(HttpHeaders.CONTENT_DISPOSITION)
            .allowCredentials(true)
    }

    /**
     * Configure the security filter chain.
     * Disable default spring security authentication.
     * It will be handled by the custom interceptor [HttpPrivateInterceptor]
     * using @Private annotations on controller level.
     */
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain =
        http
            // Authorization protection is handled by the HttpPrivateInterceptor
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            // CSRF protection is handled by the HttpContextExtractionFilter
            .csrf { it.disable() }
            // Session management is handled manually
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.NEVER) }
            // Filter to extract context (ip, traceId, session) from HTTP requests
            .addFilterAfter(httpContextExtractionFilter, BasicAuthenticationFilter::class.java)
            .build()

    override fun addInterceptors(registry: InterceptorRegistry) {
        // Interceptor to enforce @Private annotations
        registry.addInterceptor(httpPrivateInterceptor)
    }
}
