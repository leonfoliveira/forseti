package io.github.leonfoliveira.forseti.api.middleware.http

import io.github.leonfoliveira.forseti.api.util.Private
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
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
        val session = RequestContext.getContext().session

        // ROOT users bypass all checks
        if (session?.member?.type == Member.Type.ROOT) {
            logger.info("User is ROOT, bypassing access")
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

        // If @Private is present without allowed types, any authenticated user can access
        if (privateAnnotation.allowed.isEmpty() && session == null) {
            logger.info("No session found")
            throw UnauthorizedException()
        }

        // If @Private has allowed types, check if the user's type is in the allowed list
        if (privateAnnotation.allowed.isNotEmpty() &&
            session?.member?.type !in privateAnnotation.allowed
        ) {
            logger.info("User type not allowed: ${session?.member?.type}")
            throw ForbiddenException()
        }

        logger.info("User is allowed to access destination")
        return true
    }
}
