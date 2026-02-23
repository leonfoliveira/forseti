package com.forsetijudge.core.domain.model

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
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
        if (memberId != null) {
            ExecutionContext.authenticate(
                SessionMockBuilder.build(
                    contest = contestId?.let { ContestMockBuilder.build(id = contestId) },
                    member = MemberMockBuilder.build(id = memberId),
                ),
            )
        }
    }
}
