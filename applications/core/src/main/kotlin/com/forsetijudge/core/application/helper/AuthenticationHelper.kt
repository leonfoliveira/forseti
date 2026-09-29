package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import java.util.UUID
import org.springframework.security.core.context.SecurityContextHolder

object AuthenticationHelper {
    fun getCurrentSession(): SessionResponseBodyDTO {
        val authentication =
            SecurityContextHolder.getContext().authentication as? SessionAuthentication
                ?: throw UnauthorizedException("Not authenticated")
        return authentication.session
    }

    fun getCurrentSessionNullable(): SessionResponseBodyDTO? {
        val authentication =
            SecurityContextHolder.getContext().authentication as? SessionAuthentication
                ?: return null
        return authentication.session
    }

    fun getCurrentMemberId(): UUID = getCurrentSession().member.id

    fun getCurrentMemberIdNullable(): UUID? = getCurrentSessionNullable()?.member?.id
}
