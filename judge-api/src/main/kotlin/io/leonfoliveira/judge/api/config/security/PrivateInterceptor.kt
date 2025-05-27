package io.leonfoliveira.judge.api.config.security

import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

@Component
class PrivateInterceptor : HandlerInterceptor {
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        if (handler !is HandlerMethod) return true

        val privateAnnotation =
            handler.getMethodAnnotation(Private::class.java)
                ?: handler.beanType.getAnnotation(Private::class.java)
                ?: return true

        val auth = SecurityContextHolder.getContext().authentication as? JwtAuthentication
            ?: throw UnauthorizedException()

        if (!auth.isAuthenticated) throw UnauthorizedException()

        val principal = auth.principal
            ?: throw UnauthorizedException()

        if (privateAnnotation.allowed.isNotEmpty() &&
            principal.type !in privateAnnotation.allowed) {
            throw ForbiddenException()
        }

        return true
    }
}

