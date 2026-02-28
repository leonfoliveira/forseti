package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import java.time.OffsetDateTime
import java.util.UUID

object ExecutionContextMockBuilder {
    fun build(
        contestId: UUID? = IdGenerator.getUUID(),
        memberId: UUID? = IdGenerator.getUUID(),
        startAt: OffsetDateTime = OffsetDateTime.now(),
    ) {
        ExecutionContext.start(
            contestId = contestId,
            startedAt = startAt,
        )
        val contest = contestId?.let { ContestMockBuilder.build(id = contestId) }
        val member = memberId?.let { MemberMockBuilder.build(id = memberId, contest = contest) }
        val session = member?.let { SessionMockBuilder.build(member = member) }
        if (session != null) {
            ExecutionContext.setSession(session.toResponseBodyDTO())
        }
    }
}
