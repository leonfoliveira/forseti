package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.api.config.JwtAuthentication
import io.leonfoliveira.judge.core.domain.exception.UnauthorizedException
import io.leonfoliveira.judge.core.domain.model.Authorization
import org.springframework.security.core.context.SecurityContextHolder

object AuthorizationContextUtil {
    fun getAuthorization(): Authorization {
        val authentication = SecurityContextHolder.getContext().authentication as JwtAuthentication
        return authentication.principal ?: throw UnauthorizedException()
    }
}
