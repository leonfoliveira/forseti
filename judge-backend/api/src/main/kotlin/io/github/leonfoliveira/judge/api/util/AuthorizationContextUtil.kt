package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import org.springframework.security.core.context.SecurityContextHolder

object AuthorizationContextUtil {
    fun getAuthorization(): AuthorizationMember {
        val authentication = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        return authentication?.principal ?: throw UnauthorizedException()
    }
}
