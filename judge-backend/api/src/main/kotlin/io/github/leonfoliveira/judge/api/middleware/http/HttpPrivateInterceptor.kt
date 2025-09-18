package io.github.leonfoliveira.judge.api.middleware.http

import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.model.SessionAuthentication
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

@Component
class HttpPrivateInterceptor : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
        val auth = SecurityContextHolder.getContext().authentication as? SessionAuthentication

        if (auth?.principal?.member?.type == Member.Type.ROOT) {
            logger.info("User is ROOT, bypassing access")
            return true
        }

        val privateAnnotation =
            handler.getMethodAnnotation(Private::class.java)
                ?: handler.beanType.getAnnotation(Private::class.java)

        if (privateAnnotation == null) {
            logger.info("No @Private annotation found, skipping access check")
            return true
        }

        if (privateAnnotation.allowed.isNotEmpty() &&
            auth?.principal?.member?.type !in privateAnnotation.allowed
        ) {
            logger.info("User type not allowed: ${auth?.principal?.member?.type}")
            throw ForbiddenException()
        }

        logger.info("User is allowed to access destination")
        return true
    }
}
