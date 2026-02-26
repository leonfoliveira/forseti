package com.forsetijudge.api.adapter.driving.http.middleware

import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.model.ExecutionContext
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

@Component
class HttpPrivateInterceptor : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Checks if the incoming request has access to the destination based on the @Private annotation.
     *
     * @param request The HTTP request.
     * @param response The HTTP response.
     * @param handler The handler for the request, which can be a HandlerMethod.
     * @return true to continue processing the request, false to abort.
     */
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        logger.info("Started PrivateHttpInterceptor for path: ${request.requestURI}")
        if (handler !is HandlerMethod) {
            logger.info("Handler is not a HandlerMethod")
            return true
        }

        val privateAnnotation =
            handler.getMethodAnnotation(Private::class.java)
                ?: handler.beanType.getAnnotation(Private::class.java)

        // If no @Private annotation is present, the endpoint is public
        if (privateAnnotation == null) {
            logger.info("No @Private annotation found, skipping access check")
            return true
        }

        // Otherwise, check if the user has a valid session and is of an allowed member type
        val memberType = ExecutionContext.getMember().type
        if (memberType !in privateAnnotation.allowed) {
            logger.info("Member type not allowed: $memberType")
            throw ForbiddenException("Member type $memberType is not allowed to access this resource")
        }

        logger.info("Member is allowed to access destination")
        return true
    }
}
