package io.leonfoliveira.judge.api.security.http

import io.leonfoliveira.judge.api.util.AuthorizationExtractor
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class HttpJwtAuthFilter(
    private val authorizationExtractor: AuthorizationExtractor,
) : OncePerRequestFilter() {
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("Started JWT authentication filter")

        val authHeader = request.getHeader("Authorization")
        authorizationExtractor.extractMember(authHeader)

        return filterChain.doFilter(request, response)
    }
}
