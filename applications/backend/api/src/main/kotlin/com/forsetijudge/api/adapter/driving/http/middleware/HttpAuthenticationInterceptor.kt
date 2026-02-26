package com.forsetijudge.api.adapter.driving.http.middleware

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

@Component
class HttpAuthenticationInterceptor(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
) : HandlerInterceptor {
    private val logger = SafeLogger(this::class)

    companion object {
        val csrfAllowList =
            setOf(
                Regex("/v1/root:sign-in"),
                Regex("/v1/contests/[a-fA-F0-9-]+:sign-in"),
            )
    }

    /**
     * Authenticate the user based on the session_id cookie.
     * If the session is valid, populate the RequestContext with the session information.
     * If the session is invalid or missing, continue as guest (no authentication) but do not throw an error, as some endpoints may allow guest access.
     *
     * @param request The HTTP request.
     * @param response The HTTP response.
     * @param handler The handler for the request.
     * @return true to continue processing the request, false to abort.
     */
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        logger.info("Started HttpAuthenticationInterceptor")

        val sessionId = request.cookies?.find { it.name == "session_id" }?.value

        if (sessionId == null) {
            logger.info("No session_id cookie. Continuing as guest.")
            return true
        }
        if (sessionId.isBlank()) {
            logger.info("Blank session_id cookie. Continuing as guest.")
            return true
        }

        val sessionUuid =
            try {
                UUID.fromString(sessionId)
            } catch (_: IllegalArgumentException) {
                throw UnauthorizedException("Invalid session_id cookie format")
            }

        val session =
            findSessionByIdUseCase.execute(
                FindSessionByIdUseCase.Command(sessionId = sessionUuid),
            )
        logger.info("Found session with id: $sessionId")

        val contextContextId = ExecutionContext.getContestIdNullable()
        if (contextContextId != null && contextContextId != session.contest?.id) {
            logger.info("Session does not belong to the current contest. Continuing as guest.")
            return true
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
        return true
    }
}
