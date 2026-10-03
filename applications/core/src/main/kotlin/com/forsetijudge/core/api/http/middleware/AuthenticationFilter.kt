package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import com.forsetijudge.core.util.SafeLogger
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.WebUtils
import java.util.UUID

/**
 * Reads the "session_id" cookie from the incoming request, resolves the associated session and,
 * when valid, populates both the Spring Security context.
 *
 * Requests without a session cookie, or with an invalid/expired one, are simply left
 * unauthenticated instead of failing, so that authorization (permitAll / authenticated) rules
 * declared in HttpConfig can decide how to handle them.
 */
@Component
class AuthenticationFilter(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) : OncePerRequestFilter() {
    val safeLogger = SafeLogger(this::class)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        safeLogger.info("Starting authentication filter for request: ${request.method} ${request.requestURI}")

        try {
            val sessionId = WebUtils.getCookie(request, SessionCookieBuilder.SESSION_COOKIE_NAME)?.value
            val ip = request.getHeader("X-Forwarded-For") ?: request.remoteAddr

            if (sessionId != null) {
                safeLogger.info("Found session cookie with ID: $sessionId, attempting to resolve session.")

                val sessionUuid =
                    try {
                        UUID.fromString(sessionId)
                    } catch (_: IllegalArgumentException) {
                        throw UnauthorizedException("Invalid session ID format: $sessionId")
                    }
                val session =
                    findSessionByIdUseCase.execute(
                        FindSessionByIdUseCase.Command(
                            sessionId = sessionUuid,
                        ),
                    )

                val authentication =
                    SessionAuthentication(
                        session = session,
                        ip = ip,
                    )

                SecurityContextHolder.createEmptyContext()
                SecurityContextHolder.getContext().authentication = authentication
            } else {
                safeLogger.info("No session cookie found, proceeding without authentication.")
            }

            filterChain.doFilter(request, response)
        } catch (ex: UnauthorizedException) {
            val sessionCookie = sessionCookieBuilder.buildCleanCookie()
            val csrfCookie = csrfCookieBuilder.buildCleanCookie()
            response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie)
            response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie)
            throw ex
        } finally {
            SecurityContextHolder.clearContext()
        }
    }
}
