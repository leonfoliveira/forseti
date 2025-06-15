package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.core.domain.exception.UnauthorizedException
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
        logger.info("Started PrivateHttpInterceptor")

        if (handler !is HandlerMethod) {
            logger.info("Handler is not a HandlerMethod")
            return true
        }

        val privateAnnotation =
            handler.getMethodAnnotation(Private::class.java)
                ?: handler.beanType.getAnnotation(Private::class.java)
        if (privateAnnotation == null) {
            logger.info("No Private annotation found on handler method or bean type")
            return true
        }

        val auth = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        if (auth == null || !auth.isAuthenticated || auth.principal == null) {
            logger.info("Not authenticated")
            throw UnauthorizedException()
        }

        if (privateAnnotation.allowed.isNotEmpty() &&
            auth.principal?.type !in privateAnnotation.allowed
        ) {
            logger.info("User type not allowed: ${auth.principal?.type}")
            throw ForbiddenException()
        }

        logger.info("User is authenticated and allowed")
        return true
    }
}
