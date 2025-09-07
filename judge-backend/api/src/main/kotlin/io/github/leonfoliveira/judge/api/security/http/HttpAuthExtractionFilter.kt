package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.port.JwtAdapter
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class HttpAuthExtractionFilter(
    private val jwtAdapter: JwtAdapter,
) : OncePerRequestFilter() {
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("Started HttpAuthExtractionFilter")

        val accessToken = request.cookies?.find { it.name == "access_token" }?.value

        if (accessToken == null) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Invalid or missing auth header")
            return filterChain.doFilter(request, response)
        }

        if (accessToken.isBlank()) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("No JWT token found in auth header")
            return filterChain.doFilter(request, response)
        }

        try {
            val authorization = jwtAdapter.decodeToken(accessToken)
            logger.info("Finished extracting Authorization: $authorization")
            SecurityContextHolder.getContext().authentication = JwtAuthentication(authorization)
            return filterChain.doFilter(request, response)
        } catch (ex: Exception) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Could not decode JWT token")
        }

        return filterChain.doFilter(request, response)
    }
}
