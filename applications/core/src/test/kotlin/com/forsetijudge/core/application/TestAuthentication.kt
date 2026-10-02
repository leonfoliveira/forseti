package com.forsetijudge.core.application

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockModelFactory
import org.springframework.security.core.context.SecurityContextHolder

object TestAuthentication {
    fun setMember(member: Member) {
        clear()
        SecurityContextHolder.getContext().authentication =
            SessionAuthentication(
                MockModelFactory.session(
                    member = MockModelFactory.sessionMember(member.id, member.type, member.name),
                ),
                "127.0.0.1",
            )
    }

    fun clear() {
        SecurityContextHolder.clearContext()
    }
}
