package io.github.leonfoliveira.judge.api.middleware.http

import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.domain.model.SessionAuthentication
import io.github.leonfoliveira.judge.common.repository.SessionRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.OffsetDateTime
import java.util.UUID
import kotlin.jvm.optionals.getOrElse

@Component
class HttpAuthExtractionFilter(
    private val sessionRepository: SessionRepository,
) : OncePerRequestFilter() {
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("Started HttpAuthExtractionFilter")

        val sessionId = request.cookies?.find { it.name == "session_id" }?.value
        val session = extractSession(sessionId)
        SecurityContextHolder.getContext().authentication = SessionAuthentication(session)
        return filterChain.doFilter(request, response)
    }

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
                sessionRepository.findById(UUID.fromString(sessionId)).getOrElse { null }
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
