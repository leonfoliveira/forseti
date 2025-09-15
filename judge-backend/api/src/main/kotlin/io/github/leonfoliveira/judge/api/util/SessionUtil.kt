package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.SessionAuthentication
import io.github.leonfoliveira.judge.common.domain.entity.Session
import org.springframework.security.core.context.SecurityContextHolder

object SessionUtil {
    fun getCurrent(): Session? {
        val authentication = SecurityContextHolder.getContext().authentication as? SessionAuthentication
        return authentication?.principal
    }
}
