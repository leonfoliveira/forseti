package io.leonfoliveira.judge.api.config

import io.leonfoliveira.judge.core.port.JwtAdapter
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Configuration
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

@Configuration
class JwtAuthFilter(
    private val jwtAdapter: JwtAdapter,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authHeader: String? = request.getHeader("Authorization")
        val token = authHeader?.replace("Bearer ", "")

        if (authHeader == null || token == null || !authHeader.startsWith("Bearer ")) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            return filterChain.doFilter(request, response)
        }

        try {
            val authorization = jwtAdapter.decodeToken(token)

            SecurityContextHolder.getContext().authentication =
                JwtAuthentication(
                    principal = authorization,
                    isAuthenticated = true,
                )
            return filterChain.doFilter(request, response)
        } catch (ex: Exception) {
            SecurityContextHolder.getContext().authentication = JwtAuthentication()
            return filterChain.doFilter(request, response)
        }
    }
}
