package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import org.springframework.security.core.context.SecurityContextHolder

object SessionUtil {
    fun getCurrent(): Session? {
        val authentication = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        return authentication?.principal
    }
}
