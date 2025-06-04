package io.leonfoliveira.judge.api.config.security

import io.leonfoliveira.judge.core.port.JwtAdapter
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthFilter(
    private val jwtAdapter: JwtAdapter,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("Started JWT authentication filter")

        val authHeader: String? = request.getHeader("Authorization")
        val token = authHeader?.replace("Bearer ", "")

        if (authHeader == null || token == null || !authHeader.startsWith("Bearer ")) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("No JWT token found in request header")
            return filterChain.doFilter(request, response)
        }

        try {
            val authorization = jwtAdapter.decodeToken(token)
            SecurityContextHolder.getContext().authentication =
                JwtAuthentication(authorization)
            logger.info("Finished JWT authentication filter with authorization: $authorization")
        } catch (ex: Exception) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            logger.info("Could not decode JWT token")
        }

        return filterChain.doFilter(request, response)
    }
}
