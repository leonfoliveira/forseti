package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import org.springframework.security.core.context.SecurityContextHolder

object AuthorizationContextUtil {
    fun get(): Authorization? {
        val authentication = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        return authentication?.principal
    }

    fun getMember(): AuthorizationMember? {
        val authentication = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        return authentication?.principal?.member
    }
}
