package io.github.leonfoliveira.judge.common.util

import io.github.leonfoliveira.judge.common.domain.entity.Session
import io.github.leonfoliveira.judge.common.domain.model.SessionAuthentication
import org.springframework.security.core.context.SecurityContextHolder

object SessionUtil {
    fun getCurrent(): Session? {
        val authentication = SecurityContextHolder.getContext().authentication as? SessionAuthentication
        return authentication?.principal
    }
}
