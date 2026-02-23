package com.forsetijudge.api.adapter.driving.middleware.http

import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

@Component
class HttpContextExtractionInterceptor(
    private val sessionCache: SessionCache,
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
) : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        val csrfAllowList =
            setOf(
                Regex("/api/v1/root:sign-in"),
                Regex("/api/v1/contests/[a-fA-F0-9-]+:sign-in"),
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
        val contestIdFromPath = extractContestIdFromPath(request.requestURI)
        ExecutionContext.set(
            ip = request.getHeader("X-Forwarded-For") ?: request.remoteAddr,
            contestId = contestIdFromPath,
        )

        logger.info("Started HttpContextExtractionInterceptor")

        var session = extractSession(request.cookies)

        /**
         * If the path is associated with a specific contest, ensure the session's contest matches
         * the contest in the path. If not, invalidate the session.
         * If the session has no contest, it is valid for all contests.
         */
        if (contestIdFromPath != null && session != null) {
            val sessionContestId = session.contestId ?: session.contest?.id
            if (sessionContestId != null && sessionContestId != contestIdFromPath) {
                logger.info("Session contest ID does not match path contest ID")
                session = null
            }
        }

        // CSRF Protection
        val isPathInCsrfAllowList = csrfAllowList.any { it.matches(request.requestURI) }
        if (request.method != HttpMethod.GET.toString() && !isPathInCsrfAllowList) {
            val csrfToken = request.getHeader("X-CSRF-Token")
            if (session != null && session.csrfToken.toString() != csrfToken) {
                logger.info("CSRF token mismatch")
                throw ForbiddenException()
            }
        }

        ExecutionContext.setSession(session)

        logger.info("Finished HttpContextExtractionInterceptor")
        return true
    }

    /**
     * Fetch the session from the database using the session ID from the cookie.
     *
     * @param cookies The cookies from the HTTP request.
     * @return The session if found and valid, null otherwise.
     */
    private fun extractSession(cookies: Array<Cookie>?): Session? {
        val sessionId = cookies?.find { it.name == "session_id" }?.value

        if (sessionId == null) {
            logger.info("No session_id cookie")
            return null
        }
        if (sessionId.isBlank()) {
            logger.info("Blank session_id cookie")
            return null
        }

        val sessionUuid =
            try {
                UUID.fromString(sessionId)
            } catch (e: IllegalArgumentException) {
                logger.info("Invalid session_id format")
                return null
            }

        val session =
            try {
                findSessionByIdUseCase.execute(
                    FindSessionByIdUseCase.Command(sessionId = sessionUuid),
                )
            } catch (e: NotFoundException) {
                logger.info("Could not find session")
                throw UnauthorizedException()
            }

        if (session.expiresAt < ExecutionContext.getStartAt()) {
            logger.info("Session expired")
            throw UnauthorizedException()
        }

        logger.info("Finished extracting session")
        return session
    }

    /**
     * Extract contestId from the request URI if present.
     *
     * @param requestURI The request URI.
     * @return The contestId as UUID if found, null otherwise.
     */
    private fun extractContestIdFromPath(requestURI: String): UUID? {
        // Match pattern /contests/{contestId}/... or /api/v1/contests/{contestId}/...
        val regex = Regex("(?:/api/v[0-9]+)?/contests/([a-fA-F0-9-]+).*")
        val matchResult = regex.find(requestURI)
        return matchResult?.groupValues?.get(1)?.let {
            try {
                UUID.fromString(it)
            } catch (e: IllegalArgumentException) {
                null
            }
        }
    }
}
