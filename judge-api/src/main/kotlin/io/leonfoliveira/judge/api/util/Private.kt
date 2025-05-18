package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.api.config.JwtAuthentication
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Private(vararg val allowed: Member.Type = [])

@Aspect
@Component
class PrivateAspect {
    @Before("@annotation(privateAnnotation)")
    fun checkAuthorization(privateAnnotation: Private) {
        val authentication = SecurityContextHolder.getContext().authentication as JwtAuthentication
        if (!authentication.isAuthenticated) {
            throw UnauthorizedException()
        }
        if (privateAnnotation.allowed.isNotEmpty() && authentication.principal?.type !in privateAnnotation.allowed) {
            throw ForbiddenException()
        }
    }
}
