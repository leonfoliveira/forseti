package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import java.util.UUID

object ExecutionContextMockBuilder {
    fun build(
        contestId: UUID? = IdGenerator.getUUID(),
        memberId: UUID? = IdGenerator.getUUID(),
    ) {
        ExecutionContext.set(
            contestId = contestId,
            session = memberId?.let { SessionMockBuilder.build(member = MemberMockBuilder.build(id = memberId)).toResponseBodyDTO() },
        )
    }
}
