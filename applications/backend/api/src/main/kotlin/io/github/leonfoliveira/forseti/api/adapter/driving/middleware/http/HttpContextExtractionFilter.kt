package io.github.leonfoliveira.forseti.api.adapter.driving.middleware.http

import io.github.leonfoliveira.forseti.api.application.port.driving.session.FindSessionUseCase
import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.OffsetDateTime
import java.util.UUID

@Component
class HttpContextExtractionFilter(
    private val findSessionUseCase: FindSessionUseCase,
) : OncePerRequestFilter() {
    /**
     * Fill the RequestContext with relevant information from the HTTP request.
     */
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        logger.info("Started HttpAuthExtractionFilter")

        val ip =
            request.getHeader("X-Forwarded-For")
                ?: request.remoteAddr
        val sessionId = request.cookies?.find { it.name == "session_id" }?.value

        val context = RequestContext.getContext()

        context.ip = ip
        context.traceId = MDC.get("traceId")
        context.session = extractSession(sessionId)

        return filterChain.doFilter(request, response)
    }

    /**
     * Fetch the session from the database using the session ID from the cookie.
     *
     * @param sessionId The session ID from the cookie.
     * @return The session if found and valid, null otherwise.
     */
    private fun extractSession(sessionId: String?): Session? {
        if (sessionId == null) {
            logger.info("Invalid or missing session_id cookie")
            return null
        }
        if (sessionId.isBlank()) {
            logger.info("Blank session_id cookie")
            return null
        }

        val session =
            try {
                findSessionUseCase.findByIdNullable(UUID.fromString(sessionId))
            } catch (e: IllegalArgumentException) {
                logger.info("Invalid session_id format")
                return null
            }

        if (session == null) {
            logger.info("Could not find session")
            return null
        }
        if (session.expiresAt < OffsetDateTime.now()) {
            logger.info("Session expired")
            return null
        }

        logger.info("Finished extracting session")
        return session
    }
}
