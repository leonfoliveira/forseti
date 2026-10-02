package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.domain.model.SessionAuthentication
import java.util.UUID
import org.springframework.security.core.context.SecurityContextHolder

object AuthenticationHelper {
    fun getCurrentSession(): Session {
        val authentication =
            SecurityContextHolder.getContext().authentication as? SessionAuthentication
                ?: throw UnauthorizedException("Not authenticated")
        return authentication.session
    }

    fun getCurrentSessionNullable(): Session? {
        val authentication =
            SecurityContextHolder.getContext().authentication as? SessionAuthentication
                ?: return null
        return authentication.session
    }

    fun getCurrentMemberId(): UUID = getCurrentSession().member.id

    fun getCurrentMemberIdNullable(): UUID? = getCurrentSessionNullable()?.member?.id
}
