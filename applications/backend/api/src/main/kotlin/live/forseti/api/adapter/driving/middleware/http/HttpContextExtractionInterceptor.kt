package live.forseti.api.adapter.driving.middleware.http

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import live.forseti.core.domain.entity.Session
import live.forseti.core.domain.exception.ForbiddenException
import live.forseti.core.domain.exception.UnauthorizedException
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.session.FindSessionUseCase
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.time.OffsetDateTime
import java.util.UUID

@Component
class HttpContextExtractionInterceptor(
    private val findSessionUseCase: FindSessionUseCase,
) : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Fill the RequestContext with relevant information from the HTTP request.
     */
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        val traceId = request.getHeader("X-Trace-Id") ?: UUID.randomUUID().toString()
        MDC.put("traceId", traceId)

        logger.info("Started HttpContextExtractionInterceptor")

        val ip =
            request.getHeader("X-Forwarded-For")
                ?: request.remoteAddr

        val sessionId = request.cookies?.find { it.name == "session_id" }?.value
        val csrfToken = request.getHeader("X-CSRF-Token")
        val session = extractSession(sessionId, csrfToken)

        val context = RequestContext.getContext()

        context.traceId = traceId
        context.ip = ip
        context.session = session

        logger.info("Finished HttpContextExtractionInterceptor")
        return true
    }

    /**
     * Fetch the session from the database using the session ID from the cookie.
     *
     * @param sessionId The session ID from the cookie.
     * @return The session if found and valid, null otherwise.
     */
    private fun extractSession(
        sessionId: String?,
        csrfToken: String?,
    ): Session? {
        if (sessionId == null) {
            logger.info("No session_id cookie")
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
            throw UnauthorizedException()
        }
        if (session.csrfToken.toString() != csrfToken) {
            logger.info("CSRF token mismatch")
            throw ForbiddenException()
        }
        if (session.expiresAt < OffsetDateTime.now()) {
            logger.info("Session expired")
            throw UnauthorizedException()
        }

        logger.info("Finished extracting session")
        return session
    }
}
