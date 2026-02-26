package com.forsetijudge.api.adapter.driving.http.middleware

import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

@Component
class HttpExecutionContextInterceptor : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Fill the RequestContext with relevant information from the HTTP request.
     *
     * This interceptor should be executed before the HttpAuthenticationInterceptor,
     * so that the ExecutionContext is populated with the IP address and contestId before any authentication logic is applied.
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
        logger.info("Started HttpExecutionContextInterceptor")

        val contestIdFromPath = extractContestIdFromPath(request.requestURI)
        ExecutionContext.start(
            ip = request.getHeader("X-Forwarded-For") ?: request.remoteAddr,
            contestId = contestIdFromPath,
        )

        logger.info("Finished HttpExecutionContextInterceptor")
        return true
    }

    /**
     * Extract contestId from the request URI if present.
     *
     * @param requestURI The request URI.
     * @return The contestId as UUID if found, null otherwise.
     */
    private fun extractContestIdFromPath(requestURI: String): UUID? {
        // Match pattern /contests/{contestId}/... or /v1/contests/{contestId}/...
        val regex = Regex("(?:/v[0-9]+)?/contests/([a-fA-F0-9-]+).*")
        val matchResult = regex.find(requestURI)
        return matchResult?.groupValues?.get(1)?.let {
            try {
                UUID.fromString(it)
            } catch (_: IllegalArgumentException) {
                null
            }
        }
    }
}
