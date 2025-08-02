package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.util.AuthorizationExtractor
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

        val accessToken = request.cookies.find { it.name == "access_token" }?.value
        authorizationExtractor.extractMember(accessToken)

        return filterChain.doFilter(request, response)
    }
}
