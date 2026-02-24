package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

@Component
class HttpAuthenticationInterceptor(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
) : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        val csrfAllowList =
            setOf(
                Regex("/v1/root:sign-in"),
                Regex("/v1/contests/[a-fA-F0-9-]+:sign-in"),
            )
    }

    /**
     * Fill the RequestContext with relevant information from the HTTP request.
     */
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        logger.info("Started HttpAuthenticationInterceptor")

        authenticate(request)

        logger.info("Finished HttpAuthenticationInterceptor")
        return true
    }

    /**
     * Fetch the session from the database using the session ID from the cookie.
     *
     * @param request The HTTP request containing the cookies and headers for authentication.
     * @return The session if found and valid, null otherwise.
     * @throw UnauthorizedException if the session is not found, expired, or does not belong to the current contest.
     * @throws ForbiddenException if the CSRF token is missing or does not match the session's CSRF token for non-GET requests that are not in the allow list.
     */
    private fun authenticate(request: HttpServletRequest) {
        val sessionId = request.cookies?.find { it.name == "session_id" }?.value

        if (sessionId == null) {
            logger.info("No session_id cookie. Continuing as guest.")
            return
        }
        if (sessionId.isBlank()) {
            logger.info("Blank session_id cookie. Continuing as guest.")
            return
        }

        val sessionUuid =
            try {
                UUID.fromString(sessionId)
            } catch (e: IllegalArgumentException) {
                throw UnauthorizedException("Invalid session_id cookie format")
            }

        val session =
            findSessionByIdUseCase.execute(
                FindSessionByIdUseCase.Command(sessionId = sessionUuid),
            )
        logger.info("Found session with id: $sessionId")

        val contextContextId = ExecutionContext.getContestIdNullable()
        if (contextContextId != session.contestId) {
            logger.info("Session does not belong to the current contest. Continuing as guest.")
            return
        }

        val isPathInCsrfAllowList = csrfAllowList.any { it.matches(request.requestURI) }
        if (request.method != HttpMethod.GET.toString() && !isPathInCsrfAllowList) {
            val csrfToken = request.getHeader("X-CSRF-Token")
            if (session.csrfToken.toString() != csrfToken) {
                logger.info("CSRF token mismatch")
                throw ForbiddenException()
            }
        }

        ExecutionContext.authenticate(session)
        logger.info("Finished authenticating successfully")
    }
}
